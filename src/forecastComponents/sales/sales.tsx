"use client"
import { useState } from 'react'
import SalesBlurb from "./blurb";
import TotalArrLastQuarter from './charts/summary/arrLQ';
import WinRateByMonth from "./charts/winRate";
import SegmentTable from "./charts/breakdown/segmentTable";
import TerritoryTable from "./charts/breakdown/territoryTable";
import CycleTimeByMonth from './charts/cycleTimeTrend';
import CycleLQ from './charts/summary/cycleLQ';
import CycleL12 from './charts/summary/cycleL12';
import QualifiedForecast from './charts/summary/QualifiedForecast';
import AverageArrLastThirtyDays from './charts/summary/avgARRL30';
import AverageArrLast90Days from './charts/summary/avgARRL90';
import AverageArrLast365Days from './charts/summary/avgARRLY';
import SegmentARRChart from './charts/segmentMap';
import TerritoryARRChart from './charts/territoryMap';

export default function Sales() {
  const [isContentVisible, setIsContentVisible] = useState(true)
  const [isContentVisible2, setIsContentVisible2] = useState(true)
  const [isContentVisible3, setIsContentVisible3] = useState(true)

  const toggleContent = () => {
    setIsContentVisible(!isContentVisible)
  }

  const toggleContent2 = () => {
    setIsContentVisible2(!isContentVisible2)
  }

  const toggleContent3 = () => {
    setIsContentVisible3(!isContentVisible3)
  }

  return (
            
    <div className="w-full border-primary-2 border-double border-2 rounded-lg p-4 md:p-8 bg-primary-1">
              <h2 className="text-primary-5 w-full font-semibold text-3xl text-center pb-8 drop-shadow-xl cursor-pointer" onClick={toggleContent}>
                 {`Qualification & Conversions`}
              </h2>
              <SalesBlurb/>

              {isContentVisible && (
              <>
              <div className='flex flex-row gap-2'>

                <div className='flex flex-col w-1/2 gap-2'>
                  <div className='flex flex-row gap-2'>
                    <QualifiedForecast/>
                    <TotalArrLastQuarter/>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <CycleLQ/>
                    <CycleL12/>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <AverageArrLastThirtyDays/>
                    <AverageArrLast90Days/>
                    <AverageArrLast365Days/>
                  </div>

                  <span className='h-[2px] w-full bg-primary-5 my-2'/>

                  <h3 className=''>Sales Forecast Breakdown</h3>
                  <div className='flex flex-col'>{`[71 Opps] from [134 Leads] at [52% Qualification Rate]`}</div>
                  <div className='flex flex-col'>{`[28 Closed Won] [40% Win Rate] at [$ACV] for [$Forecast Closed Won]`}</div>
                  <div className='flex flex-col'>{`Territory - [#] [$]`}</div>
                  <div className='flex flex-col'>{`Segment - [#] [$]`}</div>

                </div>


                <div className='w-full flex flex-col gap-3'>
                  <WinRateByMonth/>
                  <CycleTimeByMonth/>
                  <p className='text-xs text-primary-3'>{`Both lines should appear similar (and steady or trending down).  In this case Aug+Oct had spikes in qualifications that led to a backlog that spiked cycle times in Sep+Nov.`}</p>
                  
                  <div className='flex flex-row gap-2'>
                    <SegmentARRChart/>
                    <TerritoryARRChart/>
                  </div>
                  
                </div>
              
              </div>
              

              <h1 className="text-xl my-4 w-full bg-primary-5 text-primary-3 p-2 rounded-md" onClick={toggleContent2}>Sales Breakdown</h1>
              {isContentVisible2 && (
              <>
                <SegmentTable/>
                <TerritoryTable/>
              </>
              )}

              <h1 className="text-xl my-4 w-full bg-primary-5 text-primary-3 p-2 rounded-md" onClick={toggleContent3}>DQ + Loss Breakdown</h1>

              {isContentVisible3 && (
              <>
                <p>{`Gross Margins, Discounts`}</p>
                <p>{`Stage conversions -- SWOT x territory/segment (where did we see our quickest, higher dollar conversions?)`}</p>
                <p>{`DQs x stage - can we find out timing/budget/use case earlier?`}</p>
              </>
              )}


              </>)}
            </div>

  );
}
