import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AccountDetails as AccountDetailsType, Deal, Contact } from "../../lib/account"

interface AccountDetailsProps {
  details: AccountDetailsType
  deals: Deal[]
  contacts: Contact[]
}

export function Deals({ deals }: AccountDetailsProps) {
  return (
    <Card className={cn("bg-primary-1 h-full")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-primary-2">Deals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto max-h-[calc(100%-60px)]">
        {deals.map((deal, index) => (
          <div 
            key={index} 
            className={cn(
              "rounded-lg border border-primary-3",
              "bg-gradient-to-r from-primary-4/90 to-primary-4",
              "shadow-sm hover:shadow-md transition-shadow",
              "p-4"
            )}
          >
            {/* Deal Name and ARR */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-primary-1">{deal.name}</h3>
              <span className="text-sm font-medium bg-primary-3/90 text-white rounded-full px-2 py-1">
                ${deal.arr.toLocaleString()}
              </span>
            </div>

            {/* Deal Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              

              <div className="flex items-center gap-2">
                <span className="text-primary-2/60">Close</span>
                <span className="font-medium text-primary-2">{deal.closeDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-primary-2/60">Contact</span>
                <span className="font-medium text-primary-2">{deal.primaryContact}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary-2/60">Start</span>
                <span className="font-medium text-primary-2">{deal.contractStart}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary-2/60">Team</span>
                <span className="font-medium text-primary-2">{deal.teamName}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary-2/60">End</span>
                <span className="font-medium text-primary-2">{deal.contractEnd}</span>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mt-3 flex flex-wrap gap-2">
              {deal.useCases.map((useCase, i) => (
                <span 
                  key={i}
                  className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    "bg-primary-3/20 text-primary-2",
                    "border border-primary-3/30"
                  )}
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}