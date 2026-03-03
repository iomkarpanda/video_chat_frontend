'use client'
import React from 'react'
import Navbar from '@/Components/Navbar'
import Hero from '@/Components/Hero'
const page = () => {

  return (
   <div className='w-screen h-screen flex flex-col justify-center items-center'>
        <Navbar/>
        <Hero/>
   </div>
  )
}

export default page