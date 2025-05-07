"use client"
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveBar } from "@nivo/bar";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Add the custom parse format plugin
dayjs.extend(customParseFormat);

export default function LeadsTrendxSource() {
  const [chartData, setChartData] = useState([]);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { contacts } = await fetchExcel("/data/crm_data.xlsx");
        console.log("Sample contact date:", contacts[0]?.["Created Date"]);

        const groupedData = {};
        const allSources = new Set();

        contacts.forEach((contact) => {
          // Check the actual format of the date first
          let dateObj;
          const rawDate = contact["Created Date"];
          
          // Try multiple formats
          if (rawDate instanceof Date) {
            // If it's already a Date object
            dateObj = dayjs(rawDate);
          } else if (typeof rawDate === 'number') {
            // If it's an Excel serial number
            dateObj = dayjs('1899-12-30').add(rawDate, 'day');
          } else {
            // Try common formats
            const formats = ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "M/D/YYYY"];
            for (const format of formats) {
              const parsed = dayjs(rawDate, format);
              if (parsed.isValid()) {
                dateObj = parsed;
                break;
              }
            }
          }

          // If we couldn't parse the date, log and skip
          if (!dateObj || !dateObj.isValid()) {
            console.error("Invalid date:", rawDate, "for contact:", contact);
            return;
          }

          const rawMonth = dateObj.format("YYYY-MM"); // For sorting
          const displayMonth = dateObj.format("MMM YYYY"); // For display

          const source = contact["Identified Source"] || "Unknown";
          
          // Add to sources set
          allSources.add(source);

          if (!groupedData[rawMonth]) {
            groupedData[rawMonth] = { month: displayMonth }; // Use readable format in chart;
          }
          groupedData[rawMonth][source] = (groupedData[rawMonth][source] || 0) + 1;
        });

        // Sort the data by month
        const sortedMonths = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));
        const sortedData = sortedMonths.map(month => groupedData[month]);

        setChartData(sortedData);
        setSources(Array.from(allSources));
        
        console.log("Processed data:", sortedData);
        console.log("Sources found:", Array.from(allSources));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading chart data...</div>;
  }

  if (chartData.length === 0) {
    return <div>No data available. Check console for errors.</div>;
  }

  return (
    <div className="border border-primary-2 p-4 rounded-md bg-primary-2 w-full">
      <h2 className="text-primary-5 font-semibold">Contacts Created Per Month (By Source)</h2>
      <div className="w-full" style={{ height: "300px", minHeight: "300px", width: "100%" }}>
      <ResponsiveBar
        data={chartData}
        keys={sources}
        indexBy="month"
        margin={{ top: 15, right: 10, bottom: 50, left: 25 }}
        padding={0.3}
        colors={{ scheme: 'paired' }}
        groupMode="stacked"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: '',
          legendPosition: 'middle',
          legendOffset: 60
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff" // Set all labels to white
        legends={[
            {
              anchor: 'bottom-left',
              direction: 'row',
              translateY: 90, // Move further down
              itemsSpacing: 5,
              itemWidth: 80, // Reduce item width to fit more per row
              itemHeight: 20,
              symbolSize: 10,
              itemDirection: 'left-to-right',
              justify: false,
            }
          ]}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
      </div>
    </div>
  );
}