import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AccountDetails as AccountDetailsType, Deal, Contact } from "../../lib/account"

interface AccountDetailsProps {
  details: AccountDetailsType
  deals: Deal[]
  contacts: Contact[]
}

export function AccountDetails({ details }: AccountDetailsProps) {
  return (
    <Card className={cn("bg-primary-1 h-full")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-primary-2">Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-4")}>
          {/* Key Metrics Section */}
          <div className={cn("grid grid-cols-2 gap-4")}>
            <div className={cn(
              "p-3 rounded-lg",
              "bg-primary-4/10",
              "border border-primary-3/20"
            )}>
              <div className="text-xs text-primary-3 mb-1">Annual Revenue</div>
              <div className="text-lg font-semibold text-primary-2">
                ${details.annualRevenue.toLocaleString()}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-lg",
              "bg-primary-4/10",
              "border border-primary-3/20"
            )}>
              <div className="text-xs text-primary-3 mb-1">ARR</div>
              <div className="text-lg font-semibold text-primary-2">
                ${details.arr.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className={cn(
            "rounded-lg p-4",
            "bg-primary-4/5",
            "border border-primary-3/20"
          )}>
            <div className={cn("grid grid-cols-2 gap-y-3 text-sm")}>
              <div>
                <span className="text-primary-3">Employees</span>
                <div className="font-medium text-primary-2">{details.employees}</div>
              </div>
              
              <div>
                <span className="text-primary-3">Stage</span>
                <div className="font-medium text-primary-2">{details.stage}</div>
              </div>

              <div>
                <span className="text-primary-3">Last Contract</span>
                <div className="font-medium text-primary-2">{details.lastContractStart}</div>
              </div>

              <div>
                <span className="text-primary-3">Next Close</span>
                <div className="font-medium text-primary-2">{details.nextCloseDate}</div>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className={cn(
            "rounded-lg p-4",
            "bg-primary-4/5",
            "border border-primary-3/20"
          )}>
            <div className="text-xs text-primary-3 mb-2">Use Cases</div>
            <div className="flex flex-wrap gap-2">
              {details.useCases.map((useCase, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    "bg-primary-4/20",
                    "border border-primary-3/30",
                    "text-primary-2"
                  )}
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}