"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mic, StopCircle, Plus, Stethoscope } from "lucide-react"

export default function MedicalTranslatorPage() {
  const [step, setStep] = useState<"setup" | "recording" | "translating" | "ready">("setup")
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [doctorName, setDoctorName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [agentId, setAgentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleCreateAgent = async () => {
    if (!doctorName || !specialization || languages.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorName,
          specialization,
          languages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create agent")
      }

      const data = await response.json()
      setAgentId(data.agent_id)
      setStep("recording")
      setError(null)
    } catch (err) {
      console.error("Error creating agent:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setRecordingStatus("recording")
      setError(null)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Failed to start recording. Please ensure microphone access is granted.")
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) return

      mediaRecorderRef.current.onstop = async () => {
        try {
          const recordedBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          setRecordingStatus("processing")

          const formData = new FormData()
          formData.append("audio", recordedBlob)
          formData.append("name", doctorName)

          const response = await fetch("/api/clone-voice", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to process audio")
          }

          setStep("ready")
          setError(null)
        } catch (err) {
          console.error("Error processing audio:", err)
          setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
          setRecordingStatus("idle")
          resolve()
        }
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    })
  }

  const handleRecordingClick = async () => {
    if (recordingStatus === "idle") {
      await startRecording()
    } else if (recordingStatus === "recording") {
      await stopRecording()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Stethoscope className="mr-2 h-8 w-8" />
        Medical Translation Agent
      </h1>

      {step === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Medical Translation Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="doctorName">Doctor's Name</Label>
                <Input
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="specialization">Medical Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Practice</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label>Supported Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {["en", "es", "fr", "de", "zh", "ja", "ko", "hi"].map((lang) => (
                    <Button
                      key={lang}
                      variant={languages.includes(lang) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
                      }}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateAgent} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Create Translation Agent
              </Button>

              {error && (
                <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === "recording" && (
        <Card>
          <CardHeader>
            <CardTitle>Record Doctor's Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please record a sample of the doctor's voice. This will be used to generate translations in their voice.
              </p>

              <Button onClick={handleRecordingClick} className="w-full" disabled={recordingStatus === "processing"}>
                {recordingStatus === "processing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : recordingStatus === "recording" ? (
                  <>
                    <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Start Recording
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === "ready" && (
        <Card>
          <CardHeader>
            <CardTitle>Medical Translation Agent Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Your medical translation agent has been created and is ready to use. You can now:
                <ul className="list-disc list-inside mt-2">
                  <li>Record medical instructions in English</li>
                  <li>Get translations in supported languages</li>
                  <li>Receive audio in the doctor's voice</li>
                </ul>
              </div>

              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Start New Translation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

