"use client";
import React, { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define interfaces for type safety
interface Account {
  "Qualified Date"?: string | number | Date;
  "Created Date"?: string | number | Date;
  "Closed Date"?: string | number | Date;
  "Stage"?: string;
  "Account Name"?: string;
  "Segment"?: string;
}

interface SegmentData {
  qualified: number;
  won: number;
  lost: number;
  winRate: number;
  avgCycleTime: number; // days from created to closed
  avgCloseTime: number; // days from qualified to closed
}

interface MonthlySegmentData {
  [segment: string]: SegmentData;
}

export default function SegmentTable() {
  const [segmentData, setSegmentData] = useState<Record<string, MonthlySegmentData>>({});
  const [months, setMonths] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateSegmentData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        
        function processDate(dateValue: string | number | Date | undefined): dayjs.Dayjs | null {
          if (dateValue === undefined || dateValue === null || dateValue === "") return null;
          let dateObj: dayjs.Dayjs | null = null;

          if (dateValue instanceof Date) {
            dateObj = dayjs(dateValue);
          } else if (typeof dateValue === "number") {
            dateObj = dayjs("1899-12-30").add(dateValue, "day");
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
        
        // Get the last 6 months for the table display
        const today = dayjs('2025-03-31');
        const last6Months = [...Array(6)].map((_, i) =>
          today.subtract(i, "month").format("YYYY-MM")
        ).sort((a, b) => a.localeCompare(b));
        
        const segmentsByMonth: Record<string, MonthlySegmentData> = {};
        const uniqueSegments = new Set<string>();
        
        // Initialize data structure
        last6Months.forEach(month => {
          segmentsByMonth[month] = {};
        });
        
        // Filter accounts with qualified date
        const qualifiedAccounts = accounts.filter((account: Account) => {
          const qualifiedDateObj = processDate(account["Qualified Date"]);
          return qualifiedDateObj !== null;
        });
        
        // Process each account
        qualifiedAccounts.forEach((account: Account) => {
          const qualifiedDate = processDate(account["Qualified Date"]);
          const closedDate = processDate(account["Closed Date"]);
          const createdDate = processDate(account["Created Date"]);
          const stage = account["Stage"];
          
          // Default to "Unknown" if segment is missing
          const segment = account["Segment"] || "Unknown";
          uniqueSegments.add(segment);
          
          if (!qualifiedDate) return;
          
          const qualifiedMonth = qualifiedDate.format("YYYY-MM");
          if (!last6Months.includes(qualifiedMonth)) return;
          
          // Initialize segment data if it doesn't exist
          if (!segmentsByMonth[qualifiedMonth][segment]) {
            segmentsByMonth[qualifiedMonth][segment] = {
              qualified: 0,
              won: 0,
              lost: 0,
              winRate: 0,
              avgCycleTime: 0,
              avgCloseTime: 0
            };
          }
          
          const segmentInfo = segmentsByMonth[qualifiedMonth][segment];
          segmentInfo.qualified++;
          
          // Track closed deals
          if (closedDate) {
            // Calculate cycle time and close time
            const cycleTime = createdDate && closedDate ? closedDate.diff(createdDate, 'day') : 0;
            const closeTime = qualifiedDate && closedDate ? closedDate.diff(qualifiedDate, 'day') : 0;
            
            if (stage === "4 - Customer") {
              segmentInfo.won++;
              
              // Update average times for won deals
              if (cycleTime > 0) {
                const currentCycleTotal = segmentInfo.avgCycleTime * (segmentInfo.won - 1);
                segmentInfo.avgCycleTime = (currentCycleTotal + cycleTime) / segmentInfo.won;
              }
              
              if (closeTime > 0) {
                const currentCloseTotal = segmentInfo.avgCloseTime * (segmentInfo.won - 1);
                segmentInfo.avgCloseTime = (currentCloseTotal + closeTime) / segmentInfo.won;
              }
            } 
            else if (stage === "5a - Closed Lost") {
              segmentInfo.lost++;
            }
          }
        });
        
        // Calculate win rates for each segment
        for (const month in segmentsByMonth) {
          for (const segment in segmentsByMonth[month]) {
            const data = segmentsByMonth[month][segment];
            const totalClosed = data.won + data.lost;
            data.winRate = totalClosed > 0 ? (data.won / totalClosed) * 100 : 0;
            
            // Round the averages to whole numbers
            data.avgCycleTime = Math.round(data.avgCycleTime);
            data.avgCloseTime = Math.round(data.avgCloseTime);
          }
        }
        
        setSegmentData(segmentsByMonth);
        setMonths(last6Months.map(month => dayjs(month).format("MMM YYYY")));
        setSegments(Array.from(uniqueSegments).sort());
        
      } catch (error) {
        console.error("Error calculating segment data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateSegmentData();
  }, []);

  if (isLoading) return <div>Loading segment data...</div>;
  if (Object.keys(segmentData).length === 0) return <div>No segment data available.</div>;

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-full overflow-x-auto">
      <h2 className="text-primary-2 font-semibold mb-4">Win Rate by Segment (Last 6 Months)</h2>
      
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-primary-4">
            <th className="border border-primary-3 px-4 py-2 text-left sticky left-0 bg-primary-4 z-10">Month / Segment</th>
            {segments.map(segment => (
              <th key={segment} className="border border-primary-3 px-4 py-2 text-center" colSpan={6}>
                {segment}
              </th>
            ))}
          </tr>
          <tr className="bg-primary-4">
            <th className="border border-primary-3 px-4 py-2 text-left sticky left-0 bg-primary-4 z-10">Metrics</th>
            {segments.map(segment => (
              <React.Fragment key={`metrics-${segment}`}>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Win %</th>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Qualified</th>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Won</th>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Lost</th>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Cycle (days)</th>
                <th className="border border-primary-3 px-2 py-1 text-center text-xs">Close (days)</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => {
            const monthKey = dayjs(month, "MMM YYYY").format("YYYY-MM");
            return (
              <tr key={month} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-primary-3 px-4 py-2 font-medium sticky left-0 z-10" style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f9fafb" }}>
                  {month}
                </td>
                {segments.map(segment => {
                  const data = segmentData[monthKey]?.[segment] || {
                    qualified: 0, won: 0, lost: 0, winRate: 0, avgCycleTime: 0, avgCloseTime: 0
                  };
                  
                  return (
                    <React.Fragment key={`${month}-${segment}`}>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.winRate > 0 ? `${Math.round(data.winRate)}%` : '-'}
                      </td>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.qualified > 0 ? data.qualified : '-'}
                      </td>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.won > 0 ? data.won : '-'}
                      </td>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.lost > 0 ? data.lost : '-'}
                      </td>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.avgCycleTime > 0 ? data.avgCycleTime : '-'}
                      </td>
                      <td className="border border-primary-3 px-2 py-1 text-center">
                        {data.avgCloseTime > 0 ? data.avgCloseTime : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>Cycle Time: Average days from Created Date to Closed Date</p>
        <p>Close Time: Average days from Qualified Date to Closed Date</p>
      </div>
    </div>
  );
}