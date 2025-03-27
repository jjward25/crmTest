"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"


export default function LGBlurb() {

  const [isExpanded, setIsExpanded] = useState(false)
  const [isExpanded2, setIsExpanded2] = useState(false)

  return (
            
          <div className={cn("bg-primary-5 rounded-lg overflow-hidden shadow-lg","transition-all duration-300 ease-in-out hover:shadow-2xl border border-primary-2 mb-8",)}>
            <div
              className={cn("flex justify-between items-center cursor-pointer p-4",isExpanded && "border-b border-primary-3",)}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <p className='text-primary-2 font-semibold text-md'>{`(1) How are we doing bringing in qualified leads and dollars, and (2) what's driving that?`}</p>
              {isExpanded ? <ChevronDown color="#cdba96" /> : <ChevronUp color="#cdba96"/>}
            </div>
            {/** Top Accordion Content */}
            {isExpanded && (
              <div className='px-4 pt-2'>
                <p className='text-primary-1 text-sm mt-2'>{`For the top of the funnel, `}<span className='font-bold'>Qualified Leads</span>{` (and estimated dollars) are most important. We want to see the number of leads growing, and `}<span className='font-bold'>Qualification Rate</span>{` and `}<span className='font-bold'>Average Revenue</span>{` steady or rising.`}</p>
                <p className='text-primary-1 text-sm mt-2'>{`Then we want to know if we're driving that performance efficiently: `}</p>
                <p className='text-primary-1 text-sm mt-2 pl-2'>{`- Is our Inbound/Outbound mix as expected?`}</p>
                <p className='text-primary-1 text-sm mt-2 pl-2'>{`- What Campaigns/Channels/CTAs are driving Ad, Site or Community engagement? Lead creation? Lead Warming + Qualification?`}</p>
                <p className='text-primary-1 text-sm mt-2 pl-2'>{`- What territories and segments are we generating leads for?`}</p>
                <p className='text-primary-1 text-sm mt-2 pl-2'>{`- Are we effectively enriching our Contacts to aid scoring and qualification?`}</p>

                {/** Nested Accordion */}
                <div className={cn("flex justify-between items-center cursor-pointer p-1 mt-4 mb-3 border-t border-primary-3",isExpanded2 && "border-t border-primary-3",)}
                  onClick={() => setIsExpanded2(!isExpanded2)}
                >
                  <p className='text-primary-3 font-semibold text-sm mt-2'>{`An aside on Ads`}</p>
                  {isExpanded2 ? <ChevronDown color="#869ead"/> : <ChevronUp color="#869ead"/>}
                </div>
                {/** Nested Accordion Content */}
                {isExpanded2 && (
                  <div className='p-2 bg-primary-4 border border-primary-2 rounded-lg mb-4 mt-2'>
                    <p className='text-primary-1 text-sm mt-2 pl-2'>{`Ad tracking is tough, but that's part of what makes the `}<span className='text-primary-5 font-semibold'>{`Ad -> CTA -> Lead Created`}</span>{` flow such a good test. Total clicks can be a strong signal of an interesting product/feature or good brand messaging, and how our ads and CTAs together drive sign-ups can help re-inforce or re-evaluate sales and product strategies.`}</p>
                    <p className='text-primary-1 text-sm mt-2 pl-2'>{`You could also argue there's value in just showing up on someone's screen once a quarter for 3 years - so ROAS can be hard to lock down.`}</p>
                    <p className='text-primary-1 text-sm mt-2 pl-2'>{`For simplicity's sake, Last Touch attribution is a good model since you want to incentivize qualifying behaviour - things that bring an ICP directly to Contact Sales. If this alone covers your cost of advertising and events, great. Then we can just focus on optimizing by focus, channel, profile, etc. and looking for your outlier campaigns.`}</p>
                    <p className='text-primary-1 text-sm mt-2 pl-2'>{`If you trust your CRM stages and enrichment, a weighted mix based on Milestones may work. For example tracking (1) Identified Source - how did we find out about this contact? (Marketing/SDR Outreach, Inbound, CSM referral), (2) Warmed Source - essentially MQL/PQL or a referral, and (3) Qualified Source - budget/timing/need confirmed (Contact Sales Form Fill, Event, SDR).`}</p>
                    <p className='text-primary-1 text-sm mt-2 pl-2'>{`Any new Sales playbooks, Product Roadmap adjustments, or ICP profile updates leading to better conversions as a result of Marketing's campaigns should be noted as well.`}</p>
                  </div>
                )}
            </div>
            )}
          </div>


  );
}
