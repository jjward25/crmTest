"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);


export default function ForecastARR() {
  const [projectedARR, setProjectedARR] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateProjectedARR() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        const today = dayjs();

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

        const avgARRQualifiedLast3Months =
          qualifiedARRsLast3Months.length > 0
            ? qualifiedARRsLast3Months.reduce((sum, arr) => sum + arr, 0) / qualifiedARRsLast3Months.length
            : 0;

        const last12Months = [...Array(12)].map((_, i) => today.subtract(i, "month").format("YYYY-MM"));
        let totalQualifiedLast12Months = 0;
        last12Months.forEach(month => {
          totalQualifiedLast12Months += qualifiedCountsLast12Months[month] || 0;
        });
        const avgQualifiedLast12Months = last12Months.length > 0 ? totalQualifiedLast12Months / last12Months.length : 0;

        const last3Months = [...Array(3)].map((_, i) => today.subtract(i, "month").format("YYYY-MM"));
        let totalQualifiedLast3Months = 0;
        last3Months.forEach(month => {
          totalQualifiedLast3Months += qualifiedCountsLast12Months[month] || 0;
        });
        const avgQualifiedLast3Months = last3Months.length > 0 ? totalQualifiedLast3Months / last3Months.length : 0;

        const projectedQualificationsNextQuarter = Math.round(((avgQualifiedLast3Months + avgQualifiedLast12Months) / 2)*3);

        const calculatedProjectedARR = projectedQualificationsNextQuarter * avgARRQualifiedLast3Months;
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
      <h3 className="text-primary-2 font-semibold mb-2">Projected Qualified ARR</h3>
      <p className="text-primary-1 text-3xl font-bold">${projectedARR.toLocaleString()}</p>
    </div>
  );
}