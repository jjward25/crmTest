import LGBlurb from './blurb'
import QualifiedAccountsTrend from './charts/QualifiedAccountsTrend'
import LeadConversionSankey from './charts/ConversionSankey'
import MonthlyQualificationsTrend from './charts/MonthlyQualificationsTrend'
import AccountsARRTrend from './charts/AccountsARRTrend'
import QualifiedAccountsTrendTable from './charts/QualifiedTable'
import QualificationsForecast from './charts/QualificationsForecast'
import ForecastARR from './charts/ForecastARR'


export default function LeadGen() {


  return (
            
      <div className="w-full border-primary-2 border-double border-2 rounded-lg p-4 md:p-8 bg-primary-5">
          <h2 className="text-primary-0 w-full font-semibold text-xl text-center pb-8">Lead Generation</h2>

          <LGBlurb />

          <div className='flex flex-col gap-4'>

            <div className='flex flex-col md:flex-row gap-4 w-full'> 
              
              <div className='flex flex-col w-full'>
                <div className='flex flex-col w-full'>
                  <QualifiedAccountsTrend/>
                  <p className='text-xs text-primary-3 mt-1'>{`Qualified Accounts by Month is used to gauge top-line lead generation. Net Qualified Accounts gives a more detailed sense of our growth over time.`}</p>
                </div>

                <div className='flex flex-col w-full mt-4'>
                  <AccountsARRTrend/>            
                  <p className='text-xs text-primary-3 mt-1'>{`Shows how much revenue our Qualifications bring in each month.`}</p>
                </div>

                <div className='flex flex-col w-full mt-4'>
                  <MonthlyQualificationsTrend/>
                  <p className='text-xs text-primary-3 mt-1'>{`Shows how our Qualifications typically resolve and what's open.`}</p>
                </div>
              </div>

              <div className='flex flex-col w-full gap-4'>
                <QualifiedAccountsTrendTable/>  
                
                <p className='text-xs text-primary-3 mt-1'>{`The Qualifications forecast here is derived from the rolling-3 and 12-month averages, weighted towards the rolling 3-month average.  This weighs recent performance more while also having some "regression to the mean" anchoring.`}</p>
                <p className='text-xs text-primary-3'>{`The Forecasted ARR is the Average ARR for qualified deals the last 3 months * the Qualfications forecast.  In this case, looking at our Monthly Qualfifications % Chart, I'd expect to ultimately close about half of this $893k.`}</p>
                <div className='flex flex-row gap-4'>
                  <QualificationsForecast/>
                  <ForecastARR/>
                </div>
                                
              </div>
              
            </div>
            
            </div>
      </div>

  );
}
