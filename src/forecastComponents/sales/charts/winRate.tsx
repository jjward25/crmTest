"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveLine } from "@nivo/line";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define interfaces for type safety
interface Account {
  "Qualified Date"?: string | number | Date;
  "Closed Date"?: string | number | Date;
  "Stage"?: string;
  "Account Name"?: string;
}

interface MonthData {
  wins: number;
  losses: number;
}

interface ChartDataItem {
  id: string;
  data: { x: string; y: number }[];
}

export default function WinRateByMonth() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monthStats, setMonthStats] = useState<Record<string, { wins: number; losses: number; total: number }>>({}); 
  const [accountStats, setAccountStats] = useState({
    total: 0,
    qualified: 0,
    open: 0,
    wins: 0,
    losses: 0
  });

  useEffect(() => {
    async function calculateWinRateByMonth() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        
        // Stats tracking
        const stats = {
          total: accounts.length,
          qualified: 0,
          open: 0,
          wins: 0,
          losses: 0
        };
        
        // Track win rates by month
        const monthlyStats: Record<string, MonthData> = {};
        const monthDetailsForTooltip: Record<string, { wins: number; losses: number; total: number }> = {};
        
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
        
        // Filter accounts with qualified date
        const qualifiedAccounts = accounts.filter((account: Account) => {
          const qualifiedDateObj = processDate(account["Qualified Date"]);
          return qualifiedDateObj !== null;
        });
        
        stats.qualified = qualifiedAccounts.length;
        
        // Get the last 13 months for consistent display
        const today = dayjs('2025-03-31');
        const last13Months = [...Array(13)].map((_, i) =>
          today.subtract(i, "month").format("YYYY-MM")
        ).sort((a, b) => a.localeCompare(b));
        
        // Initialize all months with zero values
        last13Months.forEach(month => {
          monthlyStats[month] = { wins: 0, losses: 0 };
        });
        
        qualifiedAccounts.forEach((account: Account) => {
          const stage = account["Stage"];
          
          // Check if in closed stages
          if (stage === "4 - Customer") {
            const closedDateObj = processDate(account["Closed Date"]);
            if (!closedDateObj) return;
            
            const closedMonth = closedDateObj.format("YYYY-MM");
            if (last13Months.includes(closedMonth)) {
              monthlyStats[closedMonth].wins++;
              stats.wins++;
            }
          } 
          else if (stage === "5a - Closed Lost") {
            const closedDateObj = processDate(account["Closed Date"]);
            if (!closedDateObj) return;
            
            const closedMonth = closedDateObj.format("YYYY-MM");
            if (last13Months.includes(closedMonth)) {
              monthlyStats[closedMonth].losses++;
              stats.losses++;
            }
          }
          else {
            // This is an open account
            stats.open++;
          }
        });
        
        // Calculate win rate for each month and prepare tooltip data
        const winRateData = last13Months.map(month => {
          const { wins, losses } = monthlyStats[month];
          const total = wins + losses;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          
          const displayMonth = dayjs(month).format("MMM YYYY");
          monthDetailsForTooltip[displayMonth] = { wins, losses, total };
          
          return {
            x: displayMonth,
            y: winRate
          };
        });
        
        const processedData = [
          {
            id: "Win Rate",
            data: winRateData
          }
        ];
        
        setChartData(processedData);
        setMonthStats(monthDetailsForTooltip);
        setAccountStats(stats);
        
      } catch (error) {
        console.error("Error calculating Win Rate by Month:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateWinRateByMonth();
  }, []);

  if (isLoading) return <div>Loading chart data...</div>;
  if (chartData.length === 0) return <div>No data available.</div>;

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 min-h-[200px] w-full">
      <h2 className="text-primary-2 font-semibold">{`Win Rate by Month (Qualified & Closed)`}</h2>
      <div style={{ height: "200px", width: "100%" }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 15, right: 15, bottom: 50, left: 40 }}
          xScale={{ type: 'point' }}
          yScale={{ 
            type: 'linear', 
            min: 0, 
            max: 100, 
            stacked: false 
          }}
          colors={["#587f76"]}
          pointSize={4}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          axisBottom={{ 
            tickSize: 5, 
            tickPadding: 5, 
            tickRotation: -45 
          }}
          axisLeft={{ 
            tickSize: 5, 
            tickPadding: 5, 
            format: (value) => `${Math.floor(Number(value))}%`
          }}
          legends={[{
            anchor: 'bottom',
            direction: 'row',
            translateY: 80,
            itemWidth: 130,
            itemHeight: 20,
            symbolSize: 12,
            symbolShape: 'square',
          }]}
          gridXValues={[]}
          theme={{
            grid: {
              line: {
                stroke: "#000", 
                strokeWidth: 1, 
                strokeDasharray: "2 4",
              },
            },
            axis: {
              ticks: {
                text: {
                  fill: "#869ead",
                },
              },
            },
            labels: {
              text: {
                fill: "#000",
              },
            },
            legends: {
              text: {
                fill: "#869ead",
              },
            },
          }}
          tooltip={({ point }) => {
            // Properly convert DatumValue types to strings/numbers
            const monthKey = String(point.data.x);
            const winRate = Number(point.data.y);
            const monthData = monthStats[monthKey];
            
            return (
              <div style={{ padding: '9px 12px', color: 'white', background: point.serieColor, borderRadius: '4px' }}>
                <strong>{monthKey}: </strong>
                {winRate}% Win Rate
                {monthData && (
                  <div className="text-sm mt-1">
                    Wins: {monthData.wins} | Losses: {monthData.losses} | Total: {monthData.total}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>Open Accounts: {accountStats.open} | Wins: {accountStats.wins} | Losses: {accountStats.losses}</p>
      </div>
    </div>
  );
}