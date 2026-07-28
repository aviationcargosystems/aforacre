"use server";

import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import type { QuizAnswers } from "@/lib/quiz-questions";

/**
 * Persists a completed quiz.
 *
 * Buyers take the quiz anonymously against a session id and can claim it later
 * by verifying their mobile, so buyer_id is attached only when there is a real
 * signed-in user. Uses the service role because an anonymous visitor has no
 * session to write through.
 *
 * Never throws into the UI: a failure to record analytics must not cost the
 * buyer their results.
 */
export async function saveQuizResult(input: {
  sessionId: string;
  answers: QuizAnswers;
  personaKey: string;
  matches: { plotId: string; score: number; reasons: string[] }[];
}): Promise<{ ok: boolean }> {
  try {
    const profile = await getSessionProfile();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("quiz_responses")
      .insert({
        buyer_id: profile?.id ?? null,
        session_id: input.sessionId,
        answers: input.answers,
        persona_key: input.personaKey,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      if (isMissingSchemaError(error)) return { ok: false };
      throw error;
    }
    if (!data) return { ok: false };

    // Matches point at plots.id. While the match flow is still reading legacy
    // properties, those ids are slugs and no plots row exists to reference, so
    // the insert is skipped rather than failing the whole save.
    const rows = input.matches
      .filter((match) => /^[0-9a-f-]{36}$/i.test(match.plotId))
      .map((match) => ({
        quiz_response_id: data.id as string,
        plot_id: match.plotId,
        score: match.score,
        reasons: match.reasons,
      }));

    if (rows.length > 0) {
      await supabase.from("matches").insert(rows);
    }

    return { ok: true };
  } catch {
    return { ok: false };
  }
}
