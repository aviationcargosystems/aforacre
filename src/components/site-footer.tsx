import Link from "next/link";
import { journeys } from "@/data/journeys";
import { NewsletterForm } from "@/components/newsletter-form";

// lucide-react no longer ships brand/social glyphs — simple text monograms instead, in the same style as the rest of the footer's decorative row.
const socialMonograms = ["f", "IG", "yt", "in"];

export function SiteFooter() {
  return (
    <footer className="bg-deep-green text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="text-white">
              <span className="font-heading text-xl font-semibold">A for Acre</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              South Bangalore&apos;s trusted farmland marketplace. Find, evaluate, and own land with confidence.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socialMonograms.map((mark) => (
                <span
                  key={mark}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80"
                >
                  {mark}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/explore" className="text-sm text-white/70 hover:text-white">Explore land</Link></li>
              {journeys.slice(0, 2).map((journey) => (
                <li key={journey.id}>
                  <Link href={`/journeys/${journey.id}`} className="text-sm text-white/70 hover:text-white">
                    {journey.shortTitle}
                  </Link>
                </li>
              ))}
              <li><Link href="/professionals" className="text-sm text-white/70 hover:text-white">Professionals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li>How it works</li>
              <li>Legal &amp; taxes</li>
              <li>FAQs</li>
              <li>Contact us</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Subscribe</h3>
            <p className="mt-3 text-sm text-white/70">Get land updates and insights straight to your inbox.</p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} A for Acre. All property and tax details are illustrative — verify before transacting.</p>
          <p>Kanakapura Road · Sarjapur Road · Anekal · Bannerghatta Road</p>
        </div>
      </div>
    </footer>
  );
}
