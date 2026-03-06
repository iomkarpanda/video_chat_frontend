'use client'
import React from 'react'
import Navbar from '@/Components/Navbar'
import Hero from '@/Components/Hero'
import Chat from '@/Components/Chat'

const page = () => {

  return (
   <div className='w-screen h-screen flex flex-col justify-center items-center bg-gray-50'>
        {/* <Navbar/>
        <Hero/> */}
        <Chat/>
   </div>
  )
}

export default page