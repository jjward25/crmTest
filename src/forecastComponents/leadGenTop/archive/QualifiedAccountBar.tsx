"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveBar } from "@nivo/bar";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define an interface for the contact data with explicit typing
interface Contact {
  [key: string]: string | number | Date | undefined;
  "Created Date"?: string | number | Date;
  "Warmed Date"?: string | number | Date;
  "Qualified Date"?: string | number | Date;
}

// Modify the interface to be compatible with BarDatum
interface GroupedDataItem {
  month: string;
  [key: string]: string | number;
  Created: number;
  Warmed: number;
  Qualified: number;
}

export default function AccountsBarTrend() {
  const [chartData, setChartData] = useState<GroupedDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        // Prepare data groups for different account stages
        const groupedData: { 
          [stage: string]: { [key: string]: number } 
        } = {
          Created: {},
          Warmed: {},
          Qualified: {}
        };

        const today = dayjs();
        const last18Months = [...Array(18)].map((_, i) =>
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

        // Type assertion to ensure Contact type
        (accounts as Contact[]).forEach((contact) => {
          // Process dates for each stage
          const stages = [
            { name: "Created", dateField: "Created Date" },
            { name: "Warmed", dateField: "Warmed Date" },
            { name: "Qualified", dateField: "Qualified Date" }
          ];

          stages.forEach(({ name, dateField }) => {
            const dateValue = contact[dateField];
            const dateObj = processDate(dateValue);
            
            if (!dateObj) return;

            const rawMonth = dateObj.format("YYYY-MM");
            const displayMonth = dateObj.format("MMM YYYY");

            if (!last18Months.includes(rawMonth)) return; // Filter only last 18 months

            if (!groupedData[name][rawMonth]) {
              groupedData[name][rawMonth] = 0;
            }

            groupedData[name][rawMonth] += 1;
          });
        });

        // Sort months and create data series
        const sortedMonths = last18Months.sort((a, b) => a.localeCompare(b));
        const processedData = sortedMonths.map(month => ({
          month: dayjs(month, "YYYY-MM").format("MMM YYYY"),
          Created: groupedData.Created[month] || 0,
          Warmed: groupedData.Warmed[month] || 0,
          Qualified: groupedData.Qualified[month] || 0
        }));

        console.log("Accounts Processed Data:", processedData);

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
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 min-h-[400px] w-full">
      <h2 className="text-primary-3 font-semibold">{`Accounts Actions by Month`}</h2>
      <div style={{ height: "400px", minHeight: "400px", width: "100%" }}>
        <ResponsiveBar
          data={chartData}
          keys={["Created", "Warmed", "Qualified"]}
          indexBy="month"
          groupMode="grouped"
          margin={{ top: 15, right: 15, bottom: 80, left: 40 }}
          padding={0.3}
          colors={["#cdba96","#869ead",  "#587f76"]} // Same colors as line chart
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            format: (value) => Math.floor(value),
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 80,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 130,
              itemHeight: 20,
              symbolSize: 12,
              symbolShape: 'square',
            }
          ]}

          theme={{
            grid: {
              line: {
                stroke: "#869ead", // Change this to modify the grid color
                strokeWidth: 1, 
                
              },
            },
            axis: {
              ticks: {
                text: {
                  fill: "#869ead", // Change axis label text color
                },
              },
            },
            labels: {
              text: {
                fill: "#000", // Change bar label text color
              },
            },
            legends: {
              text: {
                fill: "#869ead", // Change legend text color
              },
            },
          }}
          tooltip={({ id, value, color }) => (
            <div 
              style={{ 
                padding: '9px 12px', 
                color: 'white', 
                background: color,
                borderRadius: '4px'
              }}
            >
              <strong>{id}: </strong>
              {value}
            </div>
          )}
        />
      </div>
    </div>
  );
}