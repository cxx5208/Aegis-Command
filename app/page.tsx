"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Briefcase,
  FileText,
  AmbulanceIcon as FirstAid,
  Volume2,
  Users,
  Lightbulb,
  Map,
  ChevronRight,
  Bell,
  Shield,
  Mic,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="h-8 w-8 mr-2 text-blue-400" />
              Aegis Command
            </h1>
            <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <DashboardCard
            title="Squad Health"
            description="Real-time health metrics for your squad."
            icon={<Activity className="h-6 w-6 text-green-400" />}
            link="/squad-health"
            stats="98% Optimal"
          />
          <DashboardCard
            title="AI Tactical"
            description="AI-powered tactical adjustments and recommendations."
            icon={<Briefcase className="h-6 w-6 text-yellow-400" />}
            link="/ai-tactical"
            stats="3 New Strategies"
          />
          <DashboardCard
            title="Mission Control"
            description="Current mission status and objectives."
            icon={<FileText className="h-6 w-6 text-blue-400" />}
            link="/mission-control"
            stats="Operation Active"
          />
          <DashboardCard
            title="Medical Assistance"
            description="Request and manage medical support."
            icon={<FirstAid className="h-6 w-6 text-red-400" />}
            link="/medical-assistance"
            stats="All Clear"
          />
          <DashboardCard
            title="Voice Clone & Translate"
            description="Clone voices and translate messages."
            icon={<Mic className="h-6 w-6 text-purple-400" />}
            link="/voice-clone-translate"
            stats="New Feature"
          />
        </div>

        <SquadPerformanceSummary />
      </main>
    </div>
  )
}

