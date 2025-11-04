import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with subscription info
    const { data: profile } = await supabase
      .from("users")
      .select("subscription_tier, ai_requests_count, ai_requests_reset_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Check if AI requests need to be reset (monthly)
    const resetDate = new Date(profile.ai_requests_reset_at);
    const now = new Date();
    const shouldReset = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();

    if (shouldReset) {
      await supabase
        .from("users")
        .update({
          ai_requests_count: 0,
          ai_requests_reset_at: now.toISOString(),
        })
        .eq("id", user.id);
      profile.ai_requests_count = 0;
    }

    // Rate limiting based on tier
    const limits = {
      free: 5,
      pro: Infinity,
      elite: Infinity,
    };

    const userLimit = limits[profile.subscription_tier];
    if (profile.ai_requests_count >= userLimit) {
      return NextResponse.json(
        {
          error: `AI request limit reached. Upgrade to Pro for unlimited AI coaching!`,
          limit: userLimit,
          current: profile.ai_requests_count,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { task, type, history } = body;

    // Use server-side API key (included in subscription)
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "task-breakdown":
        systemPrompt = `You are an AI Focus Coach specialized in helping users break down tasks into flow-optimized chunks. Use the "1-90-0" deep work method: 1 minute to prepare, 90 minutes of deep focus, 0 distractions.`;
        userPrompt = `Task: ${task.title}\nDescription: ${task.description}\n\nBreak this task into actionable steps optimized for deep focus sessions. Keep it concise and practical.`;
        break;

      case "dopamine-detox":
        systemPrompt = `You are an AI Focus Coach helping users prepare for distraction-free deep work. Suggest practical dopamine detox actions.`;
        userPrompt = `I'm about to start a focus session for: "${task.title}"\n\nGive me 3-5 quick dopamine detox reminders to prepare my environment and mind for deep work.`;
        break;

      case "motivational-insight":
        systemPrompt = `You are an AI Focus Coach providing motivational insights based on user's focus history. Be encouraging and specific.`;
        userPrompt = `User's recent sessions: ${JSON.stringify(history)}\n\nProvide a motivational insight about their progress and encourage their next session. Keep it under 50 words.`;
        break;

      case "session-summary":
        systemPrompt = `You are an AI Focus Coach creating concise session summaries. Focus on accomplishments and next steps.`;
        userPrompt = `Session reflection:\nTask: ${task.title}\nFocus Quality: ${body.focusQuality}/10\nAccomplished: ${body.focusDepth}\nDistractions: ${body.whatDistracted}\nNext Steps: ${body.whatsNext}\n\nCreate a 3-line summary highlighting: 1) What was achieved, 2) Key insight, 3) Momentum builder for next session.`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400 }
        );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "";

    // Increment usage counter
    await supabase
      .from("users")
      .update({
        ai_requests_count: profile.ai_requests_count + 1,
      })
      .eq("id", user.id);

    return NextResponse.json({
      response,
      usage: {
        current: profile.ai_requests_count + 1,
        limit: userLimit === Infinity ? "unlimited" : userLimit,
        tier: profile.subscription_tier,
      },
    });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
