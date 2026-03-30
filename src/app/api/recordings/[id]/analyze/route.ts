import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface GeminiAnalysis {
  overall_sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  summary: string;
  categories: {
    category: "food" | "service" | "atmosphere" | "price" | "other";
    sentiment: "positive" | "neutral" | "negative";
    excerpt: string;
  }[];
}

async function transcribeAudio(audioUrl: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  // Download the audio file
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) throw new Error("Failed to download audio");
  const audioBlob = await audioResponse.blob();

  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "no");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.text;
}

async function analyzeWithGemini(
  transcript: string
): Promise<GeminiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const prompt = `Du er en AI som analyserer kundetilbakemeldinger for norske restauranter og servicebedrifter.

Analyser følgende transkripsjon og returner et JSON-objekt med:
1. "overall_sentiment": "positive", "neutral" eller "negative"
2. "sentiment_score": et tall mellom 0 og 1 (0 = veldig negativt, 1 = veldig positivt)
3. "summary": en kort oppsummering på norsk (1-2 setninger)
4. "categories": en liste med relevante kategorier. Hver kategori har:
   - "category": en av "food", "service", "atmosphere", "price", "other"
   - "sentiment": "positive", "neutral" eller "negative"
   - "excerpt": et kort utdrag fra transkripsjonen som underbygger vurderingen

Inkluder kun kategorier som faktisk nevnes i tilbakemeldingen.

Returner KUN gyldig JSON, ingen annen tekst.

Transkripsjon:
"${transcript}"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as GeminiAnalysis;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServiceClient();

    // Get recording
    const { data: recording, error: recError } = await supabase
      .from("recordings")
      .select("id, audio_url, status")
      .eq("id", id)
      .single();

    if (recError || !recording) {
      return NextResponse.json(
        { error: "Innspilling ikke funnet" },
        { status: 404 }
      );
    }

    // Mark as processing
    await supabase
      .from("recordings")
      .update({ status: "processing" })
      .eq("id", id);

    // Step 1: Transcribe
    const transcript = await transcribeAudio(recording.audio_url);

    // Save transcript
    await supabase
      .from("recordings")
      .update({ transcript, status: "processing" })
      .eq("id", id);

    // Step 2: Analyze with Gemini
    const analysis = await analyzeWithGemini(transcript);

    // Step 3: Save analysis
    const { data: analysisRow, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        recording_id: id,
        overall_sentiment: analysis.overall_sentiment,
        sentiment_score: analysis.sentiment_score,
        summary: analysis.summary,
      })
      .select("id")
      .single();

    if (analysisError) throw analysisError;

    // Step 4: Save categories
    if (analysis.categories && analysis.categories.length > 0) {
      const categoryRows = analysis.categories.map((cat) => ({
        analysis_id: analysisRow.id,
        category: cat.category,
        sentiment: cat.sentiment,
        excerpt: cat.excerpt,
      }));

      const { error: catError } = await supabase
        .from("analysis_categories")
        .insert(categoryRows);

      if (catError) throw catError;
    }

    // Mark recording as completed
    await supabase
      .from("recordings")
      .update({ status: "completed" })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analysis error:", err);

    // Mark as failed
    const supabase = createServiceClient();
    await supabase
      .from("recordings")
      .update({ status: "failed" })
      .eq("id", id);

    return NextResponse.json(
      { error: "Analyse feilet" },
      { status: 500 }
    );
  }
}
