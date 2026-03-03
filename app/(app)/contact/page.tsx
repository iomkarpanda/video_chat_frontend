import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import {Button} from '@/Components/ui/button'

const page = () => {
  return (

    <div className="w-full flex-1 flex flex-col justify-center items-center bg-gray-50 px-4 py-6">
      <div className="contact-form w-sm border border-slate-200 rounded-lg bg-white px-6 py-8 shadow-lg flex flex-col gap-4">
        <span className='w-20 border-b-2 border-blue-600 pb-1'>Contact us</span>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Input placeholder='Enter First Name' type='text' className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <Input placeholder='Enter Phone' type='tel' className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input placeholder='Enter Email' type='email' className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Comment</label>
          <Textarea placeholder='Enter Comment' className="w-full" />
        </div>
        <Button className="w-full mt-2">Submit</Button>
      </div>
    </div>
  )
}

export default page