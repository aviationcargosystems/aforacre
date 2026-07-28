"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, RotateCcw } from "lucide-react";
import type { Property } from "@/lib/types";
import { QUIZ_QUESTIONS, computeMatches, type QuizAnswers } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryForm } from "@/components/enquiry-form";

/** Below this score, we treat the "match" as too weak to lean on — surface the fallback enquiry instead of pretending it's a confident pick. */
const WEAK_MATCH_THRESHOLD = 45;

const EMPTY_ANSWERS: QuizAnswers = { goals: [], involvement: [], scenery: [], budget: [] };

const THINKING_MESSAGES = [
  "We're analysing your preferences…",
  "We're matching your lifestyle…",
  "We're checking available farms…",
];

export function MatchQuiz({ properties }: { properties: Property[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [phase, setPhase] = useState<"quiz" | "thinking" | "results">("quiz");
  const [thinkingIndex, setThinkingIndex] = useState(0);

  const currentQuestion = QUIZ_QUESTIONS[step];
  const selectedForCurrent = answers[currentQuestion.id];
  const canProceed = selectedForCurrent.length > 0;
  const isLastQuestion = step === QUIZ_QUESTIONS.length - 1;

  useEffect(() => {
    if (phase !== "thinking") return;
    if (thinkingIndex >= THINKING_MESSAGES.length - 1) {
      const timeout = setTimeout(() => setPhase("results"), 500);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setThinkingIndex((i) => i + 1), 500);
    return () => clearTimeout(timeout);
  }, [phase, thinkingIndex]);

  const matches = useMemo(() => (phase === "results" ? computeMatches(properties, answers) : []), [phase, properties, answers]);

  function toggleOption(value: string) {
    setAnswers((prev) => {
      const current = prev[currentQuestion.id];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [currentQuestion.id]: next };
    });
  }

  function handleNext() {
    if (isLastQuestion) {
      setPhase("thinking");
      setThinkingIndex(0);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleRestart() {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setPhase("quiz");
    setThinkingIndex(0);
  }

  if (phase === "thinking") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-accent">AFORACRE thinks</p>
        <p className="mt-2 font-heading text-xl font-semibold text-foreground">{THINKING_MESSAGES[thinkingIndex]}</p>
      </div>
    );
  }

  if (phase === "results") {
    const topMatch = matches[0];
    const isWeak = !topMatch || topMatch.score < WEAK_MATCH_THRESHOLD;

    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="Your matches"
            title="Land picked for your life."
            subtitle="Based on your answers — ranked by fit, not just by budget."
          />
          <Button variant="pill-outline" size="pill" onClick={handleRestart}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Retake the quiz
          </Button>
        </div>

        {isWeak && (
          <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-white/70 p-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {matches.length === 0 ? "We couldn't find a strong match yet." : "Nothing here felt like a strong fit."}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop your number and name — our team will personally help you find the right land.
            </p>
            <div className="mt-4 max-w-md">
              <EnquiryForm context="quiz" ctaLabel="Share details" compact />
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map(({ property, score }) => (
              <PropertyCard key={property.slug} property={property} highlightLabel={`${score}% Match`} />
            ))}
          </div>
        )}

        {topMatch && (
          <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-white/70 p-6">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Schedule a visit</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Want to see {topMatch.property.title} in person? Leave your number and we&apos;ll set up a visit.
            </p>
            <div className="mt-4 max-w-md">
              <EnquiryForm context="schedule-visit" propertySlug={topMatch.property.slug} ctaLabel="Schedule a visit" compact />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Question {step + 1} of {QUIZ_QUESTIONS.length}
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {currentQuestion.question}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose as many as apply.</p>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {currentQuestion.options.map((option) => {
          const selected = selectedForCurrent.includes(option.value);
          return (
            <Button
              key={option.value}
              type="button"
              variant={selected ? "pill" : "pill-outline"}
              size="pill"
              onClick={() => toggleOption(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={step === 0} className="rounded-full">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button variant="pill" size="pill" onClick={handleNext} disabled={!canProceed}>
          {isLastQuestion ? "See my matches" : "Next"} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
