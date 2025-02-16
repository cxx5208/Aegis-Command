import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { doctorName, specialization, languages } = await req.json()

    if (!process.env.ELEVEN_LABS_API_KEY) {
      return NextResponse.json({ error: "ElevenLabs API key is not configured" }, { status: 500 })
    }

    // Create the agent with medical translation configuration
    const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        name: `Dr. ${doctorName} - Medical Translator`,
        conversation_config: {
          agent: {
            first_message: "Hello, I'm your medical instruction translator. How can I help you today?",
            language: "en",
          },
          asr: {
            quality: "high",
            provider: "elevenlabs",
            user_input_audio_format: "pcm_16000",
            keywords: ["medication", "dosage", "treatment", "symptoms", "diagnosis"],
          },
          turn: {
            turn_timeout: 1.1,
            mode: "silence",
          },
          tts: {
            model_id: "eleven_turbo_v2",
            voice_id: "default", // Will be updated with cloned voice
            agent_output_audio_format: "pcm_16000",
            optimize_streaming_latency: 1,
            stability: 1.1,
            similarity_boost: 1.1,
            pronunciation_dictionary_locators: [
              {
                pronunciation_dictionary_id: "medical_terms",
                version_id: "latest",
              },
            ],
          },
        },
        platform_settings: {
          allowed_languages: languages,
          medical_specialization: specialization,
          translation_memory: true,
          store_conversations: true,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create agent")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create medical translation agent" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
    }

    if (!process.env.ELEVEN_LABS_API_KEY) {
      return NextResponse.json({ error: "ElevenLabs API key is not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        Accept: "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to fetch agent")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching agent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch agent details" },
      { status: 500 },
    )
  }
}

