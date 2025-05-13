"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Line, ComposedChart } from "recharts";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define an interface for the contact data
interface Contact {
  [key: string]: string | number | Date | undefined;
  "Created Date"?: string | number | Date;
  "Warmed Date"?: string | number | Date;
  "Qualified Date"?: string | number | Date;
  "Disqualified Date"?: string | number | Date;
  "Stage"?: string;
}

// Interface for monthly conversion data
interface MonthlyConversionData {
  month: string;
  qualifiedAccounts: number;
  disqualifiedAccounts: number;
  "In-Process Accounts": number;
  "0 - Identified"?: number;
  "1 - Prospecting"?: number;
  "2 - Warm"?: number;
  qualifiedPercentage?: string;
  qualificationRate?: number;
  trailing3MonthRate?: number;
}

export default function MonthlyQualificationsTrend() {
  const [monthlyData, setMonthlyData] = useState<MonthlyConversionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        // Helper function to process dates
        function processDate(dateValue: string | number | Date | undefined): dayjs.Dayjs | null {
          if (dateValue === undefined) return null;

          let dateObj: dayjs.Dayjs | null = null;

          if (dateValue instanceof Date) {
            dateObj = dayjs(dateValue);
          } else if (typeof dateValue === "number") {
            dateObj = dayjs("1899-12-30").add(dateValue, "day"); // Convert Excel serial number
          } else if (typeof dateValue === "string") {
            const formats = ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "M/D/YYYY"];
            for (const format of formats) {
              const parsed = dayjs(dateValue, format);
              if (parsed.isValid()) {
                dateObj = parsed;
                break;
              }
            }
          }

          return dateObj && dateObj.isValid() ? dateObj : null;
        }

        const today = dayjs('2025-03-31');
        const lastThirteenMonths: string[] = Array.from({ length: 13 }, (_, i) =>
          today.subtract(12 - i, "month").format("YYYY-MM")
        );
        const mostRecentMonth = dayjs('2025-03-31').format("YYYY-MM");

        // Track monthly conversion data
        const monthlyConversionMap: { [key: string]: MonthlyConversionData } = {};
        lastThirteenMonths.forEach((month) => {
          monthlyConversionMap[month] = {
            month: month,
            qualifiedAccounts: 0,
            disqualifiedAccounts: 0,
            "In-Process Accounts": 0,
            "0 - Identified": 0,
            "1 - Prospecting": 0,
            "2 - Warm": 0,
          };
        });

        // Process accounts
        (accounts as Contact[]).forEach((contact) => {
          const qualifiedDate = processDate(contact["Qualified Date"]);
          const disqualifiedDate = processDate(contact["Disqualified Date"]);
          const stage = contact["Stage"] ? contact["Stage"].toString().trim() : undefined;

          // Qualified Accounts
          if (qualifiedDate) {
            const qualifiedMonth = qualifiedDate.format("YYYY-MM");
            if (lastThirteenMonths.includes(qualifiedMonth)) {
              monthlyConversionMap[qualifiedMonth].qualifiedAccounts++;
            }
          }

          // Disqualified Accounts
          if (disqualifiedDate) {
            const disqualifiedMonth = disqualifiedDate.format("YYYY-MM");
            if (lastThirteenMonths.includes(disqualifiedMonth)) {
              monthlyConversionMap[disqualifiedMonth].disqualifiedAccounts++;
            }
          }

          // In-Process Accounts (only for the most recent month)
          if (mostRecentMonth === "2025-03") {
            const qualifiedInLast13 = qualifiedDate && lastThirteenMonths.includes(qualifiedDate.format("YYYY-MM"));
            const disqualifiedInLast13 = disqualifiedDate && lastThirteenMonths.includes(disqualifiedDate.format("YYYY-MM"));

            if (!qualifiedInLast13 && !disqualifiedInLast13 && stage) {
              if (stage.toLowerCase() === "0 - identified") {
                monthlyConversionMap[mostRecentMonth]["In-Process Accounts"]++;
                monthlyConversionMap[mostRecentMonth]["0 - Identified"] = (monthlyConversionMap[mostRecentMonth]["0 - Identified"] || 0) + 1;
              } else if (stage.toLowerCase() === "1 - prospecting") {
                monthlyConversionMap[mostRecentMonth]["In-Process Accounts"]++;
                monthlyConversionMap[mostRecentMonth]["1 - Prospecting"] = (monthlyConversionMap[mostRecentMonth]["1 - Prospecting"] || 0) + 1;
              } else if (stage.toLowerCase() === "2 - warm") {
                monthlyConversionMap[mostRecentMonth]["In-Process Accounts"]++;
                monthlyConversionMap[mostRecentMonth]["2 - Warm"] = (monthlyConversionMap[mostRecentMonth]["2 - Warm"] || 0) + 1;
              }
            }
          }
        });

        // Convert map to array and calculate percentages
        const monthlyDataArray = Object.values(monthlyConversionMap).map(data => {
          const total = data.qualifiedAccounts + data.disqualifiedAccounts;
          const qualificationRate = total > 0 ? (data.qualifiedAccounts / total) * 100 : 0;
          const qualifiedPercentage = total > 0 ? `${qualificationRate.toFixed(0)}%` : "0%";
          
          return { 
            ...data, 
            qualifiedPercentage,
            qualificationRate // Store the numeric rate for trend line calculations
          };
        });

        // Calculate trailing 3-month average for qualification rate
        monthlyDataArray.forEach((data, index) => {
          if (index >= 2) {
            // Get the last 3 months of data
            const lastThreeMonths = [
              monthlyDataArray[index],
              monthlyDataArray[index - 1],
              monthlyDataArray[index - 2]
            ];
            
            // Calculate average qualification rate
            const sum = lastThreeMonths.reduce((acc, month) => acc + (month.qualificationRate || 0), 0);
            data.trailing3MonthRate = sum / 3;
          }
        });

        setMonthlyData(monthlyDataArray);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) return <div>Loading Monthly Conversion Chart...</div>;
  if (monthlyData.length === 0) return <div>No data available.</div>;

  return (
    <div className="border border-primary-3 py-4 rounded-md bg-primary-5 min-h-[200px] w-full">
      <h2 className="text-primary-2 font-semibold mb-4 pl-4">Monthly Qualifications %</h2>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={monthlyData}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 10 }} 
            label={{ value: "Accounts", angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10 } }}
            domain={[0, 80]}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            domain={[0, 60]}
            tick={{ fontSize: 10 }}
            label={{ value: "Percentage (%)", angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10  } }}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip 
            formatter={(value: number | string, name: string) => {
              if (name === "Trailing 3-Month Qualified %") {
                return [`${Number(value).toFixed(1)}%`, name];
              }
              return [value, name];
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center" 
            height={50} 
            wrapperStyle={{ fontSize: 10, paddingTop: 30 }} 
          />

          <Bar
            yAxisId="left"
            dataKey="qualifiedAccounts"
            name="Qualified Accounts"
            stackId="conversion"
            fill="#82ca9d"
          />
          <Bar
            yAxisId="left"
            dataKey="disqualifiedAccounts"
            name="Disqualified Accounts"
            stackId="conversion"
            fill="#8884d8"
          >
            <LabelList 
              dataKey="qualifiedAccounts" 
              position="top" 
              fill="#869ead" 
              fontSize={10} 
            />
          </Bar>
          
          <Bar
            yAxisId="left"
            dataKey="0 - Identified"
            name="In-Process: Identified"
            fill="#a8dadc"
          />
          <Bar
            yAxisId="left"
            dataKey="1 - Prospecting"
            name="In-Process: Prospecting"
            fill="#457b9d"
          />
          <Bar
            yAxisId="left"
            dataKey="2 - Warm"
            name="In-Process: Warmed"
            fill="#cdba96"
          />

          {/* Trend line for trailing 3-month qualified percentage */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="trailing3MonthRate"
            name="Trailing 3-Month Qualified %"
            stroke="#587f76"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          >
            <LabelList 
              dataKey="trailing3MonthRate" 
              position="top" 
              fill="#cdba96" 
              fontSize={10}
              formatter={(value: number | undefined) => value ? `${value.toFixed(0)}%` : ""}
              />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}