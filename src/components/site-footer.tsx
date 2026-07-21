import Link from "next/link";
import { journeys } from "@/data/journeys";
import { NewsletterForm } from "@/components/newsletter-form";
import { BrandIcon } from "@/components/brand-icon";

const socialMonograms = ["f", "IG", "yt", "in"];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-deep-green text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,106,74,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(87,168,132,0.14),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <Link href="/" className="flex items-center gap-3 text-white">
              <BrandIcon className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  South Bangalore
                </p>
                <span className="font-heading text-2xl font-semibold">A for Acre</span>
              </div>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              A calmer way to explore land. We surface the details that matter, the people who can help, and the
              tradeoffs worth seeing before you ever visit a site.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {socialMonograms.map((mark) => (
                <span
                  key={mark}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white/80"
                >
                  {mark}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Explore</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/explore" className="text-sm text-white/78 hover:text-white">
                    Explore land
                  </Link>
                </li>
                {journeys.slice(0, 3).map((journey) => (
                  <li key={journey.id}>
                    <Link href={`/journeys/${journey.id}`} className="text-sm text-white/78 hover:text-white">
                      {journey.shortTitle}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/professionals" className="text-sm text-white/78 hover:text-white">
                    Professionals
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Stay in touch</h3>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Get new listings, local insight, and useful land updates without the noise.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} A for Acre. Verify property and tax details before transacting.</p>
          <p>Kanakapura Road · Sarjapur Road · Anekal · Bannerghatta Road</p>
        </div>
      </div>
    </footer>
  );
}
