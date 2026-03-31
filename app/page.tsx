'use client'
import Navbar from '@/Components/Navbar'
import Hero from '@/Components/Hero'
import Footer from '@/Components/Footer'
import { Button } from '@/Components/ui/button'
import Link from 'next/link'


const page = () => {
  return (

    <div className='h-screen flex flex-col items-center justify-between '>
      <Navbar/>
      <Hero/>
    </div>

  )
}

export default page