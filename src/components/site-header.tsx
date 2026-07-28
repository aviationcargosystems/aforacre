"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// Explore is the only nav item. The quiz is not a destination a buyer picks
// off a menu, it is what happens when they say they want to explore land.
const navLinks = [{ href: "/explore", label: "Explore" }];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 18);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-[1.75rem] border border-white/70 bg-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all",
          scrolled && "border-white/80 bg-white/80 shadow-[0_18px_65px_rgba(15,23,42,0.12)]"
        )}
      >
        <div className="flex h-18 items-center gap-4 px-4 sm:px-6 lg:h-20">
          <Link href="/" className="flex items-center text-primary" aria-label="A for Acre home">
            <div className="relative h-12 w-[144px] sm:h-14 sm:w-[168px]">
              <Image
                src="/brand/logo.png"
                alt="A for Acre"
                fill
                priority
                sizes="(max-width: 640px) 144px, 168px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-1">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/70",
                        "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
              <Link href="/submit-land">List your land</Link>
            </Button>
            <Button asChild variant="pill" size="sm">
              <Link href="/match">Explore land</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="ml-auto lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border/70 bg-background/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-left font-heading text-lg text-primary">
                  <div className="relative h-7 w-7 shrink-0">
                    <Image src="/brand/icon.png" alt="A for Acre icon" fill sizes="28px" className="object-contain" />
                  </div>
                  A for Acre
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8">
                <p className="mt-2 text-sm text-muted-foreground">
                  Verified farmland in South Bangalore, matched to how you will actually use it.
                </p>
                <nav className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/70"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 grid gap-2">
                  <Button asChild variant="pill" size="sm" className="w-full">
                    <Link href="/match" onClick={() => setOpen(false)}>
                      Explore land
                    </Link>
                  </Button>
                  <Button asChild variant="pill-outline" size="sm" className="w-full">
                    <Link href="/submit-land" onClick={() => setOpen(false)}>
                      List your land
                    </Link>
                  </Button>
                </div>
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/35">
                  <Image
                    src="/brand/logo.png"
                    alt="A for Acre"
                    width={520}
                    height={180}
                    className="h-auto w-full p-4"
                    priority
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
