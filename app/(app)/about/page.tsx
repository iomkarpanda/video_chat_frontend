import React from 'react'

const page = () => {
  return (
    <div className='w-full flex-1 flex justify-center items-center bg-gray-50 px-4 py-8'>
      <div className='about-us w-full max-w-2xl border border-slate-200 px-6 py-8 shadow-lg rounded-2xl bg-white space-y-6'>
        <h1 className='text-2xl font-semibold text-slate-900'>About Us</h1>

        <section className='space-y-2'>
          <span className='inline-block border-b-2 border-blue-600 pb-1 text-base font-medium text-slate-800'>
            Our Mission
          </span>
          <p className='text-sm leading-6 text-slate-600'>
            We build a web-based system designed to provide answers to natural language questions asked about existing video transcripts.
          </p>
        </section>

        <section className='space-y-2'>
          <span className='inline-block border-b-2 border-blue-600 pb-1 text-base font-medium text-slate-800'>
            What we do?
          </span>
          <p className='text-sm leading-6 text-slate-600'>
            Our system analyzes pre-existing public video URLs or specific transcript identifiers to load available transcripts. We use advanced techniques to retrieve the most relevant evidence and generate answers directly supported by the transcript. If a question cannot be answered from the provided transcript, the user is notified.
          </p>
        </section>
      </div>
    </div>
  )
}

export default page