"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import { ResponsiveSankey } from "@nivo/sankey";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Contact {
  [key: string]: string | number | Date | undefined;
  "Created Date"?: string | number | Date;
  "Warmed Date"?: string | number | Date;
  "Disqualified Date"?: string | number | Date;
  "Qualified Date"?: string | number | Date;
}

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
        const { contacts } = await fetchExcel("/data/crm_data.xlsx");

        function processDate(dateValue: string | number | Date | undefined): dayjs.Dayjs | null {
          if (dateValue === undefined) return null;

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
          return dateObj && dateObj.isValid() ? dateObj.startOf('month') : null; // Group by start of the month
        }

        const conversionCounts: { [key: string]: number } = {};

        (contacts as Contact[]).forEach((contact) => {
          const createdDate = processDate(contact["Created Date"]);
          const warmedDate = processDate(contact["Warmed Date"]);
          const disqualifiedDate = processDate(contact["Disqualified Date"]);
          const qualifiedDate = processDate(contact["Qualified Date"]);

          if (!createdDate) return;

          const createdMonth = createdDate.format("YYYY-MM");

          // Stage 1: Created Month to Warmed/Disqualified/In-Progress
          if (warmedDate) {
            const linkKey = `${createdMonth} → Warmed`;
            conversionCounts[linkKey] = (conversionCounts[linkKey] || 0) + 1;
            // Stage 2: Warmed to Qualified/Disqualified/Open
            if (qualifiedDate) {
              const nextLinkKey = `Warmed → Qualified`;
              conversionCounts[nextLinkKey] = (conversionCounts[nextLinkKey] || 0) + 1;
            } else if (disqualifiedDate) {
              const nextLinkKey = `Warmed → Disqualified`;
              conversionCounts[nextLinkKey] = (conversionCounts[nextLinkKey] || 0) + 1;
            } else {
              const nextLinkKey = `Warmed → Open`;
              conversionCounts[nextLinkKey] = (conversionCounts[nextLinkKey] || 0) + 1;
            }
          } else if (disqualifiedDate) {
            const linkKey = `${createdMonth} → Disqualified`;
            conversionCounts[linkKey] = (conversionCounts[linkKey] || 0) + 1;
          } else {
            const linkKey = `${createdMonth} → In-Progress`;
            conversionCounts[linkKey] = (conversionCounts[linkKey] || 0) + 1;
          }
        });

        const allNodes = new Set<string>();
        const links: SankeyLink[] = Object.entries(conversionCounts).map(([key, value]) => {
          const [source, target] = key.split(" → ");
          allNodes.add(source);
          allNodes.add(target);
          return { source, target, value };
        });

        const nodes: SankeyNode[] = Array.from(allNodes).map(id => ({ id }));

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
      <h2 className="text-primary-1 font-semibold">Lead Conversion Flow</h2>
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