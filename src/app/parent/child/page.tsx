import { childProfile } from "@/data/parent"
import { PickupContactsTable } from "@/components/shared/dashboard-tables"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParentChildPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Child profile"
        title={`${childProfile.name}’s profile`}
        description="Classroom details, pickup planning, and the comfort information teachers use every day."
      />
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Profile snapshot</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Classroom</p>
              <p className="mt-1">{childProfile.classroom}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Teachers</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {childProfile.teachers.map((teacher) => (
                  <Badge key={teacher} variant="secondary" className="rounded-full">
                    {teacher}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Comfort items</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {childProfile.comfortItems.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Allergies</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {childProfile.allergies.map((allergy) => (
                  <Badge key={allergy} variant="secondary" className="rounded-full">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">
              Authorized pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PickupContactsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
