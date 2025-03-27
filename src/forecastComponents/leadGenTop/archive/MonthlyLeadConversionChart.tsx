"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
}

// Interface for monthly conversion data
interface MonthlyConversionData {
  month: string;
  qualifiedAccounts: number;
  disqualifiedAccounts: number;
  inProcessAccounts: number;
}

export default function MonthlyLeadConversionChart() {
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

        // Track monthly conversion data
        const monthlyConversionMap: { [key: string]: MonthlyConversionData } = {};

        // Process accounts
        (accounts as Contact[]).forEach((contact) => {
          const warmedDate = processDate(contact["Warmed Date"]);
          const qualifiedDate = processDate(contact["Qualified Date"]);
          const disqualifiedDate = processDate(contact["Disqualified Date"]);

          // Skip if Warmed Date is missing
          if (!warmedDate) return;

          // Create month key (YYYY-MM format)
          const monthKey = warmedDate.format("YYYY-MM");

          // Initialize month data if not exists
          if (!monthlyConversionMap[monthKey]) {
            monthlyConversionMap[monthKey] = {
              month: monthKey,
              qualifiedAccounts: 0,
              disqualifiedAccounts: 0,
              inProcessAccounts: 0
            };
          }

          // Categorize account
          if (qualifiedDate) {
            monthlyConversionMap[monthKey].qualifiedAccounts++;
          } else if (disqualifiedDate) {
            monthlyConversionMap[monthKey].disqualifiedAccounts++;
          } else {
            monthlyConversionMap[monthKey].inProcessAccounts++;
          }
        });

        // Convert map to sorted array
        const sortedMonthlyData = Object.values(monthlyConversionMap)
          .sort((a, b) => dayjs(a.month).diff(dayjs(b.month)));

        setMonthlyData(sortedMonthlyData);
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
    <div className="border border-primary-2 p-4 rounded-md bg-primary-2 min-h-[600px] w-full">
      <h2 className="text-primary-1 font-semibold mb-4">Monthly Lead Conversion Trend</h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45} 
            textAnchor="end"
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend 
            verticalAlign="top" 
            height={36}
          />
          <Bar 
            dataKey="qualifiedAccounts" 
            name="Qualified Accounts" 
            stackId="a" 
            fill="#82ca9d" 
          />
          <Bar 
            dataKey="disqualifiedAccounts" 
            name="Disqualified Accounts" 
            stackId="a" 
            fill="#8884d8" 
          />
          <Bar 
            dataKey="inProcessAccounts" 
            name="In-Process Accounts" 
            stackId="a" 
            fill="#ffc658" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}