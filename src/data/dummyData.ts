import { faker } from "@faker-js/faker"
import type { Account, RelatedAccount, Event, Deal, Contact } from "../lib/account"

const generateDummyContact = (id: string): Contact => ({
  id,
  name: faker.person.fullName(),
  city: faker.location.city(),
  state: faker.location.state(),
  country: faker.location.country(),
  email: faker.internet.email(),
  buyerRoles: faker.helpers.arrayElements(["Buyer", "Champion", "User", "Executive", "Referrer"], { min: 1, max: 3 }),
  supervisor: undefined,
  reports: [],
})

const generateDummyAccount = (): Account => {
  const contacts = Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, () =>
    generateDummyContact(faker.string.uuid()),
  )

  // Assign supervisors and reports
  contacts.forEach((contact, index) => {
    if (index > 0 && Math.random() > 0.3) {
      const supervisorIndex = faker.number.int({ min: 0, max: index - 1 })
      contact.supervisor = contacts[supervisorIndex].id
      contacts[supervisorIndex].reports.push(contact.id)
    }
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    owner: faker.person.fullName(),
    csm: faker.person.fullName(),
    arr: faker.number.int({ min: 10000, max: 1000000 }),
    events: Array.from(
      { length: 10 },
      (): Event => ({
        type: faker.helpers.arrayElement(["Meeting", "Email", "Ad Click", "Blog View", "Event Attended", "Site Visit"]),
        date: faker.date.recent().toISOString(),
        description: faker.lorem.sentence(),
        campaign:
          Math.random() > 0.5
            ? {
                name: faker.company.buzzPhrase(),
                focus: faker.helpers.arrayElement(["Product A", "Company Brand"]),
              }
            : undefined,
        pagesViewed:
          Math.random() > 0.5
            ? Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.internet.url())
            : undefined,
      }),
    ),
    details: {
      employees: faker.number.int({ min: 10, max: 10000 }),
      annualRevenue: faker.number.int({ min: 1000000, max: 1000000000 }),
      arr: faker.number.int({ min: 10000, max: 1000000 }),
      lastContractStart: faker.date.past().toISOString().split("T")[0],
      nextCloseDate: faker.date.future().toISOString().split("T")[0],
      stage: faker.helpers.arrayElement([
        "Prospect",
        "Outreach",
        "Qualified",
        "Negotiation",
        "Customer",
        "Closed Lost",
      ]),
      useCases: faker.helpers.arrayElements(["UseCase1", "UseCase2", "UseCase3", "UseCase4"], { min: 1, max: 4 }),
    },
    deals: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      (): Deal => ({
        name: faker.company.buzzPhrase(),
        teamName: faker.company.name(),
        primaryContact: faker.person.fullName(),
        useCases: faker.helpers.arrayElements(["UseCase1", "UseCase2", "UseCase3", "UseCase4"], { min: 1, max: 4 }),
        arr: faker.number.int({ min: 10000, max: 1000000 }),
        closeDate: faker.date.future().toISOString().split("T")[0],
        contractStart: faker.date.future().toISOString().split("T")[0],
        contractEnd: faker.date.future().toISOString().split("T")[0],
      }),
    ),
    contacts,
    assignedCampaigns: faker.helpers.arrayElements(["Campaign A", "Campaign B", "Campaign C", "Campaign D"], {
      min: 0,
      max: 2,
    }),
  }
}

export const dummyAccounts: Account[] = Array.from({ length: 10 }, generateDummyAccount)

export const dummyRelatedAccounts: RelatedAccount[] = Array.from({ length: 5 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  industry: faker.company.buzzPhrase(),
  revenue: faker.number.int({ min: 1000000, max: 1000000000 }),
  similarityScore: Math.min(100, Math.max(0, 
    Math.round(
      (faker.number.int({ min: -75, max: 75 }) / 3) + 87.5
    )
  )),
  similarityReason: faker.helpers.arrayElements(["Firmographics Match", "Similar Use Cases", "Related Contacts","Product Usage","Similar Engagement"], { min: 1, max: 4 }),
  events: Array.from(
    { length: 5 },
    (): Event => ({
      type: faker.helpers.arrayElement(["Meeting", "Email", "Ad Click", "Blog View", "Event Attended", "Site Visit"]),
      date: faker.date.recent().toISOString(),
      description: faker.lorem.sentence(),
    }),
  ),
  details: {
    employees: faker.number.int({ min: 10, max: 10000 }),
    annualRevenue: faker.number.int({ min: 1000000, max: 1000000000 }),
    arr: faker.number.int({ min: 10000, max: 1000000 }),
    lastContractStart: faker.date.past().toISOString().split("T")[0],
    nextCloseDate: faker.date.future().toISOString().split("T")[0],
    stage: faker.helpers.arrayElement(["Prospect", "Outreach", "Qualified", "Negotiation", "Customer", "Closed Lost"]),
    useCases: faker.helpers.arrayElements(["UseCase1", "UseCase2", "UseCase3", "UseCase4"], { min: 1, max: 4 }),
  },
  deals: Array.from(
    { length: 2 },
    (): Deal => ({
      name: faker.company.buzzPhrase(),
      teamName: faker.company.name(),
      primaryContact: faker.person.fullName(),
      useCases: faker.helpers.arrayElements(["UseCase1", "UseCase2", "UseCase3", "UseCase4"], { min: 1, max: 4 }),
      arr: faker.number.int({ min: 10000, max: 1000000 }),
      closeDate: faker.date.future().toISOString().split("T")[0],
      contractStart: faker.date.future().toISOString().split("T")[0],
      contractEnd: faker.date.future().toISOString().split("T")[0],
    }),
  ),
  contacts: Array.from({ length: 3 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    email: faker.internet.email(),
    buyerRoles: faker.helpers.arrayElements(["Buyer", "Champion", "User", "Executive", "Referrer"], { min: 1, max: 3 }),
    supervisor: undefined,
    reports: [],
  })),
}))

