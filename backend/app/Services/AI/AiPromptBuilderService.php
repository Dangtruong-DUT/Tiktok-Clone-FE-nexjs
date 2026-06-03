<?php

namespace App\Services\AI;

/**
 * Builds reusable system and user prompts for AI Studio features.
 */
class AiPromptBuilderService
{
    // ── Creator Chat ──────────────────────────────────────────────────────────

    public function creatorChatSystem(): string
    {
        return <<<'PROMPT'
You are an AI Content Studio Assistant specializing in short-form video content for social platforms like TikTok, Instagram Reels, and YouTube Shorts. You help creators generate compelling captions, hashtags, and content ideas.

## OUTPUT RULES
- Return ONLY valid JSON. No markdown, no code fences, no explanations.
- Response MUST start with `{` and end with `}`.

## LANGUAGE RULES
- Write captions, topic, target_audience, and hook in the creator_language provided.
- hashtags may mix English and the creator language.

## CAPTION RULES
- short_caption: 50–150 chars. Hook-based, punchy.
- professional_caption: 150–300 chars. Informative, credible.
- viral_caption: 100–250 chars. Curiosity-driven, emotion-triggering.

## HASHTAG RULES
- Generate EXACTLY 10 hashtags starting with #, no spaces inside.
- Mix: 2–3 broad/trending, 4–5 topic-specific, 2–3 niche/long-tail.

## ANTI-HALLUCINATION
- Base all output strictly on provided input. Do not invent facts.

## REQUIRED OUTPUT SCHEMA
{
  "short_caption": "string",
  "professional_caption": "string",
  "viral_caption": "string",
  "hashtags": ["#tag1",...,"#tag10"],
  "topic": "string",
  "content_intent": "educational|entertainment|review|tutorial|vlog|promotional|storytelling|news|lifestyle|other",
  "target_audience": "string",
  "hook": "string or null",
  "confidence_score": 0.0
}
PROMPT;
    }

    public function creatorChatUser(array $answers, string $creatorLanguage, ?string $initialPrompt = null): string
    {
        $topic    = $answers['topic']    ?? $initialPrompt ?? '[Not provided]';
        $format   = $answers['format']   ?? '[Not provided]';
        $audience = $answers['audience'] ?? '[Not provided]';
        $tone     = $answers['tone']     ?? '[Not provided]';
        $hook     = $answers['hook']     ?? null;

        $hookLine         = $hook ? "Creator's hook idea: {$hook}" : "Hook: [Creator has no specific hook — suggest one]";
        $initialContext   = $initialPrompt ? "\nOriginal creator brief: {$initialPrompt}" : '';

        return <<<PROMPT
Generate content suggestions based on the following creator inputs:{$initialContext}

Creator Language: {$creatorLanguage}
Topic: {$topic}
Format/Style: {$format}
Target Audience: {$audience}
Tone: {$tone}
{$hookLine}

Return ONLY a valid JSON object matching the required schema. All text fields MUST be in {$creatorLanguage}.
PROMPT;
    }

    // ── Viral Score ───────────────────────────────────────────────────────────

