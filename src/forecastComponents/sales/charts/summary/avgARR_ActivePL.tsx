import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function AverageArrOpenPipeline() {
  const [averageArr, setAverageArr] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateAverageArr() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");
        
        // Filter accounts without Close Date and calculate average ARR
        let arrSum = 0;
        let validDeals = 0;
        
        (accounts as { 
            "Closed Date"?: string | number | Date; 
            "ARR"?: number; 
            "Stage"?: string;
          }[]).forEach((account) => {
            const closeDateValue = account["Closed Date"];
            const arrValue = account["ARR"];
            
            // Only include accounts that don't have a close date (open pipeline)
            if (closeDateValue === undefined || closeDateValue === null || closeDateValue === "") {
              if (typeof arrValue === "number" && !isNaN(arrValue)) {
                arrSum += arrValue;
                validDeals++;
              }
            }
          });
          
        // Calculate average (prevent division by zero)
        const average = validDeals > 0 ? arrSum / validDeals : 0;
        setAverageArr(average);
      } catch (error) {
        console.error("Error calculating average ARR:", error);
        setAverageArr(0);
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
    <div className="border border-primary-2 p-4 rounded-md bg-primary-4 w-full">
      <h3 className="text-primary-2 font-semibold mb-2">Avg ARR (Open Pipeline)</h3>
      <p className="text-primary-1 text-3xl font-bold">{formattedAvgArr}</p>
    </div>
  );
}