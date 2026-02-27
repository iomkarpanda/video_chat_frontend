import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='w-screen h-14 bg-[#0a0a0a] flex items-center justify-around'>
        <h1 style={{ fontFamily: '"Rubik Spray Paint", system-ui' }} className='text-white text-2xl'>Video Chat</h1>
        <div className="box w-64 flex text-white items-center justify-between">
            <p><Link href="/">Home</Link></p>
            <p><Link href="/about">About</Link></p>
            <p><Link href="/Contact us">Contact us</Link></p>
            {/* <Button variant="default">Login</Button> */}
        </div>
    </div>
  )
}

export default Navbar