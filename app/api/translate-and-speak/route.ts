import { NextResponse } from "next/server"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { generateText } from "ai"

const perplexity = createOpenAICompatible({
  name: "perplexity",
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai/",
})

export async function POST(req: Request) {
  try {
    const { voiceId, text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing required parameters: text and targetLanguage" }, { status: 400 })
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: "Perplexity API key is not configured" }, { status: 500 })
    }

    if (!process.env.ELEVEN_LABS_API_KEY) {
      return NextResponse.json({ error: "Eleven Labs API key is not configured" }, { status: 500 })
    }

    // Translate the text using Perplexity AI
    const translationPrompt = `Translate the following text to ${targetLanguage}: "${text}"`
    const { text: translatedText } = await generateText({
      model: perplexity("llama-3.1-sonar-small-128k-online"),
      prompt: translationPrompt,
    })

    if (!translatedText) {
      throw new Error("Failed to translate text")
    }

    // Get available voices
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

    // Use the first available voice if no specific voiceId is provided
    const effectiveVoiceId = voiceId === "default" ? voicesData.voices[0].voice_id : voiceId

    // Use Eleven Labs API to generate speech with the selected voice
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}/stream`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text: translatedText,
        model_id: "eleven_multilingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail?.message || "Failed to generate speech")
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error in translate-and-speak API:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred while processing your request",
      },
      { status: 500 },
    )
  }
}

