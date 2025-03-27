"use client"
import { useEffect, useState } from "react";
import { fetchExcel } from "@/lib/excelLoader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Contact {
  [key: string]: string | number | Date | undefined;
  "Qualified Date"?: string | number | Date;
  "Stage"?: string;
  "ARR"?: number;
  "Closed Date"?: string | number | Date;
}

interface MonthlyData {
  month: string;
  count: number;
  monthOverMonthChange: number;
  trailing3MonthAvg: number;
  trailing12MonthAvg: number;
  wonAccounts: number;
  avgARR: number;
}

export default function QualifiedAccountsTrendTable() {
  const [tableData, setTableData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { accounts } = await fetchExcel("/data/crm_data.xlsx");

        const groupedData: { [key: string]: number } = {};
        const wonAccountsData: { [key: string]: number } = {};
        const arrData: { [key: string]: number[] } = {};
        const today = dayjs();
        const last18Months = [...Array(13)].map((_, i) =>
          today.subtract(i, "month").format("YYYY-MM")
        );

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

        (accounts as Contact[]).forEach((contact) => {
          const qualifiedDateValue = contact["Qualified Date"];
          const qualifiedDateObj = processDate(qualifiedDateValue);
          if (!qualifiedDateObj) {
            return;
          }

          const qualifiedRawMonth = qualifiedDateObj.format("YYYY-MM");
          if (!last18Months.includes(qualifiedRawMonth)) {
            return;
          }

          // Qualified Accounts (based on Qualified Date)
          groupedData[qualifiedRawMonth] = (groupedData[qualifiedRawMonth] || 0) + 1;

          // Won Accounts (based on Closed Date and Stage)
          const stage = contact["Stage"] || '';
          const closedDateValue = contact["Closed Date"];
          const closedDateObj = processDate(closedDateValue);
          const arr = contact["ARR"] || 0;

          const wonStages = ['4 - Customer', '5b - Churned'];
          if (
            closedDateObj &&
            last18Months.includes(closedDateObj.format("YYYY-MM")) &&
            wonStages.some(s => stage.trim().toLowerCase() === s.trim().toLowerCase()) &&
            closedDateObj.format("YYYY-MM") === qualifiedRawMonth // Ensure Closed Date is in the same calendar month as Qualified Date
          ) {
            const closedRawMonth = closedDateObj.format("YYYY-MM");
            wonAccountsData[closedRawMonth] = (wonAccountsData[closedRawMonth] || 0) + 1;

            // ARR for Won Accounts
            if (!arrData[closedRawMonth]) {
              arrData[closedRawMonth] = [];
            }
            arrData[closedRawMonth].push(arr);
          }
        });

        const sortedMonths = last18Months.sort((a, b) => b.localeCompare(a)); // Sort in descending order
        const processedData: MonthlyData[] = sortedMonths.map((month, index) => {
          const monthName = dayjs(month, "YYYY-MM").format("MMM-YYYY");
          const count = groupedData[month] || 0;

          // Month-over-month change for Qualified Accounts
          const previousMonth = sortedMonths[index + 1];  // Get the *previous* month
          const previousMonthCount = previousMonth ? (groupedData[previousMonth] || 0) : 0;
          const monthOverMonthChange = previousMonthCount > 0
            ? ((count - previousMonthCount) / previousMonthCount * 100)
            : 0;

          // Trailing 3-month average for Qualified Accounts
          const trailing3Months = sortedMonths.slice(index, index + 3);
          const trailing3MonthSum = trailing3Months.reduce((sum, m) => sum + (groupedData[m] || 0), 0);
          const trailing3MonthAvg = index < sortedMonths.length - 2 ? trailing3MonthSum / 3 : 0;

          // Trailing 12-month average for Qualified Accounts
          const trailing12Months = sortedMonths.slice(index, index + 12);
          const trailing12MonthSum = trailing12Months.reduce((sum, m) => sum + (groupedData[m] || 0), 0);
          const trailing12MonthAvg = index < sortedMonths.length - 11 ? trailing12MonthSum / 12 : 0;

          // Won Accounts
          const wonAccounts = wonAccountsData[month] || 0;

          // Average ARR of Won Accounts
          const monthARRs = arrData[month] || [];
          const avgARR = monthARRs.length > 0
            ? monthARRs.reduce((sum, val) => sum + val, 0) / monthARRs.length
            : 0;

          return {
            month: monthName,
            count,
            monthOverMonthChange: Number(monthOverMonthChange.toFixed(1)),
            trailing3MonthAvg: Number(trailing3MonthAvg.toFixed(0)),
            trailing12MonthAvg: Number(trailing12MonthAvg.toFixed(0)),
            wonAccounts,
            avgARR: Number(avgARR.toFixed(0))
          };
        });

        setTableData(processedData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) return <div>Loading table data...</div>;
  if (tableData.length === 0) return <div>No data available.</div>;

  return (
    <div>
      <div className="border border-primary-3 p-4 rounded-md bg-primary-5 min-h-[400px] w-full">
        <h2 className="text-primary-3 font-semibold mb-4">Net Qualified Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-4 text-primary-5 border border-primary-3">
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-left">Month</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">Qualified</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">Closed Won</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">MoM Change</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">3-Mo Avg</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">12-Mo Avg</th>
                <th className="p-2 py-1 text-sm border-b border-primary-3 text-right">Avg ARR</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={row.month} className={`${index % 2 === 0 ? 'bg-primary-5' : 'bg-primary-5' } text-primary-5`}>
                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3">{row.month}</td>
                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right">{row.count}</td>
                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right">{row.wonAccounts}</td>
                  <td className={`p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right ${
                    row.monthOverMonthChange > 0
                      ? 'text-primary-4'
                      : row.monthOverMonthChange < 0
                        ? 'text-red-600'
                        : ''
                  }`}>
                    {row.monthOverMonthChange > 0 ? '+' : ''}{row.monthOverMonthChange}%
                  </td>
                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right">{row.trailing3MonthAvg}</td>
                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right">{row.trailing12MonthAvg}</td>

                  <td className="p-2 py-1 text-xs text-primary-3 border-b border-primary-3 text-right">${row.avgARR.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}