'use client'
import { Input } from '@/Components/ui/input'
import { useState } from 'react'
import { Button } from '@/Components/ui/button'
import axios from "axios"
import Chat from '@/Components/Chat'

const page = () => {
    const [url, setUrl] = useState("");
    const [videoId, setId] = useState("");
    const [transcript,setTranscipt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [processingStatus, setProcessingStatus] = useState("")
    const [error, setError] = useState("")

    async function processVideo(id: string) {
      setIsLoading(true)
      setError("")
      setProcessingStatus("Starting video processing pipeline...")
      
      try {
        console.log(`Processing video: ${id}`)
        setProcessingStatus("Downloading audio and transcribing...")
        
        const res = await axios.post(
          "http://127.0.0.1:8000/transcript/get/",
          { video_id: id },
          { headers: { "Content-Type": "application/json" } }
        )
        
        console.log("Pipeline result:", res.data)
        
        if (res.data.data?.status === "completed") {
          setProcessingStatus("✓ Video processed successfully! Pipeline complete.")
          setTranscipt(res.data)
          
          // Log pipeline details
          const steps = res.data.data.steps
          console.log("Pipeline steps completed:")
          if (steps.download_audio?.status === "success") console.log("✓ Audio downloaded")
          if (steps.transcription?.status === "success") console.log("✓ Transcription complete")
          if (steps.chunking?.status === "success") console.log(`✓ Chunked into ${steps.chunking.num_chunks} pieces`)
          if (steps.embeddings?.status === "success") console.log(`✓ Generated ${steps.embeddings.num_embeddings} embeddings`)
          if (steps.vector_storage?.status === "success") console.log(`✓ Stored in vector database`)
          
          // Hide success message after 2 seconds
          setTimeout(() => {
            setProcessingStatus("")
          }, 2000)
        } else {
          setError("Pipeline did not complete successfully")
          setProcessingStatus("")
          console.error("Pipeline failed:", res.data)
        }
      } catch(error: any) {
        console.error("Error processing video:", error)
        setError(error.response?.data?.error || error.message || "Failed to process video")
        setProcessingStatus("")
      } finally {
        setIsLoading(false)
      }
    }

    function handleUrl() {
      let Id = "";
      setError("")
      setProcessingStatus("")

      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtube.com")) {
          Id = urlObj.searchParams.get("v") || "";
        } else if (urlObj.hostname.includes("youtu.be")) {
          Id = urlObj.pathname.slice(1);
        }
      } catch {
        if (url.includes("v=")) {
          Id = url.split("v=").pop()?.split("&")[0] || "";
        } else if (url.includes("youtu.be/")) {
          Id = url.split("youtu.be/").pop()?.split("?")[0] || "";
        }
      }
      
      if (Id) {
        setId(Id);
        // Automatically process the video
        processVideo(Id)
      } else {
        setError("Could not extract video ID. Please check the URL.")
      }
    }

  return (
    <div className='flex flex-col items-center w-full flex-1 bg-gray-50'>
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mt-10 mb-6 px-4">
        <Input
          placeholder='Enter the YouTube Link'
          className='w-40 sm:w-64 md:w-80 text-xs sm:text-sm'
          value={url}
          onChange={(e)=> setUrl(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          onClick={handleUrl} 
          className='h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap'
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Load Video"}
        </Button>
      </div>
      
      {/* Status Messages */}
      {processingStatus && (
        <div className="w-full max-w-6xl px-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          {processingStatus}
        </div>
      )}

      {error && (
        <div className="w-full max-w-6xl px-4 mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {error}
        </div>
      )}
      
      <div className="chat-div flex flex-col lg:flex-row justify-center items-center gap-6 w-full max-w-6xl px-4">
        <div className="first-div w-full lg:w-1/2 min-h-75 flex justify-center items-center">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="block w-full max-w-130 aspect-video rounded-lg shadow-lg mx-auto"
            ></iframe>
          ) : (
            <div className='text-gray-500 flex items-center justify-center w-full max-w-130 h-75 mx-auto'>Enter a valid YouTube link and click Load Video</div>
          )}
        </div>
        {transcript ? (
          <Chat />
        ) : (
          <div className="chat-area w-full lg:w-1/2 max-w-130 min-h-100 bg-white rounded-lg shadow-lg p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-2">
              <div className="text-gray-400 text-center mt-20">
                {isLoading ? "Processing video..." : "Chat area (ready when video is processed)"}
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" disabled />
              <Button disabled>Send</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page