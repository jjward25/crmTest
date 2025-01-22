import type React from "react"
import { useState, useEffect, useRef } from "react"

type Company = {
  id: number
  name: string
  engagements: number
  dollarsConverted: number
  useCase: string
}

const companies: Company[] = [
  { id: 1, name: "TechCorp", engagements: 150, dollarsConverted: 75000, useCase: "AI" },
  { id: 2, name: "HealthCare Inc", engagements: 80, dollarsConverted: 120000, useCase: "Healthcare" },
  { id: 3, name: "EduLearn", engagements: 200, dollarsConverted: 50000, useCase: "Education" },
  { id: 4, name: "FinanceHub", engagements: 100, dollarsConverted: 200000, useCase: "Finance" },
  { id: 5, name: "GreenEnergy", engagements: 120, dollarsConverted: 90000, useCase: "Energy" },
  { id: 6, name: "RetailGiant", engagements: 300, dollarsConverted: 180000, useCase: "Retail" },
  { id: 7, name: "TravelEase", engagements: 90, dollarsConverted: 60000, useCase: "Travel" },
  { id: 8, name: "MediaStream", engagements: 250, dollarsConverted: 150000, useCase: "Media" },
  { id: 9, name: "AutoDrive", engagements: 180, dollarsConverted: 95000, useCase: "Automotive" },
  { id: 10, name: "BioLife Labs", engagements: 70, dollarsConverted: 130000, useCase: "Biotechnology" },
  { id: 11, name: "LogiMax", engagements: 160, dollarsConverted: 110000, useCase: "Logistics" },
  { id: 12, name: "ConstructPro", engagements: 90, dollarsConverted: 80000, useCase: "Construction" },
  { id: 13, name: "Foodies Hub", engagements: 220, dollarsConverted: 85000, useCase: "Food & Beverage" },
  { id: 14, name: "EcoSolutions", engagements: 100, dollarsConverted: 140000, useCase: "Environmental" },
  { id: 15, name: "FashionForward", engagements: 250, dollarsConverted: 200000, useCase: "Fashion" },
  { id: 16, name: "HealthPlus", engagements: 130, dollarsConverted: 170000, useCase: "Healthcare" },
  { id: 17, name: "InnovaTech", engagements: 190, dollarsConverted: 160000, useCase: "Technology" },
  { id: 18, name: "EduPerfect", engagements: 210, dollarsConverted: 90000, useCase: "Education" },
  { id: 19, name: "TravelMate", engagements: 85, dollarsConverted: 75000, useCase: "Travel" },
  { id: 20, name: "FinServe", engagements: 140, dollarsConverted: 175000, useCase: "Finance" },
  { id: 21, name: "EnergyWave", engagements: 120, dollarsConverted: 125000, useCase: "Energy" },
  { id: 22, name: "MediaWorks", engagements: 230, dollarsConverted: 155000, useCase: "Media" },
  { id: 23, name: "RetailPro", engagements: 300, dollarsConverted: 220000, useCase: "Retail" },
  { id: 24, name: "SmartHome", engagements: 160, dollarsConverted: 100000, useCase: "Home Automation" },
  { id: 25, name: "AgriGrow", engagements: 75, dollarsConverted: 85000, useCase: "Agriculture" },
  { id: 26, name: "CyberSecure", engagements: 195, dollarsConverted: 190000, useCase: "Cybersecurity" },
  { id: 27, name: "MotoDrive", engagements: 180, dollarsConverted: 95000, useCase: "Automotive" },
  { id: 28, name: "HealthCore", engagements: 95, dollarsConverted: 135000, useCase: "Healthcare" },
  { id: 29, name: "EduSmart", engagements: 220, dollarsConverted: 95000, useCase: "Education" },
  { id: 30, name: "GreenTech", engagements: 105, dollarsConverted: 160000, useCase: "Green Technology" },
  { id: 31, name: "TravelSmart", engagements: 100, dollarsConverted: 70000, useCase: "Travel" },
  { id: 32, name: "FinanceFlow", engagements: 150, dollarsConverted: 180000, useCase: "Finance" },
  { id: 33, name: "EcoFriendly", engagements: 110, dollarsConverted: 125000, useCase: "Environmental" },
]

const useCaseColors: { [key: string]: string } = {
  AI: "bg-blue-500",
  Healthcare: "bg-green-500",
  Education: "bg-yellow-500",
  Finance: "bg-purple-500",
  Energy: "bg-red-500",
  Retail: "bg-pink-500",
  Travel: "bg-indigo-500",
  Media: "bg-orange-500",
}

const BubbleChart: React.FC = () => {
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartDimensions({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const maxEngagements = Math.max(...companies.map((c) => c.engagements))
  const maxDollarsConverted = Math.max(...companies.map((c) => c.dollarsConverted))

  const getBubbleSize = (engagements: number, dollarsConverted: number) => {
    const size = Math.sqrt((engagements / maxEngagements) * (dollarsConverted / maxDollarsConverted)) * 40
    return Math.max(size, 8) // Minimum size of 8
  }

  const formatAxisLabel = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
  }

  return (
    <div className="w-full h-full p-4">
      <h2 className="text-xl font-bold mb-4 text-white">{`Engagement x Conversions ($)`}</h2>
      <div
        ref={chartRef}
        className="w-full h-[300px] border border-primary-3 rounded-lg shadow-inner relative overflow-hidden"
      >
        {companies.map((company) => {
          const xPos = (company.engagements / maxEngagements) * (chartDimensions.width - 60) + 40
          const yPos =
            chartDimensions.height -
            ((company.dollarsConverted / maxDollarsConverted) * (chartDimensions.height - 40) + 20)
          const size = getBubbleSize(company.engagements, company.dollarsConverted)

          return (
            <div
              key={company.id}
              className={`absolute rounded-full ${useCaseColors[company.useCase]} opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md`}
              style={{
                left: `${xPos}px`,
                top: `${yPos}px`,
                width: `${size}px`,
                height: `${size}px`,
                transform: "translate(-50%, -50%)",
              }}
              title={`${company.name}\nEngagements: ${company.engagements}\nDollars Converted: $${company.dollarsConverted.toLocaleString()}\nUse Case: ${company.useCase}`}
            />
          )
        })}
        {/* X-axis */}
        <div className="absolute bottom-0 left-10 right-10 h-px bg-gray-300" />
        <div className="absolute bottom-0 left-10 h-2 w-px bg-gray-300" />
        <div className="absolute bottom-0 right-10 h-2 w-px bg-gray-300" />
        <div className="absolute bottom-2 left-8 text-xs text-white">0</div>
        <div className="absolute bottom-2 right-4 text-xs text-white">{formatAxisLabel(maxEngagements)}</div>

        {/* Y-axis */}
        <div className="absolute top-5 bottom-5 left-10 w-px bg-gray-300" />
        <div className="absolute top-5 left-8 w-2 h-px bg-gray-300" />
        <div className="absolute bottom-5 left-8 w-2 h-px bg-gray-300" />
        <div className="absolute top-3 left-0 text-xs text-white transform -rotate-90">
          {formatAxisLabel(maxDollarsConverted)}
        </div>
        <div className="absolute bottom-3 left-2 text-xs text-white transform -rotate-90">0</div>

        {/* Axis labels */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-sm font-semibold text-primary-3">
          Number of Engagements
        </div>
        <div className="absolute top-1/2 left-0 transform -translate-x-6 -translate-y-1/2 rotate-90 origin-center text-sm font-semibold text-primary-3">
          Dollars Converted
        </div>
      </div>
    </div>
  )
}

export default BubbleChart

