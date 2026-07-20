"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { journeys } from "@/data/journeys";

const navLinks = [
  { href: "/explore", label: "Explore Land" },
  { href: "/professionals", label: "Professionals" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <BrandIcon className="h-7 w-7 shrink-0" />
          <span className="font-heading text-xl font-semibold">A for Acre</span>
        </Link>

        <NavigationMenu className="hidden md:flex" viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Journeys</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-2">
                  {journeys.map((journey) => (
                    <li key={journey.id}>
                      <NavigationMenuLink asChild>
                        <Link href={`/journeys/${journey.id}`} className="flex flex-col gap-0.5 rounded-md px-3 py-2 hover:bg-secondary">
                          <span className="font-medium text-foreground">{journey.shortTitle}</span>
                          <span className="text-xs text-muted-foreground">{journey.tagline}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link href={link.href} className="px-4 py-2 text-sm font-medium">
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/professionals">For Professionals</Link>
          </Button>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/explore">Explore Land</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-heading text-lg text-primary">
                <BrandIcon className="h-5 w-5 shrink-0" /> A for Acre
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              <p className="mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journeys</p>
              {journeys.map((journey) => (
                <Link
                  key={journey.id}
                  href={`/journeys/${journey.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm hover:bg-secondary"
                >
                  {journey.shortTitle}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
