'use client'

import React from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'

const Navbar = () => {
  const { isLoggedIn, isLoading, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  async function handleLogout() {
    await logout()
    window.location.href = '/'
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className='relative w-3/4 sm:w-3/5 md:w-3/4 lg:w-3/4 xl:w-3/4 2xl:w-3/4 h-12 rounded-4xl bg-black flex items-center justify-between px-6 mt-4 text-white'>
      {/* Logo */}
      <Link href="/">
        <img src="/logo.svg" alt="Logo of Video Chat" className="h-8 w-8 object-contain brightness-0 invert shrink-0" />
      </Link>

      {/* Desktop navigation links */}
      <div className="hidden md:flex flex-1 justify-center gap-6 text-xs lg:text-base">
        <Link href="/" className='hover:border-b'>Home</Link>
        <Link href="/chat" className='hover:border-b'>Chat</Link>
        <Link href="/chathistory" className='hover:border-b'>History</Link>
        <Link href="/about" className='hover:border-b'>About</Link>
        <Link href="/contact" className='hover:border-b'>Contact</Link>
      </div>

      {/* Auth buttons + mobile menu button */}
      <div className="flex items-center gap-3 ml-4">
        {hasMounted && !isLoading && (
          isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs lg:text-base hover:border-b-2 cursor-pointer bg-transparent border-none text-inherit font-inherit"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className='text-xs lg:text-base hover:border-b'>Login</Link>
              {/* <Link href="/register" className='text-xs lg:text-base hover:border-b'>Register</Link> */}
            </>
          )
        )}

        {/* Mobile menu toggle (hamburger) */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-full border border-white/40 ml-1"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span
            className={`block h-0.5 w-4 bg-white transition-transform duration-200 ${
              isMenuOpen ? 'translate-y-1 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-4 bg-white my-0.5 transition-opacity duration-200 ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-0.5 w-4 bg-white transition-transform duration-200 ${
              isMenuOpen ? '-translate-y-1 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown nav links only */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 rounded-3xl bg-black/95 py-3 px-6 flex flex-col gap-2 text-xs">
          <Link href="/" className='hover:border-b' onClick={closeMenu}>Home</Link>
          <Link href="/chat" className='hover:border-b' onClick={closeMenu}>Chat</Link>
          <Link href="/chathistory" className='hover:border-b' onClick={closeMenu}>History</Link>
          <Link href="/about" className='hover:border-b' onClick={closeMenu}>About</Link>
          <Link href="/contact" className='hover:border-b' onClick={closeMenu}>Contact</Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
