import React from "react"
import type { Contact } from "../../lib/account"
import { cn } from "@/lib/utils"

interface OrgChartProps {
  contacts: Contact[]
}

export function OrgChart({ contacts }: OrgChartProps) {
  const buildHierarchy = (contacts: Contact[]): Contact[] => {
    const contactMap = new Map(contacts.map((contact) => [contact.id, { ...contact, children: [] as Contact[] }]))
    const roots: Contact[] = []

    contactMap.forEach((contact) => {
      if (contact.supervisor && contactMap.has(contact.supervisor)) {
        const supervisor = contactMap.get(contact.supervisor)
        if (supervisor) {
          supervisor.children = supervisor.children || []
          supervisor.children.push(contact)
        }
      } else {
        roots.push(contact)
      }
    })

    return roots
  }

  const renderContact = (contact: Contact) => (
    <div key={contact.id} className={cn("flex flex-col items-center")}>
      <div className={cn("bg-primary-2 p-2 rounded-lg text-center mb-2")}>
        <div className={cn("font-semibold text-primary-5")}>{contact.name}</div>
        <div className={cn("text-sm")}>{contact.buyerRoles.join(", ")}</div>
      </div>
      {contact.children && contact.children.length > 0 && (
        <div className={cn("flex flex-wrap justify-center gap-4 mt-2 pt-2 border-t border-primary-3")}>
          {contact.children.map(renderContact)}
        </div>
      )}
    </div>
  )

  const hierarchy = buildHierarchy(contacts)

  return (
    <div className={cn("overflow-auto")}>
      <div className={cn("flex flex-wrap justify-center gap-4 bg-gradient-to-r from-primary-3/50 to-primary-4 border border-primary-2 mt-2 p-2 rounded-md")}>{hierarchy.map(renderContact)}</div>
    </div>
  )
} 

