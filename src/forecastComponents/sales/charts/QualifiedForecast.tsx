"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);


export default function QualifiedForecast() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateProjectedARR() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        const today = dayjs('2025-03-31');

        const qualifiedARRsLast3Months: number[] = [];
        const qualifiedCountsLast12Months: { [key: string]: number } = {};

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

        for (let i = 0; i < accounts.length; i++) {
          const contact = accounts[i] as { "Qualified Date"?: string | number | Date; "ARR"?: number };
          const qualifiedDateValue = contact["Qualified Date"];
          const qualifiedDateObj = processDate(qualifiedDateValue);
          const arr = contact["ARR"] || 0;

          if (qualifiedDateObj) {
            const qualifiedMonth = qualifiedDateObj.format("YYYY-MM");
            const diffInMonths = today.diff(qualifiedDateObj, 'month');

            if (diffInMonths < 3) {
              qualifiedARRsLast3Months.push(arr);
            }
            if (diffInMonths < 12) {
              qualifiedCountsLast12Months[qualifiedMonth] = (qualifiedCountsLast12Months[qualifiedMonth] || 0) + 1;
            }
          }
        }

      } catch (error) {
        console.error("Error calculating Projected ARR:", error);
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
    <div className="border border-primary-3 p-4 pb-0 rounded-md bg-primary-4 w-full">
      <h3 className="text-primary-5 font-semibold mb-2">Qualifications Forecast (Next 90)</h3>
      <p className="text-primary-5 text-3xl font-bold">${(237931+235818).toLocaleString()}<span className="text-sm align-top text-primary-4">{`(+13%/$54k)`}</span></p>
      
    </div>
  );
}