import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Event {
  type: "Meeting" | "Email" | "Ad Click" | "Blog View" | "Event Attended" | "Site Visit"
  date: string
  description: string
  campaign?: {
    name: string
    focus: string
  }
  pagesViewed?: string[]
}

export function ActivityAndEngagement({ events }: { events: Event[] }) {
  return (
    <Card className={cn("bg-primary-3 border-primary-3 text-primary-1")}>
      <CardHeader>
        <CardTitle>Activity and Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-3">
          {events.map((event, index) => (
            <div key={index} className={cn("p-4 rounded-lg border-primary-4 bg-primary-1 border-[2px]")}>
              <div className={cn("flex justify-between items-center mb-2")}>
                <span className={cn("font-semibold text-primary-5")}>{event.type}</span>
                <span className={cn("text-sm text-primary-3")}>{event.date}</span>
              </div>
              <p className={cn("text-primary-4 mb-2")}>{event.description}</p>
              {event.campaign && (
                <div className={cn("text-sm text-primary-3")}>
                  <div className={cn("font-semibold text-primary-5")}>Campaign: <span className={cn("font-normal text-primary-3")}>{event.campaign.name}</span></div>
                  <div className={cn("font-semibold text-primary-5")}>Focus: <span className={cn("font-normal text-primary-3")}>{event.campaign.focus}</span></div>
                </div>
              )}
              {event.pagesViewed && (
                <div className={cn("font-semibold text-sm text-primary-5")}>Pages Viewed: <span className={cn("font-normal text-primary-3")}>{event.pagesViewed.join(", ")}</span></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

