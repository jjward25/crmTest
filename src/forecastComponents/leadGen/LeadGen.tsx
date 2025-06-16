"use client"
import { useState } from 'react'
import LGBlurb from './blurb'

import QualifiedAccountsTrend from './charts/QualifiedAccountsTrend'
import MonthlyQualificationsTrend from './charts/MonthlyQualificationsTrend'
import AccountsARRTrend from './charts/AccountsARRTrend'
import QualifiedAccountsTrendTable from './charts/QualifiedTable'

import QualificationsForecast from './charts/summary/ForecastQualifications'
import ForecastARR from './charts/summary/ForecastQualifiedARR'
import ForecastClosedQtrARR from './charts/summary/ForecastClosedQTRARR'

import ForecastClosedARR from './charts/summary/ForecastClosedARR'
import OpenLeads from './charts/summary/OpenForecastLeads'
import ForecastClosedLeads from './charts/summary/OpenForecastClosed'
import OpenForecastARR from './charts/summary/OpenForecastARR'
import OpenForecastTotalARR from './charts/summary/FinalForecast'

export default function LeadGen() {
  const [isContentVisible, setIsContentVisible] = useState(false)

  const toggleContent = () => {
    setIsContentVisible(!isContentVisible)
  }

  return (
    <div className="w-full border-primary-5 border-double border-2 rounded-lg p-4 md:p-8 bg-primary-1">
      <h2 
        className="text-primary-5 w-full font-semibold text-3xl text-center pb-8 drop-shadow-xl cursor-pointer" 
        onClick={toggleContent}
      >
        Lead Generation
      </h2>
      <LGBlurb />

      {isContentVisible && (
        <>

          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row gap-4 w-full'> 
              <div className='flex flex-col w-full'>
                <div className='flex flex-col w-full'>
                  <QualifiedAccountsTrend/>
                  <p className='text-xs text-primary-3 mt-1'>{`Qualified Accounts by Month is used to gauge top-line lead generation. Net Qualified Accounts gives a more detailed sense of growth over time.`}</p>
                </div>

                <div className='flex flex-col w-full mt-4'>
                  <MonthlyQualificationsTrend/>
                  <p className='text-xs text-primary-3 mt-1'>{`Shows how leads typically resolve by month. Historically about half of Account leads have gotten qualified.`}</p>
                </div>

                <div className='flex flex-col w-full mt-4'>
                  <AccountsARRTrend/>            
                  <p className='text-xs text-primary-3 mt-1'>{`Shows the total revenue Qualifications bring in each month once Closed.  We now know our trends for volume, conversions, and dollars, which we can plug into our forecast.`}</p>
                </div>
              </div>

              <div className='flex flex-col w-full gap-4'>
                <QualifiedAccountsTrendTable/>  

                <h3 className='font-semibold'>Open Accounts Forecast for Next Quarter:</h3>
                <div className='flex flex-row gap-4'>
                  <OpenLeads/>
                  <ForecastClosedLeads/>
                  <OpenForecastARR/>
                </div>
                <p className='text-xs text-primary-3'>All open leads are expected to close within the next quarter.</p>
                
                <h3 className='font-semibold'>Production Forecast for Next Quarter:</h3>
                <div className='flex flex-row gap-4'>
                  <QualificationsForecast/>
                  <ForecastARR/>
                  <ForecastClosedARR/>
                </div>
                <div className='flex flex-row gap-4'>
                  <ForecastClosedQtrARR/>
                  <OpenForecastTotalARR/>
                </div>
                <p className='text-xs text-primary-3'>{`The production forecast for qualifications is derived from rolling-3 and 12-month averages for Opps qualified, weighted towards the rolling 3-month average.  This weighs recent performance more while also having some "regression to the mean" anchoring.`}</p>
                <p className='text-xs text-primary-3'>{`ARR is based on the rolling 3-mo average ARR for Closed Won deals, Win Rates, and Cycle Times.  With 40-day cycle times we theoretically don't close opps created in the second half of a quarter in the same quarter. At roughly a ~40% Win Rate, we expect slightly less than half of all deals qualified to be Wins and we expect to close just over half of them within the quarter.`}</p>
                
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}