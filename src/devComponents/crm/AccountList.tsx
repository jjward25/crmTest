import type { Account, RelatedAccount } from "../../lib/account"
import { AccountCard } from "./AccountCard"
import { cn } from "@/lib/utils"

interface AccountListProps {
  accounts: Account[]
  relatedAccounts: RelatedAccount[]
}

export function AccountList({ accounts, relatedAccounts }: AccountListProps) {
  return (
    <div className={cn("space-y-4")}>
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} relatedAccounts={relatedAccounts} />
      ))}
    </div>
  )
}

