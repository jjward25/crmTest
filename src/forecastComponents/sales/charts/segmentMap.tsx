"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { Bar } from "recharts";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define interfaces for type safety
interface Account {
  "Qualified Date"?: string | number | Date;
  "Closed Date"?: string | number | Date;
  "Stage"?: string;
  "Account Name"?: string;
  "Segment"?: string;
  "ARR"?: number;
}

interface ChartData {
  name: string;
  wonARR: number;
  lostARR: number;
}

export default function SegmentARRChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totals, setTotals] = useState({
    won: 0,
    lost: 0,
    net: 0
  });

  useEffect(() => {
    async function calculateSegmentARR() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        
        // Process dates helper function
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
        
        // Define the 90-day window
        const endDate = dayjs('2025-03-31'); // From the specified date
        const startDate = endDate.subtract(90, 'day');
        
        // Track ARR by segment
        const segmentWonARR: Record<string, number> = {};
        const segmentLostARR: Record<string, number> = {};
        let totalWonARR = 0;
        let totalLostARR = 0;
        
        // Filter accounts closed in the last 90 days
        accounts.forEach((account: Account) => {
          const closedDateObj = processDate(account["Closed Date"]);
          if (!closedDateObj) return;
          
          // Check if the account was closed within our 90-day window
          if (closedDateObj.isAfter(startDate) && closedDateObj.isBefore(endDate.add(1, 'day'))) {
            const stage = account["Stage"];
            const segment = account["Segment"] || "Unknown";
            const arr = typeof account["ARR"] === 'number' ? account["ARR"] : 0;
            
            if (stage === "4 - Customer") {
              // Won deal
              segmentWonARR[segment] = (segmentWonARR[segment] || 0) + arr;
              totalWonARR += arr;
            } 
            else if (stage === "5a - Closed Lost") {
              // Lost deal
              segmentLostARR[segment] = (segmentLostARR[segment] || 0) + arr;
              totalLostARR += arr;
            }
          }
        });
        
        // Prepare data for chart
        const segmentData: ChartData[] = [];
        
        // Get all unique segments
        const allSegments = new Set<string>([
          ...Object.keys(segmentWonARR),
          ...Object.keys(segmentLostARR)
        ]);
        
        // Create chart data
        allSegments.forEach(segment => {
          segmentData.push({
            name: segment,
            wonARR: segmentWonARR[segment] || 0,
            lostARR: segmentLostARR[segment] || 0
          });
        });
        
        // Sort by net ARR impact (won - lost)
        segmentData.sort((a, b) => 
          (b.wonARR - b.lostARR) - (a.wonARR - a.lostARR)
        );
        
        setChartData(segmentData);
        setTotals({
          won: totalWonARR,
          lost: totalLostARR,
          net: totalWonARR - totalLostARR
        });
        
      } catch (error) {
        console.error("Error calculating Segment ARR:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateSegmentARR();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading segment ARR data...</div>;
  if (chartData.length === 0) return <div className="flex items-center justify-center h-64">No ARR data available for the last 90 days.</div>;

  return (
    <div className="border rounded-lg p-4 bg-primary-5 shadow w-full">
      <h2 className="text-xl font-semibold mb-2 text-primary-2">Outcomes by Segment (Last 90 Days)</h2>
      <p className="text-sm text-primary-3 mb-4">From Jan 1, 2025 to Mar 31, 2025</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 p-3 rounded-md">
          <div className="text-sm text-gray-600">Won ARR</div>
          <div className="text-lg font-bold text-green-700">{formatCurrency(totals.won)}</div>
        </div>
        <div className="bg-red-100 p-3 rounded-md">
          <div className="text-sm text-gray-600">Lost ARR</div>
          <div className="text-lg font-bold text-red-700">{formatCurrency(totals.lost)}</div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barGap={0}
          >
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value).replace(',000', 'k')}
            />
            <Tooltip 
                    formatter={(value, name) => {
                        if (name === "wonARR") return [formatCurrency(value as number), "Won ARR"];
                        if (name === "lostARR") return [formatCurrency(value as number), "Lost ARR"];
                        return [formatCurrency(value as number), name];
                    }}
                    labelFormatter={(label) => `Segment: ${label}`}
                    />
            <Legend 
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 0 }}
              payload={[
                { value: 'Won ARR', type: 'square', color: '#587f76' },
                { value: 'Lost ARR', type: 'square', color: '#869ead' }
              ]}
            />
            <Bar dataKey="wonARR" name="Won ARR" stackId="a">
              {chartData.map((entry, index) => (
                <Cell key={`cell-won-${index}`} fill="#587f76" />
              ))}
            </Bar>
            <Bar dataKey="lostARR" name="Lost ARR" stackId="a">
              {chartData.map((entry, index) => (
                <Cell key={`cell-lost-${index}`} fill="#869ead" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}