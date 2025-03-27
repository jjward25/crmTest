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
  "Qualified Date"?: string | number | Date;
  "Stage"?: string;
  "ARR"?: number;
}

// Modify the interface to be compatible with BarDatum
interface GroupedDataItem {
  month: string;
  [key: string]: string | number;
  Won: number;
  Lost: number;
  Open: number;
}

export default function AccountsARRTrend() {
  const [chartData, setChartData] = useState<GroupedDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        const groupedData: { [month: string]: { 
          Won: number[];
          Lost: number[];
          Open: number[];
        }} = {};

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
          const qualifiedDate = processDate(contact["Qualified Date"]);
          const stage = contact["Stage"];
          const arr = contact["ARR"] || 0;

          if (!qualifiedDate) return;

          const rawMonth = qualifiedDate.format("YYYY-MM");

          if (!last18Months.includes(rawMonth)) return;

          // Initialize month if not exists
          if (!groupedData[rawMonth]) {
            groupedData[rawMonth] = { 
              Won: [], 
              Lost: [], 
              Open: [] 
            };
          }

          // Categorize based on stage and add ARR
          if (stage === '4 - Customer' || stage === '5b - Churned') {
            groupedData[rawMonth].Won.push(arr);
          } else if (stage === '5a - Closed Lost') {
            groupedData[rawMonth].Lost.push(arr);
          } else {
            groupedData[rawMonth].Open.push(arr);
          }
        });

        // Calculate average ARR for each month and category
        const processedData = Object.keys(groupedData).map(month => ({
          month: dayjs(month, "YYYY-MM").format("MMM YYYY"),
          Won: groupedData[month].Won.length > 0 
            ? Math.round(groupedData[month].Won.reduce((a, b) => a + b, 0) / groupedData[month].Won.length / 1000) * 1000
            : 0,
          Lost: groupedData[month].Lost.length > 0 
            ? Math.round(groupedData[month].Lost.reduce((a, b) => a + b, 0) / groupedData[month].Lost.length / 1000) * 1000
            : 0,
          Open: groupedData[month].Open.length > 0 
            ? Math.round(groupedData[month].Open.reduce((a, b) => a + b, 0) / groupedData[month].Open.length / 1000) * 1000
            : 0
        })).sort((a, b) => dayjs(a.month, "MMM YYYY").diff(dayjs(b.month, "MMM YYYY")));

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
    <div className="border border-primary-2 p-4 rounded-md bg-primary-2 min-h-[400px] w-full">
      <h2 className="text-primary-5 font-semibold">{`Average ARR by Account Stage`}</h2>
      <div style={{ height: "400px", minHeight: "400px", width: "100%" }}>
        <ResponsiveBar
          data={chartData}
          keys={["Won", "Lost", "Open"]}
          indexBy="month"
          margin={{ top: 15, right: 15, bottom: 80, left: 60 }}
          padding={0.3}
          colors={["#587f76", "#c63637", "#869ead"]} // Green for Won, Red for Lost, Blue for Open
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            format: (value) => `$${(value / 1000).toLocaleString()}K`,
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
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 12,
              symbolShape: 'square',
            }
          ]}
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
              ${(value / 1000).toLocaleString()}K
            </div>
          )}
        />
      </div>
    </div>
  );
}