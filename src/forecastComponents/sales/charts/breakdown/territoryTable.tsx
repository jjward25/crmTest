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
  "Territory"?: string;
}

interface TerritoryData {
  qualified: number;
  won: number;
  lost: number;
  winRate: number;
  avgCycleTime: number; // days from created to closed
  avgCloseTime: number; // days from qualified to closed
}

interface MonthlyTerritoryData {
  [Territory: string]: TerritoryData;
}

export default function TerritoryTable() {
  const [TerritoryData, setTerritoryData] = useState<Record<string, MonthlyTerritoryData>>({});
  const [months, setMonths] = useState<string[]>([]);
  const [Territorys, setTerritorys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateTerritoryData() {
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
        
        const TerritorysByMonth: Record<string, MonthlyTerritoryData> = {};
        const uniqueTerritorys = new Set<string>();
        
        // Initialize data structure
        last6Months.forEach(month => {
          TerritorysByMonth[month] = {};
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
          
          // Default to "Unknown" if Territory is missing
          const Territory = account["Territory"] || "Unknown";
          uniqueTerritorys.add(Territory);
          
          if (!qualifiedDate) return;
          
          const qualifiedMonth = qualifiedDate.format("YYYY-MM");
          if (!last6Months.includes(qualifiedMonth)) return;
          
          // Initialize Territory data if it doesn't exist
          if (!TerritorysByMonth[qualifiedMonth][Territory]) {
            TerritorysByMonth[qualifiedMonth][Territory] = {
              qualified: 0,
              won: 0,
              lost: 0,
              winRate: 0,
              avgCycleTime: 0,
              avgCloseTime: 0
            };
          }
          
          const TerritoryInfo = TerritorysByMonth[qualifiedMonth][Territory];
          TerritoryInfo.qualified++;
          
          // Track closed deals
          if (closedDate) {
            // Calculate cycle time and close time
            const cycleTime = createdDate && closedDate ? closedDate.diff(createdDate, 'day') : 0;
            const closeTime = qualifiedDate && closedDate ? closedDate.diff(qualifiedDate, 'day') : 0;
            
            if (stage === "4 - Customer") {
              TerritoryInfo.won++;
              
              // Update average times for won deals
              if (cycleTime > 0) {
                const currentCycleTotal = TerritoryInfo.avgCycleTime * (TerritoryInfo.won - 1);
                TerritoryInfo.avgCycleTime = (currentCycleTotal + cycleTime) / TerritoryInfo.won;
              }
              
              if (closeTime > 0) {
                const currentCloseTotal = TerritoryInfo.avgCloseTime * (TerritoryInfo.won - 1);
                TerritoryInfo.avgCloseTime = (currentCloseTotal + closeTime) / TerritoryInfo.won;
              }
            } 
            else if (stage === "5a - Closed Lost") {
              TerritoryInfo.lost++;
            }
          }
        });
        
        // Calculate win rates for each Territory
        for (const month in TerritorysByMonth) {
          for (const Territory in TerritorysByMonth[month]) {
            const data = TerritorysByMonth[month][Territory];
            const totalClosed = data.won + data.lost;
            data.winRate = totalClosed > 0 ? (data.won / totalClosed) * 100 : 0;
            
            // Round the averages to whole numbers
            data.avgCycleTime = Math.round(data.avgCycleTime);
            data.avgCloseTime = Math.round(data.avgCloseTime);
          }
        }
        
        setTerritoryData(TerritorysByMonth);
        setMonths(last6Months.map(month => dayjs(month).format("MMM YYYY")));
        setTerritorys(Array.from(uniqueTerritorys).sort());
        
      } catch (error) {
        console.error("Error calculating Territory data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateTerritoryData();
  }, []);

  if (isLoading) return <div>Loading Territory data...</div>;
  if (Object.keys(TerritoryData).length === 0) return <div>No Territory data available.</div>;

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-full overflow-x-auto">
      <h2 className="text-primary-2 font-semibold mb-4">Win Rate by Territory (Last 6 Months)</h2>
      
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-primary-4">
            <th className="border border-primary-3 px-4 py-2 text-left sticky left-0 bg-primary-4 z-10">Month / Territory</th>
            {Territorys.map(Territory => (
              <th key={Territory} className="border border-primary-3 px-4 py-2 text-center" colSpan={6}>
                {Territory}
              </th>
            ))}
          </tr>
          <tr className="bg-primary-4">
            <th className="border border-primary-3 px-4 py-2 text-left sticky left-0 bg-primary-4 z-10">Metrics</th>
            {Territorys.map(Territory => (
              <React.Fragment key={`metrics-${Territory}`}>
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
                {Territorys.map(Territory => {
                  const data = TerritoryData[monthKey]?.[Territory] || {
                    qualified: 0, won: 0, lost: 0, winRate: 0, avgCycleTime: 0, avgCloseTime: 0
                  };
                  
                  return (
                    <React.Fragment key={`${month}-${Territory}`}>
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