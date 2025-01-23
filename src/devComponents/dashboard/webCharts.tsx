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

type EngagementMetric = keyof Omit<EngagementData, "engagementType" | "focus">
type StageCategory = "prospect" | "qualified" | "customer"

const engagementCategories = [
  "Ads and Blogs",
  "Events",
  "Marketing Outreach",
  "Sales Outreach",
  "Site Page Visits",
  "Emails and Calls",
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
    numberProspectEngagements: 30,
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
    numQualifiedEngagements: 1543,
    numCustomerEngagements: 314,
  },
  {
    engagementType: "Sales and Support",
    focus: "Product A",
    numberProspectEngagements: 52,
    numberQualifiedIn14Days: 19,
    numQualifiedEngagements: 133,
    numCustomerEngagements: 107,
  },
]

// Function to calculate max values for categories across all stages
const calculateMaxValuesForCategories = (data: EngagementData[]) => {
  const categoryMaxValues: Record<string, number> = {};

  engagementCategories.forEach((category) => {
    let maxValueForCategory = 0;

    data.forEach((item) => {
      let value = 0;

      // Access the correct engagement data based on the category
      if (category === "Ads and Blogs" && item.engagementType === "Ad Click") {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      } else if (
        category === "Events" &&
        (item.engagementType === "Event Registered" || item.engagementType === "Event Attended")
      ) {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      } else if (category === "Marketing Outreach" && item.engagementType === "Campaigns") {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      } else if (category === "Sales Outreach" && item.engagementType === "Sales and Support") {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      } else if (category === "Site Page Visits" && item.engagementType === "Site Visit") {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      } else if (
        category === "Emails and Calls" &&
        (item.engagementType === "Email Response" || item.engagementType === "Call")
      ) {
        value = Math.max(
          item.numberProspectEngagements,
          item.numQualifiedEngagements,
          item.numCustomerEngagements
        );
      }

      if (value > maxValueForCategory) {
        maxValueForCategory = value;
      }
    });

    categoryMaxValues[category] = maxValueForCategory;
  });

  return categoryMaxValues;
};



// Process data for the chart based on the stage
const processDataForWebChart = (
  data: EngagementData[],
  stage: StageCategory,
  maxValues: Record<string, number>
) => {
  const metricKey = categoryMap[stage];

  return engagementCategories.map((category) => {
    let value = 0;

    // Sum or find the relevant value for each category
    if (category === "Ads and Blogs") {
      value = data.find((item) => item.engagementType === "Ad Click")?.[metricKey] || 0;
    } else if (category === "Events") {
      value =
        (data.find((item) => item.engagementType === "Event Registered")?.[metricKey] || 0) +
        (data.find((item) => item.engagementType === "Event Attended")?.[metricKey] || 0);
    } else if (category === "Marketing Outreach") {
      value = data.find((item) => item.engagementType === "Campaigns")?.[metricKey] || 0;
    } else if (category === "Sales Outreach") {
      value = data.find((item) => item.engagementType === "Sales and Support")?.[metricKey] || 0;
    } else if (category === "Site Page Visits") {
      value = data.find((item) => item.engagementType === "Site Visit")?.[metricKey] || 0;
    } else if (category === "Emails and Calls") {
      value =
        (data.find((item) => item.engagementType === "Email Response")?.[metricKey] || 0) +
        (data.find((item) => item.engagementType === "Call")?.[metricKey] || 0);
    }

    // Normalize the value using the maximum for this category
    const normalizedValue = maxValues[category] 
      ? Math.min(value / maxValues[category], 1) // Cap at 1
      : 0;

    return { category, value: normalizedValue, actualValue: value };
  });
};


// WebChart component
const WebChart = ({
  data,
  title,
}: {
  data: { category: string; value: number; actualValue: number }[];
  title: string;
  maxValues: Record<string, number>; // Make sure maxValues is used here
}) => (
  <div className="w-full max-w-xl mx-auto">
    <h2 className="text-xl font-bold text-center">{title}</h2>
    <p className="text-primary-4 mt-2 text-sm text-center">Normalized</p>
    <div className="w-full h-[220px] text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis domain={[0, 1]} />
          <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-primary-3 p-2 border rounded shadow">
                    <p className="font-bold">{data.category}</p>
                    <p>Actual Value: {data.actualValue}</p>

                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);


// Main Component - Rendering Multiple Charts
export default function EngagementWebCharts() {
  const maxValues = calculateMaxValuesForCategories(dummyData)

  const prospectData = processDataForWebChart(dummyData, "prospect", maxValues)
  const qualifiedData = processDataForWebChart(dummyData, "qualified", maxValues)
  const customerData = processDataForWebChart(dummyData, "customer", maxValues)

  return (
    <div className="p-4">
      <WebChart data={prospectData} title="Prospect Engagement" maxValues={maxValues} />
      <WebChart data={qualifiedData} title="Qualified Engagement" maxValues={maxValues} />
      <WebChart data={customerData} title="Customer Engagement" maxValues={maxValues} />
    </div>
  )
}

