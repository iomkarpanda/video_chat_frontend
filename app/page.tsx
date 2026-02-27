import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'
import { Button } from '@/Components/ui/button'

const page = () => {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center relative bg-[#f8fafc] overflow-hidden" id="hero-section">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: "20px 30px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
          }}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 py-24">
          <h1 className='text-5xl font-bold'>Talk to the Video</h1>
          <h3 className='text-xl'>Ask questions about lectures, podcasts, and tutorials.</h3>
          <Button variant="outline" className='w-24'>Get Started</Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default page