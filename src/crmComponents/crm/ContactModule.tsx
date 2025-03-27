import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { OrgChart } from "./OrgChart"
import type { AccountDetails as AccountDetailsType, Deal, Contact } from "../../lib/account"

interface AccountDetailsProps {
  details: AccountDetailsType
  deals: Deal[]
  contacts: Contact[]
}

export function ContactModule({  contacts }: AccountDetailsProps) {
  return (


      <Card className={cn("bg-primary-5 border border-primary-3")}>
        <CardHeader>
          <CardTitle>Org Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgChart contacts={contacts} />
          <table className={cn("w-full mt-4")}>
            <thead>
              <tr className={cn("text-primary-3 text-left")}>
                <th>Name</th>
                <th>Location</th>
                <th>Email</th>
                <th>Buyer Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className={cn("border-t border-primary-3")}>
                  <td className={cn("py-2 text-primary-2")}>{contact.name}</td>
                  <td
                    className={cn("py-2 text-primary-2")}
                  >{`${contact.city}, ${contact.state}, ${contact.country}`}</td>
                  <td className={cn("py-2 text-primary-2")}>{contact.email}</td>
                  <td className={cn("py-2 text-primary-2")}>{contact.buyerRoles.join(", ")}</td>
                  <td className={cn("py-2")}>
                    <button className={cn("mr-2 text-primary-5")}>Edit</button>
                    <button className={cn("text-primary-5")}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={cn("mt-4 bg-primary-2 px-2 rounded-lg text-primary-4 text-sm py-2 font-semibold")}>Add New Contact</button>
        </CardContent>
      </Card>
  )
}

