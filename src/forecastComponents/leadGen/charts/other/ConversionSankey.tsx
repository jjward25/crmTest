"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveSankey } from "@nivo/sankey";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Define an interface for the Account data
interface Account {
  [key: string]: string | number | Date | undefined;
  "Created Date"?: string | number | Date;
  "Warmed Date"?: string | number | Date;
  "Qualified Date"?: string | number | Date;
}

// Define types for Sankey nodes and links
interface SankeyNode {
  id: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export default function LeadConversionSankey() {
  const [sankeyData, setSankeyData] = useState<{ nodes: SankeyNode[]; links: SankeyLink[] }>({ 
    nodes: [], 
    links: [] 
  });
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

        // Function to calculate days between dates
        function calculateDaysBetween(start: dayjs.Dayjs, end: dayjs.Dayjs): number {
          return end.diff(start, 'day');
        }

        // Buckets for conversion times
        const warmedBuckets = [
          { label: "Warmed in < 14 Days", min: 0, max: 14 },
          { label: "Warmed in 14-30 Days", min: 14, max: 30 },
          { label: "Warmed in 30+ Days", min: 30, max: Infinity }
        ];

        const qualifiedBuckets = [
          { label: "Qualified in < 14 Days", min: 0, max: 14 },
          { label: "Qualified in 14-30 Days", min: 14, max: 30 },
          { label: "Qualified in 30+ Days", min: 30, max: Infinity }
        ];

        // Tracking conversion data
        const conversionCounts: { [key: string]: number } = {};

        // Process accounts
        (accounts as Account[]).forEach((Account) => {
          const createdDate = processDate(Account["Created Date"]);
          const warmedDate = processDate(Account["Warmed Date"]);
          const qualifiedDate = processDate(Account["Qualified Date"]);

          // Skip if any critical date is missing
          if (!createdDate || !warmedDate || !qualifiedDate) return;

          // Calculate days between Created and Warmed
          const daysToWarmed = calculateDaysBetween(createdDate, warmedDate);

          // Determine Warmed Bucket
          const warmedBucket = warmedBuckets.find(
            bucket => daysToWarmed >= bucket.min && daysToWarmed < bucket.max
          )?.label || "Warmed in 30+ Days";

          // Calculate days between Warmed and Qualified
          const daysToQualified = calculateDaysBetween(warmedDate, qualifiedDate);

          // Determine Qualified Bucket
          const qualifiedBucket = qualifiedBuckets.find(
            bucket => daysToQualified >= bucket.min && daysToQualified < bucket.max
          )?.label || "Qualified in 30+ Days";

          // Increment or initialize count
          const linkKey = `${warmedBucket} → ${qualifiedBucket}`;
          conversionCounts[linkKey] = (conversionCounts[linkKey] || 0) + 1;
        });

        // Prepare Sankey data
        const nodes: SankeyNode[] = [
          ...warmedBuckets.map(bucket => ({ id: bucket.label })),
          ...qualifiedBuckets.map(bucket => ({ id: bucket.label }))
        ];

        const links: SankeyLink[] = Object.entries(conversionCounts).map(([key, value]) => {
          const [source, target] = key.split(" → ");
          return { source, target, value };
        });

        setSankeyData({ nodes, links });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) return <div>Loading Sankey chart...</div>;
  if (sankeyData.nodes.length === 0) return <div>No data available.</div>;

  return (
    <div className="border border-primary-2 p-4 rounded-md bg-primary-2 min-h-[600px]">
      <h2 className="text-primary-1 font-semibold">Lead Conversion Time Sankey</h2>
      <div style={{ height: "500px", width: "100%" }}>
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 40, right: 160, bottom: 40, left: 250 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeThickness={20}
          nodeInnerPadding={3}
          nodeSpacing={24}
          nodeBorderWidth={0}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={16}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
        />
      </div>
    </div>
  );
}