"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ActivityAndEngagement } from "./ActivityEngagement"
import { AccountDetails } from "./AccountDetails"
import { RelatedAccounts } from "./RelatedAccounts"
import { ContactModule } from "./ContactModule"
import { Deals } from "./Deals"
import { Playbook } from "./Playbook"
import type { Account, RelatedAccount } from "../../lib/account"
import { cn } from "@/lib/utils"

interface AccountCardProps {
  account: Account
  relatedAccounts: RelatedAccount[]
}

export function AccountCard({ account, relatedAccounts }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [assignedCampaigns, setAssignedCampaigns] = useState<string[]>(account.assignedCampaigns || [])

  const handleAssignCampaigns = (campaigns: string[]) => {
    setAssignedCampaigns(campaigns)
    // Here you would typically update the backend with the new assigned campaigns
    console.log(`Assigned campaigns for ${account.name}:`, campaigns)
  }

  return (
    <div
      className={cn(
        "bg-primary-5 rounded-lg overflow-hidden shadow-lg",
        "transition-all duration-300 ease-in-out hover:shadow-2xl",
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center cursor-pointer p-4",
          isExpanded && "border-b border-primary-3",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className={cn("text-xl font-semibold text-primary-2")}>{account.name}</h2>
        <div className={cn("flex items-center gap-6")}>
        <div className={cn(
          "flex items-center gap-2",
          "px-3 py-1.5 rounded-md",
          "bg-primary-4/10 border border-primary-3/20"
        )}>
          <span className="text-sm text-primary-3">Owner</span>
          <span className="font-medium text-primary-1">{account.owner}</span>
        </div>

        <div className={cn(
          "flex items-center gap-2",
          "px-3 py-1.5 rounded-md",
          "bg-primary-4/10 border border-primary-3/20"
        )}>
          <span className="text-sm text-primary-3">CSM</span>
          <span className="font-medium text-primary-1">{account.csm}</span>
        </div>

        <div className={cn(
          "flex items-center gap-2",
          "px-3 py-1.5 rounded-md",
          "bg-primary-4/10 border border-primary-3/20"
        )}>
          <span className="text-sm text-primary-3">ARR</span>
          <span className="font-medium text-primary-1">${account.arr.toLocaleString()}</span>
        </div>

        <div className={cn(
          "flex items-center gap-2",
          "px-3 py-1.5 rounded-md",
          "bg-primary-4/10 border border-primary-3/20"
        )}>
          <span className="text-sm text-primary-3">Stage</span>
          <span className="font-medium text-primary-1">{account.details.stage}</span>
        </div>
      </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isExpanded && (
        <div className={cn("p-4 bg-primary-5")}>
          <div className={cn(
            "grid grid-cols-12 gap-4",
            "grid-rows-[400px_300px_800px]" // Three explicit row heights
          )}>
            {/* Left Column - Full Height (800px total) */}
            <div className={cn(
              "col-span-4 row-span-3", // Spans all three rows
              "h-full overflow-auto"
            )}>
              <ActivityAndEngagement events={account.events} />
            </div>

            {/* Middle Column - First Row (200px) */}
            <div className={cn(
              "col-span-4",
              "h-full overflow-auto border-primary-3 border rounded-lg"
            )}>
              <AccountDetails details={account.details} deals={account.deals} contacts={account.contacts} />
              
            </div>

            {/* Right Column - First Row (200px) */}
            <div className={cn(
              "col-span-4",
              "h-full overflow-auto border-primary-3 border rounded-lg"
            )}>
              <Deals details={account.details} deals={account.deals} contacts={account.contacts} />
            </div>

            {/* Middle Column - Second Row (200px) */}
            <div className={cn(
              "col-span-4",
              "h-full overflow-auto border-primary-3 border rounded-lg"
            )}>
              <Playbook
                availableCampaigns={["Campaign A", "Campaign B", "Campaign C", "Campaign D"]}
                assignedCampaigns={assignedCampaigns}
                onAssignCampaigns={handleAssignCampaigns}
              />
            </div>

            {/* Right Column - Second Row (200px) */}
            <div className={cn(
              "col-span-4",
              "h-full overflow-auto border-primary-3 border rounded-lg"
            )}>
              <RelatedAccounts accounts={relatedAccounts} />
            </div>

            {/* Contact Module - Bottom Row Across Columns 2-3 (400px) */}
            <div className={cn(
              "col-span-8",
              "h-full overflow-auto"
            )}>
              <ContactModule details={account.details} deals={account.deals} contacts={account.contacts} />
            </div>
          </div>
        </div>
      )}
          </div>
        )
      }

