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

interface MonthCycleTime {
  totalCycleTime: number;
  count: number;
}

interface ChartDataItem {
  id: string;
  data: { x: string; y: number | null }[];
}

export default function CycleTimeByMonth() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monthCycleTimes, setMonthCycleTimes] = useState<Record<string, MonthCycleTime>>({});
  const [closedMonthCycleTimes, setClosedMonthCycleTimes] = useState<Record<string, MonthCycleTime>>({});

  useEffect(() => {
    async function calculateCycleTimeByMonth() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        const monthlyCycleTimes: Record<string, MonthCycleTime> = {};
        const closedMonthlyCycleTimes: Record<string, MonthCycleTime> = {};
        const last13Months = [...Array(13)].map((_, i) =>
          dayjs('2025-03-31').subtract(i, "month").format("YYYY-MM")
        ).sort((a, b) => a.localeCompare(b));

        last13Months.forEach(month => {
          monthlyCycleTimes[month] = { totalCycleTime: 0, count: 0 };
          closedMonthlyCycleTimes[month] = { totalCycleTime: 0, count: 0 };
        });

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

        accounts.forEach((account: Account) => {
          const qualifiedDateObj = processDate(account["Qualified Date"]);
          const closedDateObj = processDate(account["Closed Date"]);

          if (qualifiedDateObj && closedDateObj) {
            const differenceInDays = closedDateObj.diff(qualifiedDateObj, 'day');
            const qualifiedMonth = qualifiedDateObj.format("YYYY-MM");
            const closedMonth = closedDateObj.format("YYYY-MM");

            // Track by qualified month
            if (last13Months.includes(qualifiedMonth)) {
              monthlyCycleTimes[qualifiedMonth].totalCycleTime += differenceInDays;
              monthlyCycleTimes[qualifiedMonth].count++;
            }

            // Track by closed month
            if (last13Months.includes(closedMonth)) {
              closedMonthlyCycleTimes[closedMonth].totalCycleTime += differenceInDays;
              closedMonthlyCycleTimes[closedMonth].count++;
            }
          }
        });

        const qualifiedCycleTimeData = last13Months.map(month => {
          const { totalCycleTime, count } = monthlyCycleTimes[month];
          const averageCycleTime = count > 0 ? Math.round(totalCycleTime / count) : null;
          const displayMonth = dayjs(month).format("MMM-YY");
          return {
            x: displayMonth,
            y: averageCycleTime,
          };
        });

        const closedCycleTimeData = last13Months.map(month => {
          const { totalCycleTime, count } = closedMonthlyCycleTimes[month];
          const averageCycleTime = count > 0 ? Math.round(totalCycleTime / count) : null;
          const displayMonth = dayjs(month).format("MMM-YY");
          return {
            x: displayMonth,
            y: averageCycleTime,
          };
        });

        setChartData([
          { id: "Cycle Time by Qualified Month", data: qualifiedCycleTimeData },
          { id: "Cycle Time by Closed Month", data: closedCycleTimeData }
        ]);
        setMonthCycleTimes(monthlyCycleTimes);
        setClosedMonthCycleTimes(closedMonthlyCycleTimes);

      } catch (error) {
        console.error("Error calculating Cycle Time by Month:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculateCycleTimeByMonth();
  }, []);

  if (isLoading) return <div>Loading chart data...</div>;
  if (chartData.length === 0) return <div>No data available.</div>;

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 min-h-[200px] w-full">
      <h2 className="text-primary-2 font-semibold">Average Cycle Time (Qualified to Closed)</h2>
      <div style={{ height: "200px", width: "100%" }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 15, right: 20, bottom: 80, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false
          }}
          colors={["#a05195", "#2f4b7c"]}
          pointSize={4}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            legendOffset: -50,
            legendPosition: 'middle',
            format: value => `${value} days`,
            tickValues: (function() {
              const maxValue = Math.max(...chartData.flatMap(serie => 
                serie.data.map(point => point.y || 0)
              ));
              const step = 10;
              const ticks = [];
              for (let i = 0; i <= maxValue; i += step) {
                ticks.push(i);
              }
              return ticks;
            })()
          }}
          legends={[{
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 80,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 180,
            itemHeight: 20,
            symbolSize: 12,
            symbolShape: 'square',
            itemTextColor: "#869ead",
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
            const monthKey = String(point.data.x);
            const avgCycleTime = point.data.y;
            const monthData = point.serieId === "Cycle Time by Qualified Month" 
              ? monthCycleTimes[dayjs(monthKey, "MMM-YY").format("YYYY-MM")]
              : closedMonthCycleTimes[dayjs(monthKey, "MMM-YY").format("YYYY-MM")];

            return (
              <div style={{ padding: '9px 12px', color: 'white', background: point.serieColor, borderRadius: '4px' }}>
                <strong>{point.serieId} - {monthKey}: </strong>
                {avgCycleTime !== null ? `${avgCycleTime} days` : 'No data'}
                {monthData && monthData.count > 0 && (
                  <div className="text-sm mt-1">
                    Number of Deals: {monthData.count}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}