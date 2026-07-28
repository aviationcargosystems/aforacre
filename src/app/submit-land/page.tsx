import { LandSubmissionForm } from "@/components/land-submission-form";

export const metadata = {
  title: "Submit Land — A for Acre",
  description: "List your farmland with A for Acre. Our team reviews every submission before it goes live.",
};

export default function SubmitLandPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">List your land</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Submit your land
      </h1>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Tell us about the plot — our team reviews every submission, verifies the details, and gets it live once
        approved.
      </p>
      <div className="mt-8">
        <LandSubmissionForm />
      </div>
    </div>
  );
}
