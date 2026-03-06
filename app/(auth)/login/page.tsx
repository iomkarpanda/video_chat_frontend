import React from 'react'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'


const page = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-xl px-4 sm:px-6 md:px-8 py-8 sm:py-10 flex flex-col gap-6 rounded-2xl border border-black/10">
        <h2 className="text-2xl font-bold text-black mb-2 text-center tracking-tight">Sign In</h2>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="Enter Email" required className="text-black bg-white border-black/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
            <Input id="password" type="password" placeholder="Enter Password" required className="text-black bg-white border-black/20" />
          </div>
          <Button className="mt-2 bg-black hover:bg-black/80 transition text-white font-semibold py-2 rounded-lg shadow">Login</Button>
        </form>
        <div className="text-center text-sm text-black mt-2">
          Don't have an account? <a href="/register" className="text-black underline hover:opacity-70">Register</a>
        </div>
      </div>
    </div>
  )
}

export default page