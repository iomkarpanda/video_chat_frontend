'use client'
import { Input } from '@/Components/ui/input'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/Components/ui/button'
import Chat from '@/Components/Chat'
import { extractYouTubeVideoId, processVideo } from '@/lib/video-chat-api'
import { useAuth } from '@/lib/auth-context'

const page = () => {
    const { isLoggedIn, isLoading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.replace('/login')
        }
    }, [isLoggedIn, authLoading, router])
    const [url, setUrl] = useState("");
    const [videoId, setId] = useState("");
    const [transcriptReady, setTranscriptReady] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [processingStatus, setProcessingStatus] = useState("")
    const [error, setError] = useState("")
    const [provider, setProvider] = useState<'ollama' | 'gemini'>('gemini')

    const STORAGE_KEY = 'video_chat_last_state'

    // Restore last video/provider when the user comes back to this page
    useEffect(() => {
      if (typeof window === 'undefined') return
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw) as { videoId?: string; provider?: 'ollama' | 'gemini' }
        if (parsed.videoId) {
          setId(parsed.videoId)
          setTranscriptReady(true)
        }
        if (parsed.provider === 'gemini' || parsed.provider === 'ollama') {
          setProvider(parsed.provider)
        }
      } catch {
        // ignore parse errors
      }
    }, [])

    function persistState(nextVideoId: string, nextProvider: 'ollama' | 'gemini') {
      if (typeof window === 'undefined') return
      try {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ videoId: nextVideoId, provider: nextProvider })
        )
      } catch {
        // ignore storage errors
      }
    }

    async function handleProcessVideo(extractedId: string) {
      setIsLoading(true)
      setError("")
      setProcessingStatus("Processing video transcript...")
      
      try {
        const response = await processVideo({
          source_url: extractedId,
          llm_provider: provider,
        })

        const processedId = response.data?.video_id || extractedId
        setId(processedId)
        setTranscriptReady(true)
  persistState(processedId, provider)

        if (response.data?.status === 'already_processed') {
          setProcessingStatus(`Video is already processed. You can start chatting now.`)
        } else {
          setProcessingStatus(`Video processed successfully. You can start chatting now.`)
        }
      } catch(error: any) {
        setError(error.message || "Failed to process video")
        setProcessingStatus("")
        setTranscriptReady(false)
      } finally {
        setIsLoading(false)
      }
    }

    function handleUrl() {
      setError("")
      setProcessingStatus("")

      const Id = extractYouTubeVideoId(url)
      
      if (Id) {
        setId(Id)
        handleProcessVideo(Id)
      } else {
        setId("")
        setTranscriptReady(false)
        setError("Could not extract video ID. Please check the URL.")
      }
    }

    if (authLoading || !isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center w-full flex-1 bg-gray-50">
                <p className="text-gray-600">Loading...</p>
            </div>
        )
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
      

      {/* Status Messages: only show if not transcriptReady or still loading */}
      {processingStatus && (!transcriptReady || isLoading) && (
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
        <Chat
          videoId={videoId}
          transcriptReady={transcriptReady}
          provider={provider}
          onProviderChange={setProvider}
          providerDisabled={isLoading}
        />
      </div>
    </div>
  )
}

export default page