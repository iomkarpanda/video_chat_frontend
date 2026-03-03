'use client'
import React from 'react'
import Navbar from '@/Components/Navbar'
type Childerenprop ={
    children:React.ReactNode
}

const AppLayout = ({children}:Childerenprop) => {
  return (
    <div className='w-full min-h-dvh flex flex-col items-center overflow-x-hidden'>
        <Navbar/>
        <main className='w-full flex-1 flex flex-col items-center'>
          {children}
        </main>
    </div>
  )
}

export default AppLayout