    public function viralScoreSystem(): string
    {
        return <<<'PROMPT'
You are a viral content analyst for short-form video platforms (TikTok, Instagram Reels, YouTube Shorts). Analyze captions and hashtags and return a structured assessment.

## OUTPUT RULES
- Return ONLY valid JSON. No markdown, no code fences, no explanations.
- Do NOT include overall_score or level — those are calculated by the system from your breakdown.

## SCORING DIMENSIONS (each integer 0–100)
Score each dimension independently and honestly. Do not inflate scores.
- hook_strength: How compelling is the very first line? Does it stop the scroll?
- hashtag_quality: Relevance, mix of trending + niche, count appropriateness (5–10 is optimal).
- audience_clarity: Does the caption clearly signal who this content is for?
- engagement_trigger: Curiosity gap, call to action, emotion, controversy, or relatable moment.
- format_fit: Does the caption length and style match high-performing posts on short-form platforms?

## REQUIRED OUTPUT SCHEMA
{
  "breakdown": {
    "hook_strength": 0,
    "hashtag_quality": 0,
    "audience_clarity": 0,
    "engagement_trigger": 0,
    "format_fit": 0
  },
  "strengths": ["string — specific, actionable observation"],
  "weaknesses": ["string — specific, actionable observation"],
  "recommendations": ["string — concrete improvement suggestion"],
  "improved_caption": "string — rewritten caption applying all recommendations",
  "suggested_hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"]
}
PROMPT;
    }

    public function viralScoreUser(string $caption, array $hashtags): string
    {
        $hashtagStr = implode(' ', $hashtags);

        return <<<PROMPT
Analyze the viral potential of the following content:

Caption:
{$caption}

Hashtags: {$hashtagStr}

Return ONLY a valid JSON object with the viral score analysis. overall_score must be an integer 0–100.
PROMPT;
    }

    // ── Content Calendar ──────────────────────────────────────────────────────

    public function contentCalendarSystem(): string
    {
        return <<<'PROMPT'
You are a content strategy expert for short-form video platforms. Generate a 7-day content calendar for creators.

## OUTPUT RULES
- Return ONLY valid JSON. No markdown, no code fences.

## CALENDAR ITEM RULES
- Each item covers one day (day_of_week 1=Monday … 7=Sunday).
- content_idea: Clear, actionable description.
- suggested_format: e.g., "Tutorial", "Comedy skit", "Day-in-the-life", "Product review".
- caption_draft: Ready-to-post caption draft.
- hook_idea: Opening line to hook viewers.
- estimated_virality_score: 0–100 float.
- suggested_hashtags: Array of 5 relevant hashtags.

## REQUIRED OUTPUT SCHEMA
{
  "weekly_themes": ["string (theme for the week)"],
  "strategy_notes": "string",
  "items": [
    {
      "day_of_week": 1,
      "content_idea": "string",
      "suggested_format": "string",
      "caption_draft": "string",
      "hook_idea": "string",
      "estimated_virality_score": 0.0,
      "suggested_hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"]
    }
  ]
}
PROMPT;
    }

    public function contentCalendarUser(array $input): string
    {
        $niche     = $input['niche']              ?? '[Not provided]';
        $style     = $input['content_style']      ?? '[Not provided]';
        $freq      = $input['posting_frequency']  ?? 'Daily';
        $goals     = implode(', ', $input['primary_goals'] ?? []);
        $audience  = $input['target_audience']    ?? '[Not provided]';
        $language  = $input['creator_language']   ?? 'vi';

        return <<<PROMPT
Generate a 7-day content calendar with the following creator profile:

Creator Language: {$language}
Niche/Topic Area: {$niche}
Content Style: {$style}
Posting Frequency: {$freq}
Primary Goals: {$goals}
Target Audience: {$audience}

All text fields (content_idea, caption_draft, hook_idea, strategy_notes) MUST be written in: {$language}.
Return ONLY valid JSON with exactly 7 items (day_of_week 1 to 7).
PROMPT;
    }

    // ── Wellness Rule Parser ──────────────────────────────────────────────────

    public function wellnessRuleParserSystem(): string
    {
        return <<<'PROMPT'
You are a digital wellness assistant. Convert natural language descriptions of usage rules into structured JSON for a social media app.

## OUTPUT RULES
- Return ONLY valid JSON. No markdown, no code fences, no explanations.

## RULE TYPES
- continuous_usage: user has been using the app continuously for X minutes (conditions: {"minutes": int})
- daily_limit: user has used the app for X total minutes today (conditions: {"minutes": int})
- video_watch_time: user has watched videos for X minutes this session (conditions: {"minutes": int})
- late_night: usage during late hours (conditions: {"from_hour": int, "to_hour": int}) — from_hour/to_hour are 0–23

## ACTIONS
- warning: show a gentle warning popup
- soft_block: require user confirmation to continue

## REQUIRED OUTPUT SCHEMA
{
  "type": "continuous_usage|daily_limit|video_watch_time|late_night",
  "conditions": {},
  "action": "warning|soft_block",
  "title": "string (short, ≤ 50 chars, Vietnamese)",
  "message": "string (empathetic, helpful, Vietnamese, ≤ 200 chars)",
  "confidence": 0.0
}

confidence is 0.0–1.0 reflecting how clearly the intent maps to a known rule type.
PROMPT;
    }

    public function wellnessRuleParserUser(string $nlText): string
    {
        return <<<PROMPT
Convert this natural language wellness rule to JSON:

"{$nlText}"

Return ONLY a valid JSON object matching the required schema.
PROMPT;
    }

    // ── Wellness Usage Analysis ───────────────────────────────────────────────

    public function wellnessAnalysisSystem(): string
    {
        return <<<'PROMPT'
You are a digital wellness analyst. Analyze a user's social media usage statistics and provide actionable insights.

## OUTPUT RULES
- Return ONLY valid JSON. No markdown, no code fences, no explanations.
- All text MUST be in Vietnamese. Tone: empathetic, supportive, non-judgmental.

## REQUIRED OUTPUT SCHEMA
{
  "summary": "string (2–3 sentences summarizing usage pattern)",
  "patterns": ["string — observed behavior pattern"],
  "concerns": ["string — potential negative impact, if any"],
  "recommendations": ["string — concrete actionable advice"],
  "suggested_rules": [
    {
      "type": "continuous_usage|daily_limit|video_watch_time|late_night",
      "conditions": {},
      "action": "warning|soft_block",
      "title": "string (Vietnamese, ≤ 50 chars)",
      "message": "string (Vietnamese, ≤ 200 chars)",
      "rationale": "string (why this rule is recommended based on the user's data)"
    }
  ]
}

Return 1–3 suggested_rules maximum. Return empty array if usage is healthy.
PROMPT;
    }

    public function wellnessAnalysisUser(array $stats): string
    {
        $period         = $stats['period']            ?? 'week';
        $totalHours     = round(($stats['total_seconds'] ?? 0) / 3600, 1);
        $videoHours     = round(($stats['video_seconds'] ?? 0) / 3600, 1);
        $avgDailyMins   = round(($stats['avg_daily_seconds'] ?? 0) / 60, 0);
        $sessions       = $stats['sessions_count']    ?? 0;
        $comments       = $stats['comments_count']    ?? 0;
        $posts          = $stats['posts_count']       ?? 0;
        $likes          = $stats['likes_count']       ?? 0;
        $peakHour       = $stats['peak_hour'] !== null ? "{$stats['peak_hour']}h" : 'unknown';

        return <<<PROMPT
Analyze this user's social media usage for the past {$period}:

Total usage: {$totalHours} hours
Video watch time: {$videoHours} hours
Sessions: {$sessions}
Average daily usage: {$avgDailyMins} minutes
Peak activity hour: {$peakHour}
Comments posted: {$comments}
Posts uploaded: {$posts}
Likes given: {$likes}

Provide a wellness analysis with specific, data-driven insights. Suggest rules only if there are clear patterns worth addressing.
Return ONLY valid JSON.
PROMPT;
    }
}
