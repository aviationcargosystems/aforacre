import Image from "next/image";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

/**
 * The site footer, on every page.
 *
 * Built for the homepage first and then lifted here, replacing the older
 * newsletter footer — two different footers on one site means one of them is
 * wrong, and this is the one that was designed.
 *
 * The stats band is optional. The homepage passes live figures; everywhere else
 * omits it, because a page about one plot has no business restating the size of
 * the catalogue.
 */

export interface FooterStat {
  icon: LucideIcon;
  value: string;
  label: string;
  note: string;
}

/** Every href points at a route that exists. */
const FOOTER_LINKS = [
  {
    title: "Explore",
    links: [
      { label: "All land", href: "/explore" },
      { label: "Find my land", href: "/match" },
      { label: "Growth corridor", href: "/#corridor" },
      { label: "By experience", href: "/#experience" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#journey" },
      { label: "Featured land", href: "/#featured" },
      { label: "Our geography", href: "/#geography" },
      { label: "Admin console", href: "/admin" },
    ],
  },
];

/**
 * Lucide dropped its brand icons, so these are drawn at the same 24px grid and
 * stroke weight as the rest of the set. The handles are placeholders until the
 * real accounts are confirmed.
 */
function InstagramMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/aforacre", icon: InstagramMark },
  { label: "Facebook", href: "https://facebook.com/aforacre", icon: FacebookMark },
];

export function SiteFooter({ stats }: { stats?: FooterStat[] }) {
  const hasStats = Boolean(stats && stats.length > 0);

  return (
    <footer className="border-t border-white/10 bg-[#0b1c15] py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {hasStats && (
          <dl className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats!.map((stat, i) => (
              <div key={stat.label} className={`aa-rise aa-rise-${i} flex items-start gap-4`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-[#e0bd7c]/25">
                  <stat.icon className="h-5 w-5 text-[#e0bd7c]" />
                </span>
                <div className="min-w-0">
                  <dd className="font-heading text-3xl font-semibold leading-none text-[#ede6d5]">
                    {stat.value}
                  </dd>
                  <dt className="mt-1.5 text-sm font-semibold text-[#ede6d5]">{stat.label}</dt>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#ede6d5]/50">{stat.note}</p>
                </div>
              </div>
            ))}
          </dl>
        )}

        {/* Two-up from the smallest screen. Stacked one per row, short link
            lists read as one long undifferentiated column. */}
        <div
          className={`grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))] lg:gap-8 ${
            hasStats ? "mt-12 border-t border-white/10 pt-10" : ""
          }`}
        >
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="relative block h-12 w-[150px]">
              <Image
                src="/brand/logo.png"
                alt="A for Acre"
                fill
                sizes="150px"
                className="object-contain object-left brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#ede6d5]/55">
              Curated farmland around south Bengaluru. Verified on the ground and on paper before it
              reaches you.
            </p>
            {/* Selling is one action, so it is a button rather than a column of
                links. Field capture used to sit here — it is a staff tool and
                has no business in a public footer. */}
            <Link
              href="/submit-land"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ede6d5] px-5 py-2.5 text-xs font-semibold text-[#0e241b] transition-transform hover:-translate-y-0.5"
            >
              List your land <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <p className="font-display-alt text-[11px] font-bold uppercase tracking-[0.16em] text-[#e0bd7c]">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#ede6d5]/65 transition-colors hover:text-[#ede6d5]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The oversized lockup: the last thing on the page, and the one thing
            worth leaving behind. Decorative — the real link is above — so it is
            hidden from assistive tech rather than read out twice. */}
        <div aria-hidden className="mt-14 select-none px-4">
          <div className="relative mx-auto h-[22vw] w-full max-w-[1180px] lg:h-56">
            <Image
              src="/brand/logo.png"
              alt=""
              fill
              sizes="1180px"
              className="object-contain opacity-[0.1] brightness-0 invert"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 border-t border-white/10 pt-7">
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#ede6d5]/70 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/10 hover:text-[#ede6d5]"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="text-[11px] text-[#ede6d5]/45">
            © {new Date().getFullYear()} A for Acre. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#ede6d5]/45">
            Built with <span aria-hidden>❤️</span>
            <span className="sr-only">love</span> at{" "}
            <a
              href="https://bconclub.com"
              target="_blank"
              rel="noreferrer noopener"
              className="font-display-alt font-bold tracking-[0.08em] text-[#e0bd7c] underline-offset-4 transition-colors hover:text-[#f0d49a] hover:underline"
            >
              BCON
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
