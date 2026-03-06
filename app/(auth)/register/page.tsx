import React from 'react'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'

const page = () => {
  return (
        <div className="w-screen h-screen flex justify-center items-center bg-white">
            <div className="w-full max-w-md bg-white shadow-xl px-8 py-10 flex flex-col gap-6 rounded-2xl border border-black/10">
                <h2 className="text-2xl font-bold text-black mb-2 text-center tracking-tight">Create Account</h2>
                <form className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="firstName">First Name</label>
                        <Input id="firstName" placeholder="Enter First Name" required className="focus:ring-2 focus:ring-black focus:border-black transition text-black bg-white border-black/20" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="lastName">Last Name</label>
                        <Input id="lastName" placeholder="Enter Last Name" required className="focus:ring-2 focus:ring-black focus:border-black transition text-black bg-white border-black/20" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
                        <Input id="email" type="email" placeholder="Enter Email" required className="focus:ring-2 focus:ring-black focus:border-black transition text-black bg-white border-black/20" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
                        <Input id="password" type="password" placeholder="Enter Password" required className="focus:ring-2 focus:ring-black focus:border-black transition text-black bg-white border-black/20" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="retypePassword">Retype Password</label>
                        <Input id="retypePassword" type="password" placeholder="Re-enter Password" required className="focus:ring-2 focus:ring-black focus:border-black transition text-black bg-white border-black/20" />
                    </div>
                    <Button className="mt-2 bg-black hover:bg-black/80 transition text-white font-semibold py-2 rounded-lg shadow">Register</Button>
                </form>
                <div className="text-center text-sm text-black mt-2">
                    Already have an account? <a href="/login" className="text-black underline hover:opacity-70">Sign in</a>
                </div>
            </div>
        </div>
  )
}

export default page