"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mic, Volume2, StopCircle } from "lucide-react"

export default function VoiceCloneTranslatePage() {
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [translationText, setTranslationText] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [isTranslating, setIsTranslating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
          formData.append("name", "Recording")

          const response = await fetch("/api/clone-voice", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || "Failed to process audio")
          }

          const contentType = response.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Unexpected JSON response")
          }

          const processedBlob = await response.blob()
          const url = URL.createObjectURL(processedBlob)
          setAudioUrl(url)
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

  const handleTranslateAndSpeak = async () => {
    if (!translationText) {
      setError("Please enter text to translate")
      return
    }

    setIsTranslating(true)
    setError(null)
    try {
      const response = await fetch("/api/translate-and-speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceId: "default", // We'll use a default voice ID
          text: translationText,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to translate and generate speech")
      }

      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Unexpected JSON response")
      }

      const processedBlob = await response.blob()
      const url = URL.createObjectURL(processedBlob)
      setAudioUrl(url)
    } catch (error) {
      console.error("Error translating and generating speech:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Voice Clone and Translate</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voice Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
              {audioUrl && (
                <div className="mt-4">
                  <p className="text-sm text-green-500 mb-2">Audio processed successfully!</p>
                  <audio controls src={audioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translate and Speak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter text to translate and speak"
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
              />
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleTranslateAndSpeak}
                disabled={isTranslating || !translationText || !audioUrl}
                className="w-full"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Translate and Speak
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

