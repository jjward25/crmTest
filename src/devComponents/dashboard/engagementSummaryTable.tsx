"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EngagementData = {
  engagementType: string;
  focus: string;
  numberProspectEngagements: number;
  replyRate: number; // New Field: Reply Rate (%)
  replySentiment: number; // New Field: Reply Sentiment (-2 to +2)
  numberQualifiedIn14Days: number;
  numQualifiedEngagements: number;
  numCustomerEngagements: number;
  cvr: number;
};

// Helper function to generate data for a single engagement type across multiple focuses
const generateEngagementData = (
  engagementType: string,
  focuses: string[],
  baseNumbers: {
    prospects: number;
    qualified14: number;
    qualified: number;
    customer: number;
  }
): EngagementData[] => {
  return focuses.map((focus) => ({
    engagementType,
    focus,
    numberProspectEngagements: baseNumbers.prospects + Math.floor(Math.random() * 200),
    replyRate: parseFloat((Math.random() * 24).toFixed(2)), // Generates a float between 0 and 24
    replySentiment: Math.floor(Math.random() * 5) - 2, // Generates an integer between -2 and +2
    numberQualifiedIn14Days: baseNumbers.qualified14 + Math.floor(Math.random() * 50),
    numQualifiedEngagements: baseNumbers.qualified + Math.floor(Math.random() * 70),
    numCustomerEngagements: baseNumbers.customer + Math.floor(Math.random() * 30),
    cvr: parseFloat((Math.random() * (7.8 - 0.4) + 0.4).toFixed(2)),
  }));
};

const focuses = ["Product A", "Company Brand", "Security", "Cloud Solutions", "Enterprise"];

const dummyData: EngagementData[] = [
  ...generateEngagementData("Email Response", focuses, {
    prospects: 1000,
    qualified14: 150,
    qualified: 200,
    customer: 80,
  }),
  ...generateEngagementData("Call", focuses, {
    prospects: 400,
    qualified14: 60,
    qualified: 90,
    customer: 35,
  }),
  ...generateEngagementData("Social Media", focuses, {
    prospects: 600,
    qualified14: 80,
    qualified: 120,
    customer: 50,
  }),
  // Add more engagement types as needed
];

// Helper function to group data by engagementType
const groupByEngagementType = (data: EngagementData[]) => {
  return data.reduce((groups, item) => {
    const group = groups[item.engagementType] || [];
    group.push(item);
    groups[item.engagementType] = group;
    return groups;
  }, {} as Record<string, EngagementData[]>);
};

// Helper function to calculate subtotals for each group
const calculateSubtotals = (group: EngagementData[]) => {
  const subtotal = group.reduce(
    (acc, item) => {
      acc.numberProspectEngagements += item.numberProspectEngagements;
      acc.replyRate += item.replyRate; // Sum for average
      acc.replySentiment += item.replySentiment; // Sum for average
      acc.numberQualifiedIn14Days += item.numberQualifiedIn14Days;
      acc.numQualifiedEngagements += item.numQualifiedEngagements;
      acc.numCustomerEngagements += item.numCustomerEngagements;
      acc.cvr += item.cvr;
      return acc;
    },
    {
      engagementType: "Subtotal",
      focus: "",
      numberProspectEngagements: 0,
      replyRate: 0, // Initialize
      replySentiment: 0, // Initialize
      numberQualifiedIn14Days: 0,
      numQualifiedEngagements: 0,
      numCustomerEngagements: 0,
      cvr: 0,
    }
  );

  const count = group.length;

  // Calculate averages
  subtotal.replyRate = parseFloat((subtotal.replyRate / count).toFixed(2));
  subtotal.replySentiment = Math.round(subtotal.replySentiment / count); // Rounded to nearest whole number
  subtotal.cvr = parseFloat((subtotal.cvr / count).toFixed(2));

  return subtotal;
};

export default function EngagementMetricsTable() {
  // Group data by engagementType
  const groupedData = useMemo(() => groupByEngagementType(dummyData), []);

  // Get sorted engagement types for consistent rendering
  const sortedEngagementTypes = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Engagement Type</TableHead>
            <TableHead>Focus</TableHead>
            <TableHead className="text-right">Prospect Engagements</TableHead>
            <TableHead className="text-right">Reply Rate (%)</TableHead> {/* New Column */}
            <TableHead className="text-right">Reply Sentiment</TableHead> {/* New Column */}
            <TableHead className="text-right">Qualified in 14 Days</TableHead>
            <TableHead className="text-right">Qualified Engagements</TableHead>
            <TableHead className="text-right">Customer Engagements</TableHead>
            <TableHead className="text-right">CVR (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEngagementTypes.map((engagementType) => {
            const group = groupedData[engagementType];
            const subtotal = calculateSubtotals(group);

            return (
              <React.Fragment key={engagementType}>
                {group.map((row, index) => (
                  <TableRow
                    key={`${row.engagementType}-${row.focus}-${index}`}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{row.engagementType}</TableCell>
                    <TableCell>{row.focus}</TableCell>
                    <TableCell className="text-right">
                      {row.numberProspectEngagements.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.replyRate.toFixed(2)}%
                    </TableCell> {/* New Data Cell */}
                    <TableCell className="text-right">{row.replySentiment}</TableCell> {/* New Data Cell */}
                    <TableCell className="text-right">
                      {row.numberQualifiedIn14Days.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.numQualifiedEngagements.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.numCustomerEngagements.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{`${row.cvr}%`}</TableCell>
                  </TableRow>
                ))}

                {/* Subtotal Row */}
                <TableRow className="bg-gray-200 font-semibold">
                  <TableCell>Subtotal</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    {subtotal.numberProspectEngagements.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {subtotal.replyRate.toFixed(2)}%
                  </TableCell> {/* Subtotal for Reply Rate */}
                  <TableCell className="text-right">{subtotal.replySentiment}</TableCell> {/* Subtotal for Reply Sentiment */}
                  <TableCell className="text-right">
                    {subtotal.numberQualifiedIn14Days.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {subtotal.numQualifiedEngagements.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {subtotal.numCustomerEngagements.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{`${subtotal.cvr}%`}</TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}