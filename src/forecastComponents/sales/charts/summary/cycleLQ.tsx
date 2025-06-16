import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Account {
  "Created Date"?: string | number | Date;
  "Closed Date"?: string | number | Date;
  "Stage"?: string;
}

export default function CycleLQ() {
  const [avgCycleTime, setAvgCycleTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateAvgCycleTime() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        
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

        // Define last quarter date range (Dec 2024 - Feb 2025)
        const startDate = dayjs("2024-01-01");
        const endDate = dayjs("2025-03-31");

        let totalCycleTime = 0;
        let dealCount = 0;

        (accounts as Account[]).forEach((account) => {
          const CreatedDateObj = processDate(account["Created Date"]);
          const closedDateObj = processDate(account["Closed Date"]);

          if (CreatedDateObj && closedDateObj) {
            // Check if closed date is within last quarter
            if (
              closedDateObj.isAfter(startDate) &&
              closedDateObj.isBefore(endDate.add(1, "day"))
            ) {
              const cycleTime = closedDateObj.diff(CreatedDateObj, 'day');
              totalCycleTime += cycleTime;
              dealCount++;
            }
          }
        });

        const average = dealCount > 0 ? Math.round(totalCycleTime / dealCount) : 0;
        setAvgCycleTime(average);
      } catch (error) {
        console.error("Error calculating average cycle time:", error);
        setAvgCycleTime(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateAvgCycleTime();
  }, []);

  if (isLoading) {
    return <div>Loading cycle time data...</div>;
  }

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-full">
      <h3 className="text-primary-2 font-semibold mb-2">{`Sales Cycle (Closed L90)`}</h3>
      <p className="text-primary-1 text-3xl font-bold">{avgCycleTime} days</p>
    </div>
  );
}