function DashboardCard({ title, description, icon, link, stats }) {
  return (
    <Link href={link}>
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{stats}</div>
          <p className="text-xs text-gray-400">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function SquadPerformanceSummary() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const squadPerformanceData = {
    movementStats: {
      totalDistance: "8.52 km",
      avgDistance: "1.22 km",
      peakDay: "2025-01-08 (2.47 km)",
      leastActiveDay: "2025-01-10 (0.48 km)",
    },
    squadMetrics: {
      combatReadiness: "80.84%",
      avgFatigue: "1.92",
      squadMorale: "100.00%",
      alertLevel: "0.00%",
    },
    soldierInsights: {
      mostEndurance: "Chris Brown (3.67 km)",
      highestFatigueResistance: "Emily Davis (Score: 0.57)",
      mostStableHeartRate: "Sarah Williams",
      fastestRecoveryRate: "Jane Smith",
    },
    recommendations: [
      "Rebalance squad movements to avoid exhaustion.",
      "Monitor high-fatigue soldiers closely for burnout risks.",
      "Optimize training schedules on least active days (2025-01-10).",
      "Utilize highest endurance soldiers for long missions.",
    ],
    geospatialCoordination:
      "Squad movement shows distributed terrain patterns. Centralized movement planning suggested to optimize resources.",
  }

  const generateSummary = (lang: string) => {
    const summaries = {
      en: `Squad Performance Summary:
    Movement: The squad covered a total distance of ${squadPerformanceData.movementStats.totalDistance}, averaging ${squadPerformanceData.movementStats.avgDistance} per day. Peak movement was on ${squadPerformanceData.movementStats.peakDay}, while the least active day was ${squadPerformanceData.movementStats.leastActiveDay}.
    
    Squad Metrics: Combat readiness is at ${squadPerformanceData.squadMetrics.combatReadiness}, with an average fatigue level of ${squadPerformanceData.squadMetrics.avgFatigue}. Squad morale is at ${squadPerformanceData.squadMetrics.squadMorale}, and the current alert level is ${squadPerformanceData.squadMetrics.alertLevel}.
    
    Individual Insights: ${squadPerformanceData.soldierInsights.mostEndurance} showed the most endurance. ${squadPerformanceData.soldierInsights.highestFatigueResistance} demonstrated the highest fatigue resistance. ${squadPerformanceData.soldierInsights.mostStableHeartRate} maintained the most stable heart rate, while ${squadPerformanceData.soldierInsights.fastestRecoveryRate} had the fastest recovery rate.
    
    Recommendations: ${squadPerformanceData.recommendations.join(" ")}
    
    Geospatial Coordination: ${squadPerformanceData.geospatialCoordination}`,
      es: `Resumen del rendimiento del escuadrón:
    Movimiento: El escuadrón cubrió una distancia total de ${squadPerformanceData.movementStats.totalDistance}, promediando ${squadPerformanceData.movementStats.avgDistance} por día. El movimiento máximo fue el ${squadPerformanceData.movementStats.peakDay}, mientras que el día menos activo fue el ${squadPerformanceData.movementStats.leastActiveDay}.
    
    Métricas del escuadrón: La preparación para el combate está al ${squadPerformanceData.squadMetrics.combatReadiness}, con un nivel de fatiga promedio de ${squadPerformanceData.squadMetrics.avgFatigue}. La moral del escuadrón está al ${squadPerformanceData.squadMetrics.squadMorale}, y el nivel de alerta actual es ${squadPerformanceData.squadMetrics.alertLevel}.
    
    Perspectivas individuales: ${squadPerformanceData.soldierInsights.mostEndurance} mostró la mayor resistencia. ${squadPerformanceData.soldierInsights.highestFatigueResistance} demostró la mayor resistencia a la fatiga. ${squadPerformanceData.soldierInsights.mostStableHeartRate} mantuvo el ritmo cardíaco más estable, mientras que ${squadPerformanceData.soldierInsights.fastestRecoveryRate} tuvo la tasa de recuperación más rápida.
    
    Recomendaciones: ${squadPerformanceData.recommendations.join(" ")}
    
    Coordinación geoespacial: ${squadPerformanceData.geospatialCoordination}`,
      zh: `小队表现总结：
    移动：小队总共覆盖了${squadPerformanceData.movementStats.totalDistance}的距离，平均每天${squadPerformanceData.movementStats.avgDistance}。峰值移动日是${squadPerformanceData.movementStats.peakDay}，而最不活跃的日子是${squadPerformanceData.movementStats.leastActiveDay}。
    
    小队指标：战斗准备度为${squadPerformanceData.squadMetrics.combatReadiness}，平均疲劳度为${squadPerformanceData.squadMetrics.avgFatigue}。小队士气为${squadPerformanceData.squadMetrics.squadMorale}，当前警戒级别为${squadPerformanceData.squadMetrics.alertLevel}。
    
    个人洞察：${squadPerformanceData.soldierInsights.mostEndurance}表现出最强的耐力。${squadPerformanceData.soldierInsights.highestFatigueResistance}展示了最高的疲劳抵抗力。${squadPerformanceData.soldierInsights.mostStableHeartRate}保持了最稳定的心率，而${squadPerformanceData.soldierInsights.fastestRecoveryRate}拥有最快的恢复率。
    
    建议：${squadPerformanceData.recommendations.join(" ")}
    
    地理空间协调：${squadPerformanceData.geospatialCoordination}`,
      hi: `स्क्वाड प्रदर्शन सारांश:
गतिविधि: स्क्वाड ने कुल ${squadPerformanceData.movementStats.totalDistance} की दूरी तय की, प्रति दिन औसतन ${squadPerformanceData.movementStats.avgDistance}। सबसे अधिक गतिविधि ${squadPerformanceData.movementStats.peakDay} को थी, जबकि सबसे कम सक्रिय दिन ${squadPerformanceData.movementStats.leastActiveDay} था।

स्क्वाड मेट्रिक्स: लड़ाई की तैयारी ${squadPerformanceData.squadMetrics.combatReadiness} पर है, औसत थकान स्तर ${squadPerformanceData.squadMetrics.avgFatigue} के साथ। स्क्वाड का मनोबल ${squadPerformanceData.squadMetrics.squadMorale} पर है, और वर्तमान चेतावनी स्तर ${squadPerformanceData.squadMetrics.alertLevel} है।

व्यक्तिगत अंतर्दृष्टि: ${squadPerformanceData.soldierInsights.mostEndurance} ने सबसे अधिक सहनशक्ति दिखाई। ${squadPerformanceData.soldierInsights.highestFatigueResistance} ने सबसे अधिक थकान प्रतिरोध प्रदर्शित किया। ${squadPerformanceData.soldierInsights.mostStableHeartRate} ने सबसे स्थिर हृदय गति बनाए रखी, जबकि ${squadPerformanceData.soldierInsights.fastestRecoveryRate} की रिकवरी दर सबसे तेज थी।

सिफारिशें: ${squadPerformanceData.recommendations.join(" ")}

भू-स्थानिक समन्वय: ${squadPerformanceData.geospatialCoordination}`,
    }

    return summaries[lang] || summaries.en
  }

  const handleTextToSpeech = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const summary = generateSummary(selectedLanguage)
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: summary, language: selectedLanguage }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to convert text to speech")
      }
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error("Error converting text to speech:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-blue-400">
          <FileText className="h-6 w-6 mr-2" />
          <span>Squad Performance Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummarySection title="Movement Statistics" icon={<Activity className="h-5 w-5 text-green-400" />}>
            <ul className="space-y-2">
              <SummaryItem label="Total Distance Covered" value={squadPerformanceData.movementStats.totalDistance} />
              <SummaryItem label="Average Distance Per Day" value={squadPerformanceData.movementStats.avgDistance} />
              <SummaryItem label="Peak Movement Day" value={squadPerformanceData.movementStats.peakDay} />
              <SummaryItem label="Least Active Day" value={squadPerformanceData.movementStats.leastActiveDay} />
            </ul>
          </SummarySection>

          <SummarySection title="Squad Metrics" icon={<Briefcase className="h-5 w-5 text-yellow-400" />}>
            <ul className="space-y-2">
              <SummaryItem label="Combat Readiness Score" value={squadPerformanceData.squadMetrics.combatReadiness} />
              <SummaryItem label="Average Fatigue Level" value={squadPerformanceData.squadMetrics.avgFatigue} />
              <SummaryItem label="Squad Morale" value={squadPerformanceData.squadMetrics.squadMorale} />
              <SummaryItem label="Alert Level" value={squadPerformanceData.squadMetrics.alertLevel} />
            </ul>
          </SummarySection>

          <SummarySection title="Individual Soldier Insights" icon={<Users className="h-5 w-5 text-blue-400" />}>
            <ul className="space-y-2">
              <SummaryItem label="Most Endurance" value={squadPerformanceData.soldierInsights.mostEndurance} />
              <SummaryItem
                label="Highest Fatigue Resistance"
                value={squadPerformanceData.soldierInsights.highestFatigueResistance}
              />
              <SummaryItem
                label="Most Stable Heart Rate"
                value={squadPerformanceData.soldierInsights.mostStableHeartRate}
              />
              <SummaryItem
                label="Fastest Recovery Rate"
                value={squadPerformanceData.soldierInsights.fastestRecoveryRate}
              />
            </ul>
          </SummarySection>

          <SummarySection title="Squad Recommendations" icon={<Lightbulb className="h-5 w-5 text-amber-400" />}>
            <ul className="space-y-2 text-sm">
              {squadPerformanceData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-4 w-4 mr-1 mt-1 flex-shrink-0 text-amber-400" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </SummarySection>
        </div>

        <SummarySection
          title="Geospatial Movement Coordination"
          icon={<Map className="h-5 w-5 text-indigo-400" />}
          className="mt-6"
        >
          <p className="text-sm">{squadPerformanceData.geospatialCoordination}</p>
        </SummarySection>

        <div className="mt-6 flex justify-end items-center space-x-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleTextToSpeech}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              "Converting..."
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Convert to Speech
              </>
            )}
          </Button>
        </div>
        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
      </CardContent>
    </Card>
  )
}

function SummarySection({ title, icon, children, className = "" }) {
  return (
    <div className={`bg-gray-700 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold mb-3 flex items-center text-lg text-gray-200">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {children}
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <li className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-200">{value}</span>
    </li>
  )
}

