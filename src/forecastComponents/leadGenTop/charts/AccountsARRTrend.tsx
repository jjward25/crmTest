"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveLine } from "@nivo/line";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define an interface for the Account data with explicit typing
interface Account {
  [key: string]: string | number | Date | undefined;
  "Qualified Date"?: string | number | Date;
  "Stage"?: string;
  "ARR"?: number;
}

// Modify the interface to be compatible with LineDatum
interface GroupedDataItem {
  id: string;
  data: { x: string; y: number }[];
}

export default function AccountsARRTrendLine() {
  const [chartData, setChartData] = useState<GroupedDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        const groupedData: { 
          Won: { [month: string]: number },
          Lost: { [month: string]: number },
          Open: { [month: string]: number }
        } = {
          Won: {},
          Lost: {},
          Open: {}
        };

        const today = dayjs();
        const last18Months = [...Array(13)].map((_, i) =>
          today.subtract(i, "month").format("YYYY-MM")
        );

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

        // Type assertion to ensure Account type
        (accounts as Account[]).forEach((Account) => {
          const qualifiedDate = processDate(Account["Qualified Date"]);
          const stage = Account["Stage"];
          const arr = Account["ARR"] || 0;

          if (!qualifiedDate) return;

          const rawMonth = qualifiedDate.format("YYYY-MM");

          if (!last18Months.includes(rawMonth)) return;

          // Accumulate total ARR by month and stage
          if (stage === '4 - Customer' || stage === '5b - Churned') {
            groupedData.Won[rawMonth] = (groupedData.Won[rawMonth] || 0) + arr;
          } else if (stage === '5a - Closed Lost') {
            groupedData.Lost[rawMonth] = (groupedData.Lost[rawMonth] || 0) + arr;
          } else {
            groupedData.Open[rawMonth] = (groupedData.Open[rawMonth] || 0) + arr;
          }
        });

        // Create line chart data
        const processedData: GroupedDataItem[] = [
          {
            id: 'Won',
            data: last18Months.map(month => ({
              x: dayjs(month, "YYYY-MM").format("MMM YYYY"),
              y: Math.round((groupedData.Won[month] || 0) / 1000) * 1000
            })).reverse()
          },
          {
            id: 'Lost',
            data: last18Months.map(month => ({
              x: dayjs(month, "YYYY-MM").format("MMM YYYY"),
              y: Math.round((groupedData.Lost[month] || 0) / 1000) * 1000
            })).reverse()
          },
          {
            id: 'Open',
            data: last18Months.map(month => ({
              x: dayjs(month, "YYYY-MM").format("MMM YYYY"),
              y: Math.round((groupedData.Open[month] || 0) / 1000) * 1000
            })).reverse()
          }
        ];

        console.log("Processed ARR Data:", processedData);

        setChartData(processedData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) return <div>Loading chart data...</div>;
  if (chartData.length === 0) return <div>No data available. Check console for errors.</div>;

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 min-h-[200px] w-full">
      <h2 className="text-primary-3 font-semibold">{`Total ARR by Qualified Date`}</h2>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 15, right: 15, bottom: 80, left: 50 }}
          xScale={{ type: 'point' }}
          yScale={{ 
            type: 'linear', 
            min: 'auto', 
            max: 'auto'
          }}
          colors={["#587f76", "#c63637", "#869ead"]} // Green for Won, Red for Lost, Blue for Open
          pointSize={3}
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
            format: (value) => `$${(value / 1000).toLocaleString()}K`,
            tickValues: (function() {
              const maxValue = Math.max(...chartData.flatMap(serie => serie.data.map(point => point.y)));
              const step = 50000;  // $50,000 interval
              const ticks = [];
              for (let i = 0; i <= maxValue; i += step) {
                ticks.push(i);
              }
              return ticks;
            })(),
          }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 80,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 12,
              symbolShape: 'circle',
            }
          ]}
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
            legends: {
              text: {
                fill: "#869ead",
              },
            },
          }}
          tooltip={({ point }) => (
            <div 
              style={{ 
                padding: '9px 12px', 
                color: 'white', 
                background: point.serieColor,
                borderRadius: '4px'
              }}
            >
              <strong>{point.serieId}: </strong>
              {point.data.xFormatted}: 
              ${Math.round(Number(point.data.y) / 1000).toLocaleString()}K
            </div>
          )}
        />
      </div>
    </div>
  );
}