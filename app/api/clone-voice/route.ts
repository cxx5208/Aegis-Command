import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File
    const name = formData.get("name") as string

    if (!audioFile || !name) {
      return NextResponse.json({ error: "Missing required parameters: audio file and name" }, { status: 400 })
    }

    if (!process.env.ELEVEN_LABS_API_KEY) {
      return NextResponse.json({ error: "Eleven Labs API key is not configured" }, { status: 500 })
    }

    // First, get available voices to use as target
    const voicesResponse = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        Accept: "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
    })

    if (!voicesResponse.ok) {
      const errorData = await voicesResponse.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to fetch available voices")
    }

    const voicesData = await voicesResponse.json()
    if (!voicesData.voices || voicesData.voices.length === 0) {
      throw new Error("No voices available")
    }

    // Use the first available voice as target
    const targetVoiceId = voicesData.voices[0].voice_id

    // Create form data for the speech-to-speech conversion
    const apiFormData = new FormData()
    apiFormData.append("audio", audioFile)
    apiFormData.append("model_id", "eleven_multilingual_sts_v2")
    apiFormData.append("output_format", "mp3_44100_128")

    // Convert the audio using speech-to-speech streaming endpoint
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${targetVoiceId}/stream`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response from Eleven Labs:", errorText)
      throw new Error(errorText || "Failed to convert speech")
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error in speech-to-speech conversion:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred during speech conversion",
      },
      { status: 500 },
    )
  }
}

