import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ActivityAndEngagement } from "./ActivityEngagement"
import { AccountDetails } from "./AccountDetails"
import type { RelatedAccount } from "../../lib/account"

interface RelatedAccountsProps {
  accounts: RelatedAccount[]
}

export function RelatedAccounts({ accounts }: RelatedAccountsProps) {
  const [selectedAccount, setSelectedAccount] = useState<RelatedAccount | null>(null)

  return (
    <Card className={cn("bg-primary-5 h-full")}>
      <CardHeader>
        <CardTitle>Related Accounts <span className={cn("w-full text-primary-2 font-light text-xs ml-2")}>Click an Account to View History</span></CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid grid-cols-2 gap-3 mt-3")}>
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "p-3 rounded-lg",
                "bg-gradient-to-r from-primary-3/50 to-primary-4",
                "border border-primary-",
                "shadow-sm hover:shadow-md transition-all",
                "cursor-pointer"
              )}
            >
              <div className={cn("font-semibold text-primary-1 mb-1")}>{account.name}</div>
              <div className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  "bg-primary-3/20 border border-primary-2/30",
                  account.similarityScore >= 75 ? "text-primary-4 font-semibold bg-primary-2" :
                  account.similarityScore >= 50 ? "text-primary-3 bg-primary-2" :
                  "text-gray-600 bg-gray-100"
                )}>
                  {account.similarityScore}% Match
                </div>
                <div className={cn("text-sm text-primary-1 font-semibold mt-2")}>
                  Match Reasons:
                  <div className={cn("flex flex-wrap gap-2 mt-1")}>
                    {account.similarityReason.map((reason, index) => (
                      <span
                        key={index}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          "bg-primary-4/10 border border-primary-1",
                          "text-primary-2 font-medium"
                        )}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
              </div>              
              <div className={cn("text-sm text-primary-1 mt-1 font-semibold")}>Industry: <span className={cn("text-primary-2 font-light")}>{account.industry}</span></div>
              <div className={cn("text-sm text-primary-1 mt-1 font-semibold")}>
                Revenue: <span className={cn("font-semibold text-primary-2")}>${account.revenue.toLocaleString()}</span>
              </div>
              
            </div>
          ))}
        </div>

        {selectedAccount && (
          <div className={cn("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50")}>
            <div className={cn("bg-primary-1 p-4 rounded-lg w-3/4 h-3/4 overflow-auto relative")}>
              <h2 className={cn("text-2xl font-bold text-primary-5 mb-4")}>{selectedAccount.name}</h2>
              <div className={cn("grid grid-cols-2 gap-4")}>
                <ActivityAndEngagement events={selectedAccount.events} />
                <AccountDetails
                  details={selectedAccount.details}
                  deals={selectedAccount.deals}
                  contacts={selectedAccount.contacts}
                />
              </div>
              <button
                className={cn(
                  "mt-4 px-4 py-2 rounded",
                  "bg-primary-5 text-white",
                  "hover:bg-primary-4 transition-colors absolute top-4 right-4"
                )}
                onClick={() => setSelectedAccount(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}