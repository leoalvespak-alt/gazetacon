"use client"

import { AlertCircle, Clock, FileText, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Alert {
  id: string
  type: "warning" | "info" | "muted"
  title: string
  description: string
  link?: string
  linkLabel?: string
}

interface DashboardAlertsProps {
  alerts: Alert[]
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  if (alerts.length === 0) return null

  const getIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "info":
        return <CalendarClock className="h-4 w-4 text-blue-500" />
      case "muted":
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getBgColor = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 border-amber-500/30"
      case "info":
        return "bg-blue-500/10 border-blue-500/30"
      case "muted":
        return "bg-muted/50 border-muted"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Alertas e Lembretes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor(alert.type)}`}
          >
            <div className="mt-0.5">{getIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.description}</p>
            </div>
            {alert.link && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={alert.link}>{alert.linkLabel || "Ver"}</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
