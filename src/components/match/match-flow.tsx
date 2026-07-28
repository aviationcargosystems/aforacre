"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Circle, RotateCcw, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  QUIZ_QUESTIONS,
  THINKING_FADE_MS,
  THINKING_LINES,
  THINKING_MIN_MS,
  type QuizAnswers,
} from "@/lib/quiz-questions";
import { computePersona } from "@/lib/persona";
import { computeMatches, type MatchablePlot } from "@/lib/match";
import { saveQuizResult } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/match/match-card";

const STORAGE_KEY = "aforacre.match.v1";

type Stage = "questions" | "thinking" | "results";

export function MatchFlow({ plots }: { plots: MatchablePlot[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [stage, setStage] = useState<Stage>("questions");
  const [line, setLine] = useState(0);
  const [restored, setRestored] = useState(false);

  // Answers survive a reload or a dropped connection. Seven questions is enough
  // that losing them halfway would mean most people simply do not finish.
  //
  // This is the case the set-state-in-effect rule exists to allow: reading
  // initial state out of an external system. It cannot be a lazy useState
  // initialiser because localStorage does not exist during the server render,
  // and reading it on the client's first render would desync hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { answers?: QuizAnswers; step?: number };
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.step === "number") setStep(Math.min(parsed.step, QUIZ_QUESTIONS.length - 1));
      }
    } catch {
      // A corrupt entry is not worth surfacing. Starting fresh is the fix.
    }
    setRestored(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, restored]);

  const question = QUIZ_QUESTIONS[step];
  const selected = answers[question?.id] ?? [];
  const canAdvance = selected.length > 0;

  const persona = useMemo(() => computePersona(answers), [answers]);
  const matches = useMemo(
    () => (stage === "results" ? computeMatches(plots, answers, persona) : []),
    [stage, plots, answers, persona]
  );

  function toggle(value: string) {
    const current = answers[question.id] ?? [];
    let next: string[];

    if (!question.multi) {
      next = [value];
    } else if (current.includes(value)) {
      next = current.filter((entry) => entry !== value);
    } else if (question.maxChoices && current.length >= question.maxChoices) {
      // Drop the oldest rather than refusing the tap. Silently ignoring a tap
      // reads as a broken button.
      next = [...current.slice(1), value];
    } else {
      next = [...current, value];
    }

    setAnswers((previous) => ({ ...previous, [question.id]: next }));

    // Single-choice questions advance on their own. Making someone tap an
    // answer then tap Next is one tap too many on a phone.
    if (!question.multi && step < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setStep((current) => current + 1), 180);
    }
  }

  function finish() {
    setStage("thinking");
    setLine(0);
  }

  // The thinking beat is a real minimum, not a fake delay bolted onto an
  // instant answer: scoring is synchronous, so without it the screen would
  // flash past before anyone could read what we checked.
  useEffect(() => {
    if (stage !== "thinking") return;

    const perLine = Math.max(THINKING_FADE_MS, Math.floor(THINKING_MIN_MS / THINKING_LINES.length));
    const ticker = setInterval(() => setLine((current) => Math.min(current + 1, THINKING_LINES.length - 1)), perLine);
    const done = setTimeout(() => setStage("results"), THINKING_MIN_MS);

    return () => {
      clearInterval(ticker);
      clearTimeout(done);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "results" || matches.length === 0) return;
    const sessionId = ensureSessionId();
    void saveQuizResult({
      sessionId,
      answers,
      personaKey: persona.key,
      matches: matches.map((match) => ({
        plotId: match.plot.id,
        score: match.score,
        reasons: match.reasons.map((reason) => reason.label),
      })),
    });
  }, [stage, matches, answers, persona]);

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setStep(0);
    setStage("questions");
  }

  if (stage === "thinking") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-14 w-14 animate-pulse rounded-full bg-primary/15" />
        <p
          key={line}
          className="mt-8 font-heading text-2xl font-semibold text-foreground"
          style={{ animation: `fade-in ${THINKING_FADE_MS}ms ease-out` }}
        >
          {THINKING_LINES[line]}
        </p>
        <div className="mt-6 flex gap-1.5">
          {THINKING_LINES.map((entry, index) => (
            <span
              key={entry}
              className={`h-1.5 w-8 rounded-full transition-colors ${index <= line ? "bg-primary" : "bg-primary/20"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-end">
          <Link
            href="/"
            aria-label="Leave the quiz"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">You are</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {persona.title}
          </h1>
          <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">{persona.description}</p>
          <p className="mt-6 font-heading text-xl font-semibold text-foreground">
            {matches.length > 0
              ? `We found ${matches.length} ${matches.length === 1 ? "farm" : "farms"} you will love.`
              : "We do not have a match on the ground right now."}
          </p>
        </div>

        {matches.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.plot.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-[1.5rem] border border-border/70 bg-white/70 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Leave your number and we will call you the moment something fits.
            </p>
            <Button asChild variant="pill" size="pill" className="mt-4">
              <Link href="/explore">Browse everything we have</Link>
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Start again
          </button>
        </div>
      </div>
    );
  }

  const progress = ((step + (canAdvance ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="relative isolate min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(197,106,74,0.16),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(31,58,46,0.16),transparent_45%)]" />

      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            aria-label="Previous question"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {step + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <Link
            href="/"
            aria-label="Leave the quiz"
            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {question.prompt}
          </h1>
          {question.helper && <p className="mt-2 text-sm text-muted-foreground">{question.helper}</p>}

          {/* Two up on anything wider than a phone. A single stacked column of
              nine options pushed the last few below the fold on every screen. */}
          <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {question.options.map((option) => {
              const active = selected.includes(option.value);
              const Icon = optionIcon(option.icon);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  aria-pressed={active}
                  className={`group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-base transition-all duration-200 ${
                    active
                      ? "border-primary/70 bg-primary/[0.08] font-medium text-foreground shadow-[0_10px_28px_rgba(31,58,46,0.10)]"
                      : "border-border/70 bg-white/70 text-foreground/80 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-primary"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{option.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-transparent pb-4 pt-2">
          <Button
            type="button"
            variant="pill"
            size="pill"
            className="w-full"
            disabled={!canAdvance}
            onClick={() => (step === QUIZ_QUESTIONS.length - 1 ? finish() : setStep((current) => current + 1))}
          >
            {step === QUIZ_QUESTIONS.length - 1 ? "See my matches" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Resolves the icon name stored on a question option.
 *
 * The question data holds a name rather than a component so it stays free of
 * React imports and a WhatsApp or voice flow can ignore it entirely. Falls back
 * to a plain circle rather than crashing if a name is ever misspelled.
 */
function optionIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? Circle;
}

/** Stable per browser, so a returning visitor's quizzes can be tied together. */
function ensureSessionId(): string {
  const key = "aforacre.session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
