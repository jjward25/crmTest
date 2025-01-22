"use client"

import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const companies = ["TechCorp", "InnoSoft", "DataDrive", "CloudNine"]
const stages = ["Prospect", "Qualified", "Customer"]
const stageColors = {
  Prospect: "#8884d8",
  Qualified: "#82ca9d",
  Customer: "#ffc658",
}

interface EngagementDetails {
  company: string
  engagements: number
}

interface WeekData {
  week: string
  [key: string]: number | EngagementDetails | string
}

// Generate sample data with each company in only one stage
const generateData = (): WeekData[] => {
  const weeks = Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`)

  // Assign each company a fixed stage
  const companyStages = companies.reduce((acc, company, index) => {
    acc[company] = stages[index % stages.length]
    return acc
  }, {} as Record<string, string>)

  return weeks.map((week) => {
    const weekData: WeekData = { week } // We explicitly set week here

    companies.forEach((company) => {
      const stage = companyStages[company]
      const currentStageValue = weekData[`${stage}`] as number || 0
      weekData[`${stage}`] = currentStageValue + Math.floor(Math.random() * 1000) + 100
      weekData[`${stage}Details`] = {
        company,
        engagements: weekData[`${stage}`] as number
      }
    })

    return weekData
  })
}

const data = generateData()

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: Record<string, any>; dataKey: string }[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry, index) => {
          const details = entry.payload[`${entry.dataKey}Details`]
          if (!details) return null
          return (
            <div key={index} className="text-sm mb-1">
              <span className="font-medium">{details.company}: </span>
              <span>{details.engagements.toLocaleString()} engagements</span>
              <span className="ml-2">({entry.dataKey})</span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export default function MostEngagedCampaignsChart() {
  return (
    <div className="w-full max-w-4xl mx-auto pt-4">
      <h2 className="text-xl font-bold mb-2">Account Engagements L90 Days</h2>
      <p className="text-primary-4 mb-4 text-sm">
        Weekly engagement count by stage and company.
      </p>
      <div className="h-[300px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: "Engagements", angle: -90, position: "insideLeft" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {stages.map((stage) => (
              <Bar
                key={stage}
                dataKey={stage}
                name={stage}
                stackId="a"
                fill={stageColors[stage as keyof typeof stageColors]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
