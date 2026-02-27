'use client'
import { Input } from '@/Components/ui/input'
import React from 'react'
import Navbar from '@/Components/Navbar'
import { useState } from 'react'
import { Button } from '@/Components/ui/button'

const page = () => {
    const [url, setUrl] = useState("");
    const [videoId, setId] = useState("");

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
    }

  return (
    <div className='flex flex-col items-center min-h-screen bg-gray-50'>
      <Navbar />
      <Input
        placeholder='Enter the YouTube Link'
        className='w-sm mt-4 mb-4'
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <Button className='mb-4' onClick={handleUrl}>Load Video</Button>
      <div className="flex flex-row justify-start items-start gap-8 w-full max-w-6xl pl-8">
        <div className="flex-1 flex justify-end">
          {videoId ? (
            <iframe
              width="720"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="rounded-lg shadow-lg"
            ></iframe>
          ) : (
            <div className='text-gray-500 flex items-center justify-center h-full'>Enter a valid YouTube link and click Load Video</div>
          )}
        </div>
        <div className="chat-area w-[550px] min-h-[400px] bg-white rounded-lg shadow-lg p-4 flex flex-col ml-8">
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