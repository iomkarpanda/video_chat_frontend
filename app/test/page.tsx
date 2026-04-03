'use client'
import React, { useState } from 'react'
import Navbar from '@/Components/Navbar'
import Hero from '@/Components/Hero'
import Chat from '@/Components/Chat'

const page = () => {
  const [provider, setProvider] = useState<'gemini' | 'ollama'>('gemini')

  return (
   <div className='w-screen h-screen flex flex-col justify-center items-center bg-gray-50'>
        {/* <Navbar/>
        <Hero/> */}
        <Chat
          videoId="dQw4w9WgXcQ"
          transcriptReady={true}
          provider={provider}
          onProviderChange={setProvider}
        />
   </div>
  )
}

export default page
