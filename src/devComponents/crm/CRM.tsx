"use client"

import { useState } from "react"
import { Toolbar } from "./Toolbar"
import { AccountList } from "./AccountList"
import { cn } from "@/lib/utils"
import { dummyAccounts, dummyRelatedAccounts } from "../../data/dummyData"
import type { Account } from "../../lib/account"
import { CustomTooltip } from "../tooltip"

interface Filters {
  accountName: string
  accountOwner: string
  csm: string
  stage: string
}

export default function CRM() {
  const [accounts, setAccounts] = useState<Account[]>(dummyAccounts)
  const [filters, setFilters] = useState<Filters>({
    accountName: "",
    accountOwner: "",
    csm: "",
    stage: "",
  })

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    const filteredAccounts = dummyAccounts.filter(
      (account) =>
        account.name.toLowerCase().includes(newFilters.accountName.toLowerCase()) &&
        account.owner.toLowerCase().includes(newFilters.accountOwner.toLowerCase()) &&
        account.csm.toLowerCase().includes(newFilters.csm.toLowerCase()) &&
        account.details.stage.toLowerCase().includes(newFilters.stage.toLowerCase()),
    )
    setAccounts(filteredAccounts)
  }

  return (
    <div className={cn("px-4 py-4 bg-primary-4 text-white w-full relative")}>
      <div className="absolute top-2 left-2 z-10">
        <CustomTooltip content="This section is for individual account management, with a focus on seeing where they're engaging and what's worked for similar accounts in the past."/>
      </div>
      <Toolbar filters={filters} onFilterChange={handleFilterChange} />
      <AccountList accounts={accounts} relatedAccounts={dummyRelatedAccounts} />
    </div>
  )
}

