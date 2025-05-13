import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function AverageArrLast90Days() {
  const [averageArr, setAverageArr] = useState<number>(0);
  const [dealCount, setDealCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateAverageArr() {
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

        // Define last 30 days date range from March 31, 2025
        const endDate = dayjs("2025-03-31");
        const startDate = endDate.subtract(90, "day");

        // Filter accounts with Close Date in the last 30 days and calculate average ARR
        let arrSum = 0;
        let validDeals = 0;
        
        (accounts as { 
            "Closed Date"?: string | number | Date; 
            "ARR"?: number; 
            "Stage"?: string;
          }[]).forEach((account) => {
            const closeDateValue = account["Closed Date"];
            const closeDateObj = processDate(closeDateValue);
          
            // Only include accounts where Stage is "4 - Customer"
            const isCustomerStage = account["Stage"] === "4 - Customer";
          
            if (
              closeDateObj &&
              closeDateObj.isAfter(startDate) &&
              closeDateObj.isBefore(endDate.add(1, "day")) &&
              isCustomerStage
            ) {
              const arrValue = account["ARR"];
              if (typeof arrValue === "number" && !isNaN(arrValue)) {
                arrSum += arrValue;
                validDeals++;
              }
            }
          });
          
        // Calculate average (prevent division by zero)
        const average = validDeals > 0 ? arrSum / validDeals : 0;
        setAverageArr(average);
        setDealCount(validDeals);
      } catch (error) {
        console.error("Error calculating average ARR:", error);
        setAverageArr(0);
        setDealCount(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateAverageArr();
  }, []);

  if (isLoading) {
    return <div>Loading ARR data...</div>;
  }

  // Format the number for display with commas
  const formattedAvgArr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(averageArr);

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-1/3">
      <h3 className="text-primary-2 font-semibold mb-2">Last 90 Days</h3>
      <p className="text-primary-1 text-3xl font-bold">{formattedAvgArr}</p>
    </div>
  );
}