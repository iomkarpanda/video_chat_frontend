'use client'
import { Input } from '@/Components/ui/input'
import { useState } from 'react'
import { Button } from '@/Components/ui/button'
import axios from "axios"

const page = () => {
    const [url, setUrl] = useState("");
    const [videoId, setId] = useState("");
    const [transcript,setTranscipt] = useState("")

    async function getTranscript(id:string){
      try{
        const res = await axios.post("http://127.0.0.1:8000/transcript/get/",{video_id:id},{headers: {"Content-Type": "application/json"}})
        setTranscipt(res.data)
        console.log(transcript)
        }
      catch(error){
        console.log(error)
      }
      
    }

    function handleUrl() {
      let Id = "";

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
      setId(Id);
      getTranscript(videoId)
    }

  return (
    <div className='flex flex-col items-center w-full flex-1 bg-gray-50'>
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mt-10 mb-6 px-4">
        <Input
          placeholder='Enter the YouTube Link'
          className='w-40 sm:w-64 md:w-80 text-xs sm:text-sm'
          value={url}
          onChange={(e)=> setUrl(e.target.value)}
        />
        <Button onClick={handleUrl} className='h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap'>Load Video</Button>
      </div>
      
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
        <div className="chat-area w-full lg:w-1/2 max-w-130 min-h-100 bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-2">
            {/* Chat messages will go here */}
            <div className="text-gray-400 text-center mt-20">Chat area (coming soon)</div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Type a message..." className="flex-1" disabled />
            <Button disabled>Send</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page