"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Filters {
  accountName: string
  accountOwner: string
  csm: string
  stage: string
}

interface ToolbarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

export function Toolbar({ filters, onFilterChange }: ToolbarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className={cn("flex flex-col md:flex-row space-x-4 mb-6 w-full items-start")}>
      <div className="flex flex-col items-center bg-primary-1 rounded-lg text-center p-3 pt-1 min-w-36 w-fit border border-primary-3">
        <div className="">
          <Image aria-hidden src="/serviceIcon.png" alt="Service Icon" width={64} height={24} />
        </div>
        <h1 className="text-xs font-smibold">Account-Based CRM</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 w-full">
        <Input
          name="accountName"
          placeholder="Filter by Account Name"
          value={filters.accountName}
          onChange={handleInputChange}
          className={cn(
            "bg-primary-1 text-white border-primary-3 min-w-[120px] w-fit text-sm",
            "focus:border-primary-5 focus:ring-1 focus:ring-primary-5",
          )}
        />
        <Input
          name="accountOwner"
          placeholder="Filter by Account Owner"
          value={filters.accountOwner}
          onChange={handleInputChange}
          className={cn(
            "bg-primary-1 text-white border-primary-3 min-w-[125px] w-fit",
            "focus:border-primary-5 focus:ring-1 focus:ring-primary-5",
          )}
        />
        <Input
          name="csm"
          placeholder="Filter by CSM"
          value={filters.csm}
          onChange={handleInputChange}
          className={cn(
            "bg-primary-1 text-white border-primary-3 min-w-[125px] w-fit",
            "focus:border-primary-5 focus:ring-1 focus:ring-primary-5",
          )}
        />
        <Input
          name="stage"
          placeholder="Filter by Stage"
          value={filters.stage}
          onChange={handleInputChange}
          className={cn(
            "bg-primary-1 text-white border-primary-3 min-w-[125px] w-fit",
            "focus:border-primary-5 focus:ring-1 focus:ring-primary-5",
          )}
        />
        <Button
          variant="outline"
          className={cn(
            "bg-primary-1 text-white border-primary-3 min-w-[125px] w-fit",
            "hover:bg-primary-5 hover:border-primary-3",
          )}
        >
          <MoreHorizontal className={cn("h-4 w-4")} />
        </Button>
      </div>
    </div>
  )
}

