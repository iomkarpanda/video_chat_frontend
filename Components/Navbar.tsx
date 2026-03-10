'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

const Navbar = () => {
  const { isLoggedIn, isLoading, logout } = useAuth()

  async function handleLogout() {
    await logout()
    window.location.href = '/'
  }

  return (
    <nav className='w-3/4 sm:w-3/5 md:w-3/4 lg:w-3/4 xl:w-2/4 2xl:w-2/4 h-12 rounded-4xl bg-black flex justify-around items-center px-6 mt-4'>
      <Link href="/">
        <img src="/logo.svg" alt="Logo of Video Chat" className="h-8 w-8 object-contain brightness-0 invert flex-shrink-0" />
      </Link>

      <div className="nav-links w-3/4 md:w-4/5 text-xs sm:text-xs md:text-xs lg:text-base h-full flex justify-around items-center text-white">
        <Link href="/" className='hover:border-b-2'>Home</Link>
        <Link href="/chat" className='hover:border-b-2'>Chat</Link>
        <Link href="/about" className='hover:border-b-2'>About</Link>
        <Link href="/contact" className='hover:border-b-2'>Contact</Link>
        {!isLoading && (
          isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hover:border-b-2 cursor-pointer bg-transparent border-none text-inherit font-inherit"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className='hover:border-b-2'>Login</Link>
              <Link href="/register" className='hover:border-b-2'>Register</Link>
            </>
          )
        )}
      </div>
    </nav>
  )
}

export default Navbar
