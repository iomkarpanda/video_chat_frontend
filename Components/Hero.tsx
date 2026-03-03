import { Button } from "./ui/button"
import Link from "next/link"

const Hero = () => {
  return (
    <div className='max-w-full flex flex-col items-center'>
        <img src="/digital_learning.png" alt="A person sitting and watching desktop" className="w-full max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-sm xl:max-w-sm h-auto object-contain" />
         <div className="w-3/4 lg:w-full  relative z-10 flex flex-col items-center gap-4 pt-6 pb-12">
          <h1 className='text-3xl sm:text-3xl md:text-5xl font-bold text-center'>Ask Retrieve Verify</h1>
          <h3 className='text-sm sm:text-sm md:text-xl text-center'>A retrieval-augmented system that answers questions from transcript data.</h3>
          <Link href="/chat"><Button variant="default" className='w-24'>Try Now!</Button></Link>
        </div>
    </div>
  )
}

export default Hero