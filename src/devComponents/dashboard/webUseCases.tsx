"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type UseCaseEngagementData = {
  useCase: string;
  focus: string;
  numberProspectEngagements: number;
  numberQualifiedIn14Days: number;
  numQualifiedEngagements: number;
  numCustomerEngagements: number;
};

type StageCategory = "prospect" | "qualified14" | "qualified" | "customer";

const useCaseCategories = [
  "Use Case A",
  "Use Case B",
  "Use Case C",
  "Use Case D",
  "Use Case E",
  "Use Case F",
] as const;


// Generate dummy data
const generateUseCaseEngagementData = (
  useCase: string,
  focuses: string[],
  baseNumbers: {
    prospects: number;
    qualified14: number;
    qualified: number;
    customer: number;
  }
): UseCaseEngagementData[] => {
  return focuses.map((focus) => ({
    useCase,
    focus,
    numberProspectEngagements:
      baseNumbers.prospects + Math.floor(Math.random() * 200),
    numberQualifiedIn14Days:
      baseNumbers.qualified14 + Math.floor(Math.random() * 50),
    numQualifiedEngagements:
      baseNumbers.qualified + Math.floor(Math.random() * 70),
    numCustomerEngagements:
      baseNumbers.customer + Math.floor(Math.random() * 30),
  }));
};

const dummyData: UseCaseEngagementData[] = [
    {
      useCase: "Use Case A",
      focus: "Product A",
      numberProspectEngagements: 44,
      numberQualifiedIn14Days: 12,
      numQualifiedEngagements: 34,
      numCustomerEngagements: 45,
    },
    {
      useCase: "Use Case B",
      focus: "Company Brand",
      numberProspectEngagements: 16,
      numberQualifiedIn14Days: 2,
      numQualifiedEngagements: 6,
      numCustomerEngagements: 26,
    },
    {
      useCase: "Use Case C",
      focus: "Security",
      numberProspectEngagements: 12,
      numberQualifiedIn14Days: 1,
      numQualifiedEngagements: 14,
      numCustomerEngagements: 5,
    },
    {
      useCase: "Use Case D",
      focus: "Cloud Solutions",
      numberProspectEngagements: 18,
      numberQualifiedIn14Days: 3,
      numQualifiedEngagements: 4,
      numCustomerEngagements: 15,
    },
    {
      useCase: "Use Case E",
      focus: "Enterprise",
      numberProspectEngagements: 54,
      numberQualifiedIn14Days: 18,
      numQualifiedEngagements: 4,
      numCustomerEngagements: 2,
    },
    {
      useCase: "Use Case F",
      focus: "Product A",
      numberProspectEngagements: 24,
      numberQualifiedIn14Days: 7,
      numQualifiedEngagements: 4,
      numCustomerEngagements: 0,
    },
  ]

// Combine data for all stages and calculate cumulative values
const processStackedData = (
  data: UseCaseEngagementData[]
): { category: string; prospect: number; qualified14: number; qualified: number; customer: number }[] => {
  return useCaseCategories.map((category) => {
    const matchingData = data.find((item) => item.useCase === category);
    if (!matchingData)
      return { category, prospect: 0, qualified14: 0, qualified: 0, customer: 0 };

    const prospect = matchingData.numberProspectEngagements;
    const qualified14 = prospect + matchingData.numberQualifiedIn14Days;
    const qualified = qualified14 + matchingData.numQualifiedEngagements;
    const customer = qualified + matchingData.numCustomerEngagements;

    return { category, prospect, qualified14, qualified, customer };
  });
};


// Stacked radar chart component
const UseCaseWebChart = ({
  data,
  featureMaxValues,
}: {
  data: { category: string; prospect: number; qualified14:number; qualified: number; customer: number }[];
  featureMaxValues: Record<string, number>;
}) => (
  <div className="w-full max-w-xl mx-auto">
    <div className="w-full h-[300px] text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis
            domain={[0, Math.max(...Object.values(featureMaxValues))]}
          />
          <Radar
            name="Customer"
            dataKey="customer"
            stroke="#ffc658"
            fill="#ffc658"
            fillOpacity={0.6}
          />
          <Radar
            name="Qualified"
            dataKey="qualified"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
          <Radar
            name="Qualified 14 Days"
            dataKey="qualified14"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
          <Radar
            name="Prospect"
            dataKey="prospect"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip formatter={(value) => value.toLocaleString()} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function StackedUseCaseWebChart() {
  const [stackedData, setStackedData] = useState<
    { category: string; prospect: number; qualified14:number; qualified: number; customer: number }[]
  >([]);
  const [featureMaxValues, setFeatureMaxValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const processedData = processStackedData(dummyData);
    setStackedData(processedData);

    const maxValues = useCaseCategories.reduce((acc, category) => {
      const maxValue = Math.max(
        ...dummyData.map((item) => Math.max(
          item.numberProspectEngagements,
          item.numberQualifiedIn14Days+item.numberProspectEngagements,
          item.numQualifiedEngagements + item.numberProspectEngagements + item.numberQualifiedIn14Days,
          item.numCustomerEngagements +
            item.numQualifiedEngagements +
            item.numberProspectEngagements + item.numberQualifiedIn14Days
        ))
      );
      acc[category] = maxValue;
      return acc;
    }, {} as Record<string, number>);

    setFeatureMaxValues(maxValues);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Engagement by Use Case</h1>
      <UseCaseWebChart data={stackedData} featureMaxValues={featureMaxValues} />
    </div>
  );
}
