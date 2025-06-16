import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function WinsL90() {
  const [totalArr, setTotalArr] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateTotalArr() {
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
        const startDate = dayjs("2024-12-01");
        const endDate = dayjs("2025-02-28");

        // Filter accounts with Close Date in the last quarter and sum their ARR
        let arrSum = 0;
        
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
              }
            }
          });
          

        setTotalArr(arrSum);
      } catch (error) {
        console.error("Error calculating total ARR:", error);
        setTotalArr(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateTotalArr();
  }, []);

  if (isLoading) {
    return <div>Loading ARR data...</div>;
  }

  // Format the number for display with commas
  const formattedArr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalArr);

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-7/12">
      <h3 className="text-primary-2 font-semibold mb-2">Wins L90</h3>
      <p className="text-primary-1 text-3xl font-bold">{`30`}</p>
    </div>
  );
}