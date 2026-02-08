import { Badge } from "@/components/ui/badge"
import React from "react"

export interface HealthRecord {
    sleep?: {
        hours: number
        quality: number
    }
    mood?: {
        score: number
        energy: number
        stress: number
    }
    hydration?: number
    nutrition?: {
        calories: number
        target: number
        adherence: number
    }
    _creationTime?: number
}

export function calculateStatus(record: HealthRecord | null | undefined) {
    if (!record) return "no-data"

    let score = 0
    let totalMetrics = 0

    if (record.sleep) {
        score += (record.sleep.hours / 8) * 100
        totalMetrics++
    }
    if (record.mood) {
        score += (record.mood.score / 5) * 100
        totalMetrics++
    }

    const finalScore = totalMetrics > 0 ? score / totalMetrics : 0

    if (finalScore >= 90) return "excellent"
    if (finalScore >= 75) return "good"
    if (finalScore >= 60) return "attention"
    return "critical"
}

export function getAlerts(record: HealthRecord | null | undefined) {
    if (!record) return []
    const alerts: string[] = []
    if (record.sleep && record.sleep.hours < 6) alerts.push("Sono crítico")
    if (record.sleep && record.sleep.hours < 7.5) alerts.push("Sono abaixo da média")
    if (record.mood && record.mood.score < 3) alerts.push("Humor baixo")
    if (record.mood && record.mood.stress > 4) alerts.push("Estresse elevado")
    return alerts
}

export function getStatusColor(status: string) {
    switch (status) {
        case "excellent": return "text-green-500"
        case "good": return "text-blue-500"
        case "attention": return "text-yellow-500"
        case "critical": return "text-red-500"
        default: return "text-muted-foreground"
    }
}

export function getStatusBadge(status: string) {
    switch (status) {
        case "excellent": return <Badge className="bg-green-500/20 text-green-500">Excelente</Badge>
        case "good": return <Badge className="bg-blue-500/20 text-blue-500">Bom</Badge>
        case "attention": return <Badge className="bg-yellow-500/20 text-yellow-500">Atenção</Badge>
        case "critical": return <Badge className="bg-red-500/20 text-red-500">Crítico</Badge>
        default: return <Badge variant="outline">Sem dados</Badge>
    }
}
