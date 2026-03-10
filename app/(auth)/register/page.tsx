'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'
import { useAuth } from '@/lib/auth-context'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [retypePassword, setRetypePassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }
    if (password !== retypePassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register({ email: email.trim(), password })
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-xl px-4 sm:px-6 md:px-8 py-8 sm:py-10 flex flex-col gap-6 rounded-2xl border border-black/10">
        <h2 className="text-2xl font-bold text-black mb-2 text-center tracking-tight">Create Account</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Email"
              required
              className="text-black bg-white border-black/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              required
              className="text-black bg-white border-black/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black" htmlFor="retypePassword">Retype Password</label>
            <Input
              id="retypePassword"
              type="password"
              placeholder="Re-enter Password"
              required
              className="text-black bg-white border-black/20"
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button
            type="submit"
            className="mt-2 bg-black hover:bg-black/80 transition text-white font-semibold py-2 rounded-lg shadow"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <div className="text-center text-sm text-black mt-2">
          Already have an account? <Link href="/login" className="text-black underline hover:opacity-70">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
