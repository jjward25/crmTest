export interface Event {
  type: "Meeting" | "Email" | "Ad Click" | "Blog View" | "Event Attended" | "Site Visit"
  date: string
  description: string
  campaign?: {
    name: string
    focus: string
  }
  pagesViewed?: string[]
}

export interface AccountDetails {
  employees: number
  annualRevenue: number
  arr: number
  lastContractStart: string
  nextCloseDate: string
  stage: "Prospect" | "Outreach" | "Qualified" | "Negotiation" | "Customer" | "Closed Lost"
  useCases: ("UseCase1" | "UseCase2" | "UseCase3" | "UseCase4")[]
}

export interface Deal {
  name: string
  teamName: string
  primaryContact: string
  useCases: ("UseCase1" | "UseCase2" | "UseCase3" | "UseCase4")[]
  arr: number
  closeDate: string
  contractStart: string
  contractEnd: string
}

export interface Contact {
  id: string
  name: string
  city: string
  state: string
  country: string
  email: string
  buyerRoles: ("Buyer" | "Champion" | "User" | "Executive" | "Referrer")[]
  supervisor?: string
  reports: string[]
  children?: Contact[]

}

export interface Account {
  id: string
  name: string
  owner: string
  csm: string
  arr: number
  events: Event[]
  details: AccountDetails
  deals: Deal[]
  contacts: Contact[]
  assignedCampaigns: string[]
}

// Add these fields to the RelatedAccount interface
export interface RelatedAccount {
  id: string
  name: string
  industry: string
  revenue: number
  similarityScore: number  // Add this
  similarityReason: string[]  // Add this
  events: Event[]
  details: AccountDetails
  deals: Deal[]
  contacts: Contact[]
}

