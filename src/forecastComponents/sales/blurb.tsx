"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"


export default function SalesBlurb() {

  const [isExpanded, setIsExpanded] = useState(false)

  return (
            
          <div className={cn("bg-primary-1 rounded-lg overflow-hidden shadow-lg","transition-all duration-300 ease-in-out hover:shadow-2xl border border-primary-2 mb-8",)}>
            <div
              className={cn("flex justify-between items-center cursor-pointer p-3",isExpanded && "border-b border-primary-3",)}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <p className='text-primary-5 font-semibold text-md'>{`(1) Are we winning our Qualified deals? (2) Where and Why?`}</p>
              {isExpanded ? <ChevronDown color="#cdba96" /> : <ChevronUp color="#cdba96"/>}
            </div>
            {/** Top Accordion Content */}
            {isExpanded && (
              <div className='px-4 pt-2 pb-4'>
                <p className='text-primary-5 text-sm mt-2'>{`At this point it's all about closing. Are we closing deals as expected, where expected? If not, why?`}</p>
            </div>
            )}
          </div>


  );
}
