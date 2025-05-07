"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Contact {
  [key: string]: string | number | Date | undefined;
  "Qualified Date"?: string | number | Date;
  "Closed Date"?: string | number | Date;
  "Stage"?: string;
  "ARR"?: number;
}

export default function ForecastClosedARR() {
  const [projectedARR, setProjectedARR] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateProjectedARR() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        const today = dayjs('2025-03-31');
        
        // Arrays and objects needed for calculations
        const qualifiedCountsLast12Months: { [key: string]: number } = {};
        const arrData: { [key: string]: number[] } = {}; // Store ARR values by month
        const last18Months = [...Array(18)].map((_, i) => today.subtract(i, "month").format("YYYY-MM"));
        const last3Months = [...Array(3)].map((_, i) => today.subtract(i, "month").format("YYYY-MM"));
        
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
          return dateObj && dateObj.isValid() ? dateObj : null;
        }

        // Process all accounts
        (accounts as Contact[]).forEach((contact) => {
          // For qualified count calculation
          const qualifiedDateValue = contact["Qualified Date"];
          const qualifiedDateObj = processDate(qualifiedDateValue);
          
          if (qualifiedDateObj) {
            const qualifiedMonth = qualifiedDateObj.format("YYYY-MM");
            const diffInMonths = today.diff(qualifiedDateObj, 'month');
            
            if (diffInMonths < 12) {
              qualifiedCountsLast12Months[qualifiedMonth] = (qualifiedCountsLast12Months[qualifiedMonth] || 0) + 1;
            }
          }
          
          // For Won Accounts ARR calculation - EXACTLY as in QualifiedAccountsTrendTable
          const stage = contact["Stage"] || '';
          const closedDateValue = contact["Closed Date"];
          const closedDateObj = processDate(closedDateValue);
          const arr = contact["ARR"] || 0;
          
          const wonStages = ['4 - Customer'];
          if (
            closedDateObj &&
            last18Months.includes(closedDateObj.format("YYYY-MM")) &&
            wonStages.some(s => stage.trim().toLowerCase() === s.trim().toLowerCase())
          ) {
            const closedRawMonth = closedDateObj.format("YYYY-MM");
            
            // Store ARR values by month - identical to the original code
            if (!arrData[closedRawMonth]) {
              arrData[closedRawMonth] = [];
            }
            arrData[closedRawMonth].push(arr);
          }
        });

        // Calculate average ARR for last 3 months of closed won accounts
        // This exactly mirrors how it's calculated in QualifiedAccountsTrendTable
        let totalARR = 0;
        let totalCount = 0;
        
        // Only consider the last 3 months
        last3Months.forEach(month => {
          const monthARRs = arrData[month] || [];
          if (monthARRs.length > 0) {
            totalARR += monthARRs.reduce((sum, val) => sum + val, 0);
            totalCount += monthARRs.length;
          }
        });
        
        const avgARRClosedWonLast3Months = totalCount > 0 ? totalARR / totalCount : 0;

        // Calculate qualified account projections (this part is unchanged)
        const last12Months = [...Array(12)].map((_, i) => today.subtract(i, "month").format("YYYY-MM"));
        let totalQualifiedLast12Months = 0;
        last12Months.forEach(month => {
          totalQualifiedLast12Months += qualifiedCountsLast12Months[month] || 0;
        });
        const avgQualifiedLast12Months = last12Months.length > 0 ? totalQualifiedLast12Months / last12Months.length : 0;

        let totalQualifiedLast3Months = 0;
        last3Months.forEach(month => {
          totalQualifiedLast3Months += qualifiedCountsLast12Months[month] || 0;
        });
        const avgQualifiedLast3Months = last3Months.length > 0 ? totalQualifiedLast3Months / last3Months.length : 0;

        const projectedQualificationsNextQuarter = Math.round(((avgQualifiedLast3Months + avgQualifiedLast12Months) / 2)*3);

        // Use the average ARR from closed won accounts
        const calculatedProjectedARR = (projectedQualificationsNextQuarter+10) * avgARRClosedWonLast3Months;
        setProjectedARR(Math.round(calculatedProjectedARR));
      } catch (error) {
        console.error("Error calculating Projected ARR:", error);
        setProjectedARR(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateProjectedARR();
  }, []);

  if (isLoading) {
    return <div>Loading Projected ARR...</div>;
  }

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-full">
      <h3 className="text-primary-2 font-semibold mb-2">Overall Expected to Close</h3>
      <p className="text-primary-1 text-3xl font-bold">${Math.round(projectedARR *.4).toLocaleString()}</p>
    </div>
  );
}