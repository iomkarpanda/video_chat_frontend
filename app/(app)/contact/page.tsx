"use client"
import { useState } from 'react'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { Button } from '@/Components/ui/button'
import { submitContact } from '@/lib/contact-api'

const page = () => {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validateEmail(value: string) {
    return /.+@.+\..+/.test(value)
  }

  function validatePhone(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return false
    return /^[0-9+\-()\s]{7,}$/.test(trimmed)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim() || !email.trim() || !comment.trim()) {
      setError('Full name, email, and comment are required')
      return
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    if (!validatePhone(phone)) {
      setError('Phone number is required and must be valid')
      return
    }

    setSubmitting(true)
    try {
      const res = await submitContact({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        comment: comment.trim(),
      })
      setSuccess(res.message || 'Thank you for contacting us. We will get back to you soon.')
      setFullName('')
      setPhone('')
      setEmail('')
      setComment('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit contact form. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center bg-gray-50 px-4 py-6">
      <form
        className="contact-form w-sm border border-slate-200 rounded-lg bg-white px-6 py-8 shadow-lg flex flex-col gap-4"
        onSubmit={handleSubmit}
        aria-label="Contact form"
      >
        <span className='w-20 border-b-2 border-blue-600 pb-1'>Contact us</span>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="fullName">Full Name</label>
          <Input
            id="fullName"
            placeholder='Enter Full Name'
            type='text'
            className="w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="phone">Phone</label>
          <Input
            id="phone"
            placeholder='Enter Phone'
            type='tel'
            className="w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
          <Input
            id="email"
            placeholder='Enter Email'
            type='email'
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="comment">Comment</label>
          <Textarea
            id="comment"
            placeholder='Enter Comment'
            className="w-full"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {success && <p className="text-sm text-green-600" role="status">{success}</p>}
        <Button className="w-full mt-2" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}

export default page