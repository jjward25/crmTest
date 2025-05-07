"use client"
import { useState } from 'react'
import SalesBlurb from "./blurb";
import TotalArrLastQuarter from './charts/arrLQ';
import WinRateByMonth from "./charts/winRate";
import SegmentTable from "./charts/breakdown/segmentTable";
import TerritoryTable from "./charts/breakdown/territoryTable";
import CycleTimeByMonth from './charts/cycleTimeTrend';
import CycleLQ from './charts/cycleLQ';
import CycleL12 from './charts/cycleL12';
import QualifiedForecast from './charts/QualifiedForecast';

export default function Sales() {
  const [isContentVisible, setIsContentVisible] = useState(true)

  const toggleContent = () => {
    setIsContentVisible(!isContentVisible)
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
                </div>

                <div className='w-full flex flex-col gap-3'>
                  <WinRateByMonth/>
                  <CycleTimeByMonth/>
                  <p className='text-xs text-primary-3'>{`Both lines should be loosely in-line (and steady or trending down).  In this case Aug+Oct had spikes in qualifications that led to a backlog that spiked cycle times in Sep+Nov.`}</p>
                  
                </div>
              
              </div>

              <h1 className="text-xl my-4">Sales Breakdown</h1>
              <SegmentTable/>
              <TerritoryTable/>

              <h1 className="text-xl my-4">DQ + Loss Breakdown</h1>
              <p>{`Gross Margins, Discounts`}</p>
              <p>{`Stage conversions -- SWOT x territory/segment (where did we see our quickest, higher dollar conversions?)`}</p>
              <p>{`DQs x stage - can we find out timing/budget/use case earlier?`}</p>
              </>)}
            </div>

  );
}
