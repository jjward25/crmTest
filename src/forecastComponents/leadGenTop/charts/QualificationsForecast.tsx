"use client";
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function QualificationsForecast() {
  const [forecast, setForecast] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateForecast() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        const today = dayjs();

        const qualifiedCounts: { [key: string]: number } = {};

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

        (accounts as { "Qualified Date"?: string | number | Date }[]).forEach((contact) => {
          const qualifiedDateValue = contact["Qualified Date"];
          const qualifiedDateObj = processDate(qualifiedDateValue);
          if (qualifiedDateObj) {
            const qualifiedMonth = qualifiedDateObj.format("YYYY-MM");
            qualifiedCounts[qualifiedMonth] = (qualifiedCounts[qualifiedMonth] || 0) + 1;
          }
        });

        const last3MonthsData: number[] = [];
        const last12MonthsData: number[] = [];

        for (let i = 0; i < 12; i++) {
          const month = today.subtract(i, "month").format("YYYY-MM");
          const count = qualifiedCounts[month] || 0;
          if (i < 3) {
            last3MonthsData.push(count);
          }
          last12MonthsData.push(count);
          if (i >= 12) break;
        }

        const avgLast3Months =
          last3MonthsData.length > 0
            ? last3MonthsData.reduce((sum, count) => sum + count, 0) / last3MonthsData.length
            : 0;

        const avgLast12Months =
          last12MonthsData.length > 0
            ? last12MonthsData.reduce((sum, count) => sum + count, 0) / last12MonthsData.length
            : 0;

        const calculatedForecast = ((avgLast3Months + avgLast12Months) / 2)*3;
        setForecast(Math.round(calculatedForecast));
      } catch (error) {
        console.error("Error calculating forecast:", error);
        setForecast(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateForecast();
  }, []);

  if (isLoading) {
    return <div>Loading Forecast...</div>;
  }

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-full">
      <h3 className="text-primary-2 font-semibold mb-2">Project Qualifications Next Quarter</h3>
      <p className="text-primary-1 text-3xl font-bold">{forecast}</p>
    </div>
  );
}