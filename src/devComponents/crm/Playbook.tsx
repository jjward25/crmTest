import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface PlaybookProps {
  availableCampaigns: string[]
  assignedCampaigns: string[]
  onAssignCampaigns: (campaigns: string[]) => void
}

export function Playbook({ availableCampaigns, assignedCampaigns, onAssignCampaigns }: PlaybookProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(assignedCampaigns)

  const handleCampaignToggle = (campaign: string) => {
    setSelectedCampaigns((prev) => (prev.includes(campaign) ? prev.filter((c) => c !== campaign) : [...prev, campaign]))
  }

  const handleAssignCampaigns = () => {
    onAssignCampaigns(selectedCampaigns)
  }

  return (
    <Card className={cn("bg-primary-1 border-primary-3")}>
      <CardHeader>
        <CardTitle>Current Playbook</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-2 mt-3")}>
          {availableCampaigns.map((campaign) => (
            <div key={campaign} className={cn("flex items-center")}>
              <Checkbox
                id={campaign}
                checked={selectedCampaigns.includes(campaign)}
                onCheckedChange={() => handleCampaignToggle(campaign)}
              />
              <label htmlFor={campaign} className={cn("ml-2 text-primary-2")}>
                {campaign}
              </label>
            </div>
          ))}
        </div>
        <button onClick={handleAssignCampaigns} className={cn("mt-4 bg-primary-2 px-2 rounded-lg text-primary-4 text-sm py-2 font-semibold")}>
          Assign Campaigns
        </button>
      </CardContent>
    </Card>
  )
}

