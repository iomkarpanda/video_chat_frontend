import React from 'react'

const Navbar = () => {
  return (
    <nav className='w-3/4 sm:w-3/5 md:w-3/4 lg:w-3/4 xl:w-2/4 2xl:w-2/4 h-12 rounded-4xl bg-black flex justify-around items-center px-6 mt-4'>
      <img src="/logo.svg" alt="Logo of Video Chat" className="h-8 w-8 object-contain brightness-0 invert flex-shrink-0" />

      <div className="nav-links w-3/4 md:w-4/5 text-xs sm:text-xs md:text-xs lg:text-base h-full flex justify-around m items-center text-white">
          <a href="/" className='hover:border-b-2' >Home</a>
          <a href="/chat" className='hover:border-b-2'>Chat</a>
          <a href="/about" className='hover:border-b-2'>About</a>
          <a href="/contact" className='hover:border-b-2'>Contact</a>
      </div>
    </nav>
  )
}

export default Navbar