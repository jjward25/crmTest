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
import AverageArrOpenPipeline from './charts/summary/avgARR_ActivePL';
import WinsL90 from './charts/summary/winsL90';
import WinRateL90 from './charts/summary/winrateL90';

export default function Sales() {
  const [isContentVisible, setIsContentVisible] = useState(true)
  const [isContentVisible2, setIsContentVisible2] = useState(false)

  // Default values
  const defaultValues = {
    leads: 134,
    qualificationRate: 53,
    winRate: 42,
    acv: 14685
  }

  // State for input values
  const [values, setValues] = useState(defaultValues)

  // Calculate derived values
  const qualifiedOpps = Math.round(values.leads * (values.qualificationRate / 100))
  const closedWonDeals = Math.round(qualifiedOpps * (values.winRate / 100))
  const forecastAmount = closedWonDeals * values.acv

  // Calculate default derived values for comparison
  const defaultQualifiedOpps = Math.round(defaultValues.leads * (defaultValues.qualificationRate / 100))
  const defaultClosedWonDeals = Math.round(defaultQualifiedOpps * (defaultValues.winRate / 100))
  const defaultForecastAmount = defaultClosedWonDeals * defaultValues.acv

  // Calculate changes
  const getChangeText = (current: number, base: number, label: string) => {
    const diff = current - base
    const percentChange = Math.round((diff / base) * 100)
    if (diff === 0) return null
    const sign = diff > 0 ? '+' : ''
    const formattedDiff = label === 'Forecast' 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(diff)
      : `${sign}${diff}`
    return `${label} ${formattedDiff} (${sign}${percentChange}% from base forecast)`
  }

  const changes = [
    getChangeText(values.leads, defaultValues.leads, 'Leads'),
    getChangeText(values.qualificationRate, defaultValues.qualificationRate, 'Qualification Rate'),
    getChangeText(values.winRate, defaultValues.winRate, 'Win Rate'),
    getChangeText(values.acv, defaultValues.acv, 'ACV'),
    getChangeText(qualifiedOpps, defaultQualifiedOpps, 'Qualified Opps'),
    getChangeText(closedWonDeals, defaultClosedWonDeals, 'Closed Won Deals'),
    getChangeText(forecastAmount, defaultForecastAmount, 'Forecast')
  ].filter(Boolean)

  const handleInputChange = (field: keyof typeof defaultValues, value: string) => {
    // Remove currency formatting for ACV input
    const cleanValue = field === 'acv' ? value.replace(/[$,]/g, '') : value
    const numValue = parseInt(cleanValue) || 0
    setValues(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  const resetValues = () => {
    setValues(defaultValues)
  }

  const toggleContent = () => {
    setIsContentVisible(!isContentVisible)
  }

  const toggleContent2 = () => {
    setIsContentVisible2(!isContentVisible2)
  }

  return (
    <div className="w-full border-primary-2 border-double border-2 rounded-lg p-4 md:p-8 bg-primary-1">
      <h2 className="text-primary-5 w-full font-semibold text-3xl text-center pb-8 drop-shadow-xl cursor-pointer" onClick={toggleContent}>
        {`Conversions`}
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
          <div className='flex flex-row gap-2 border-t-2 border-black pt-2'>
            <AverageArrLastThirtyDays/>
            <AverageArrLast90Days/>
          </div>
          <div className='flex flex-row gap-2'>
            <AverageArrOpenPipeline/>
            <AverageArrLast365Days/>
          </div>

          <div className='flex flex-row gap-2 border-t-2 border-black pt-2'>
            <WinRateL90/>
            <WinsL90/>
          </div>
        </div>

        <div className='w-full flex flex-col gap-3'>
          <WinRateByMonth/>
          <CycleTimeByMonth/>
          <p className='text-xs text-primary-3'>{`Both lines should appear similar (and steady or trending down).  In this case Aug+Oct had spikes in qualifications that led to a backlog that spiked cycle times in Sep+Nov.`}</p>
        </div>
      </div>
      
      <div className='my-2 py-2 border-t-2 border-b-2 border-black'>
        <div className="flex justify-between items-center mb-4">
          <h3 className='font-bold text-2xl'>Forecast Breakdown</h3>
          <button 
            onClick={resetValues}
            className="px-4 py-2 bg-primary-5 text-primary-1 rounded hover:bg-primary-4 transition-colors"
          >
            Reset Values
          </button>
        </div>
        <div className='font-semibold'>{`Pipeline Forecast`}</div>
        <div className=''>
          <input
            type="number"
            value={values.leads}
            onChange={(e) => handleInputChange('leads', e.target.value)}
            className="w-20 bg-transparent border-b border-violet-500 text-violet-500 focus:outline-none"
          />
          {` Leads at `}
          <input
            type="number"
            value={values.qualificationRate}
            onChange={(e) => handleInputChange('qualificationRate', e.target.value)}
            className="w-16 bg-transparent border-b border-violet-500 text-violet-500 focus:outline-none"
          />
          {`% nets `}
          <span className='text-violet-500'>{qualifiedOpps} Qualified Opps</span>
        </div>
        <div className='font-semibold'>{`Sales Forecast`}</div>
        <div className=''>
          {`A `}
          <input
            type="number"
            value={values.winRate}
            onChange={(e) => handleInputChange('winRate', e.target.value)}
            className="w-16 bg-transparent border-b border-violet-500 text-violet-500 focus:outline-none"
          />
          {`% Win Rate nets `}
          <span className='text-violet-500'>{closedWonDeals} Closed Won Deals</span>
          {` with a `}
          <input
            type="text"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(values.acv)}
            onChange={(e) => handleInputChange('acv', e.target.value)}
            className="w-24 bg-transparent border-b border-violet-500 text-violet-500 focus:outline-none"
          />
          {` ACV, for `}
          <span className='text-violet-500'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(forecastAmount)}
          </span>
          {` next 90 days`}
        </div>
        {changes.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-300 text-sm text-gray-600">
            <div className="font-semibold mb-1">Changes from Base Forecast:</div>
            {changes.map((change, index) => (
              <div key={index}>{change}</div>
            ))}
          </div>
        )}
      </div>

      <h1 className="text-xl my-4 w-full bg-primary-5 text-primary-3 p-2 rounded-md" onClick={toggleContent2}>Sales Breakdown</h1>
      {isContentVisible2 && (
      <>
        <div className='flex flex-row gap-2'>
          <SegmentARRChart/>
          <TerritoryARRChart/>
        </div>
        <SegmentTable/>
        <TerritoryTable/>
      </>
      )}
      </>)}
    </div>
  );
}
