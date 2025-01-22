"use client"

import React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

type EngagementData = {
  engagementType: string
  focus: string
  numberProspectEngagements: number
  numberQualifiedIn14Days: number
  numQualifiedEngagements: number
  numCustomerEngagements: number
}

type EngagementMetric = keyof Omit<EngagementData, 'engagementType' | 'focus'>
type StageCategory = "prospect" | "qualified" | "customer"

const engagementCategories = [
  "Ads and Blogs",
  "Events",
  "Marketing Outreach",
  "BDR outreach",
  "Site Page Visits",
  "Emails and Calls"
] as const

const categoryMap: Record<StageCategory, EngagementMetric> = {
  prospect: "numberProspectEngagements",
  qualified: "numQualifiedEngagements",
  customer: "numCustomerEngagements",
}

// Generate dummy data
const dummyData: EngagementData[] = [
    {
      engagementType: "Email Response",
      focus: "Product A",
      numberProspectEngagements: 84,
      numberQualifiedIn14Days: 15,
      numQualifiedEngagements: 103,
      numCustomerEngagements: 232,
    },
    {
      engagementType: "Call",
      focus: "Company Brand",
      numberProspectEngagements: 31,
      numberQualifiedIn14Days: 9,
      numQualifiedEngagements: 45,
      numCustomerEngagements: 35,
    },
    {
      engagementType: "Ad Click",
      focus: "Security",
      numberProspectEngagements: 326,
      numberQualifiedIn14Days: 25,
      numQualifiedEngagements: 24,
      numCustomerEngagements: 8,
    },
    {
      engagementType: "Event Registered",
      focus: "Product A",
      numberProspectEngagements: 70,
      numberQualifiedIn14Days: 13,
      numQualifiedEngagements: 4,
      numCustomerEngagements: 10,
    },
    {
      engagementType: "Event Attended",
      focus: "Company Brand",
      numberProspectEngagements: 55,
      numberQualifiedIn14Days: 13,
      numQualifiedEngagements: 4,
      numCustomerEngagements: 9,
    },
    {
      engagementType: "Campaigns",
      focus: "Security",
      numberProspectEngagements: 184,
      numberQualifiedIn14Days: 12,
      numQualifiedEngagements: 35,
      numCustomerEngagements: 4,
    },
    {
      engagementType: "Site Visit",
      focus: "Product A",
      numberProspectEngagements: 4012,
      numberQualifiedIn14Days: 3,
      numQualifiedEngagements: 543,
      numCustomerEngagements: 180,
    },
  ]

  const processDataForWebChart = (data: EngagementData[], stage: StageCategory, maxValues: Record<string, number>) => {
    const metricKey = categoryMap[stage]
  
    return engagementCategories.map((category) => {
      let value = 0
  
      if (category === "Ads and Blogs") {
        value = data.find((item) => item.engagementType === "Ad Click")?.[metricKey] || 0
      } else if (category === "Events") {
        value =
          (data.find((item) => item.engagementType === "Event Registered")?.[metricKey] || 0) +
          (data.find((item) => item.engagementType === "Event Attended")?.[metricKey] || 0)
      } else if (category === "Marketing Outreach") {
        value = data.find((item) => item.engagementType === "Campaigns")?.[metricKey] || 0
      } else if (category === "BDR outreach") {
        value =
          (data.find((item) => item.engagementType === "Email Response")?.[metricKey] || 0) +
          (data.find((item) => item.engagementType === "Call")?.[metricKey] || 0)
      } else if (category === "Site Page Visits") {
        value = data.find((item) => item.engagementType === "Site Visit")?.[metricKey] || 0
      } else if (category === "Emails and Calls") {
        value =
          (data.find((item) => item.engagementType === "Email Response")?.[metricKey] || 0) +
          (data.find((item) => item.engagementType === "Call")?.[metricKey] || 0)
      }
  
      // Normalize the value using the maximum for this category
      const normalizedValue = maxValues[category] ? value / maxValues[category] : 0
      return { category, value: normalizedValue }
    })
  }
  
  const calculateMaxValues = (data: EngagementData[]) => {
    const maxValues: Record<string, number> = {}
  
    engagementCategories.forEach((category) => {
      let max = 0
  
      data.forEach((item) => {
        let value = 0
  
        if (category === "Ads and Blogs") {
          value = item.engagementType === "Ad Click" ? item.numberProspectEngagements : 0
        } else if (category === "Events") {
          value =
            (item.engagementType === "Event Registered" ? item.numberProspectEngagements : 0) +
            (item.engagementType === "Event Attended" ? item.numberProspectEngagements : 0)
        } else if (category === "Marketing Outreach") {
          value = item.engagementType === "Campaigns" ? item.numberProspectEngagements : 0
        } else if (category === "BDR outreach") {
          value =
            (item.engagementType === "Email Response" ? item.numberProspectEngagements : 0) +
            (item.engagementType === "Call" ? item.numberProspectEngagements : 0)
        } else if (category === "Site Page Visits") {
          value = item.engagementType === "Site Visit" ? item.numberProspectEngagements : 0
        } else if (category === "Emails and Calls") {
          value =
            (item.engagementType === "Email Response" ? item.numberProspectEngagements : 0) +
            (item.engagementType === "Call" ? item.numberProspectEngagements : 0)
        }
  
        if (value > max) max = value
      })
  
      maxValues[category] = max
    })
  
    return maxValues
  }
  
    const WebChart = ({ data, title }: { data: { category: string; value: number }[]; title: string }) => (
    <div className="w-full max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center">{title}</h2>
      <div className="w-full h-[250px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
            <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  export default function EngagementWebCharts() {
    const maxValues = calculateMaxValues(dummyData)
  
    const prospectData = processDataForWebChart(dummyData, "prospect", maxValues)
    const qualifiedData = processDataForWebChart(dummyData, "qualified", maxValues)
    const customerData = processDataForWebChart(dummyData, "customer", maxValues)
  
    return (
      <div className="p-4">
        <WebChart data={prospectData} title="Prospect Engagement" />
        <WebChart data={qualifiedData} title="Qualified Engagement" />
        <WebChart data={customerData} title="Customer Engagement" />
      </div>
    )
  }
  




