"use client";

import Link from "next/link";
import LogoDynamic from "@/shared/components/logo-dynamic";
import MobileNav from "@/shared/components/header/mobile-nav";
import DesktopNav from "@/shared/components/header/desktop-nav";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const navItemsIt = [
  {
    label: "Home",
    href: "/",
    target: false,
  },
  {
    label: "Blog",
    href: "/blog",
    target: false,
  },
  {
    label: "Chi siamo",
    href: "/about",
    target: false,
  },
];

const navItemsEn = [
  {
    label: "Home",
    href: "/",
    target: false,
  },
  {
    label: "Blog",
    href: "/blog",
    target: false,
  },
  {
    label: "About",
    href: "/about",
    target: false,
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEnglish =
    pathname === "/en" || (pathname ? pathname.startsWith("/en/") : false);

  const addLangPrefix = (href: string) => {
    if (!isEnglish) return href;
    return href === "/" ? "/en" : `/en${href}`;
  };

  const navItems = (isEnglish ? navItemsEn : navItemsIt).map((item) => ({
    ...item,
    href: addLangPrefix(item.href),
  }));

  const handleLanguageChange = (language: string) => {
    if (!pathname) return;

    const query = searchParams.toString();
    const appendQuery = (target: string) =>
      query.length > 0 ? `${target}?${query}` : target;

    if (language === "en") {
      if (isEnglish) return;
      const target =
        pathname === "/" ? "/en" : `/en${pathname ?? "/"}`;
      router.push(appendQuery(target));
      return;
    }

    if (!isEnglish) return;
    const target = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    router.push(appendQuery(target));
  };

  return (
    <header className="sticky top-0 w-full border-border/40 bg-background/95 z-50">
      <div className="container flex items-center justify-between h-14">
        <Link
          href={addLangPrefix("/")}
          aria-label="Home page"
          className="flex items-center h-14 min-w-[100px] max-w-[180px] xl:max-w-[220px] overflow-visible">
          <LogoDynamic
            style={{
              maxHeight: 48,
              width: "auto",
              height: "100%",
              objectFit: "contain",
            }}
            className="w-full h-full"
          />
        </Link>
        <div className="hidden xl:flex gap-7 items-center justify-between">
          <DesktopNav navItems={navItems} />
          <label className="sr-only" htmlFor="language-switch-desktop">
            Language
          </label>
          <select
            id="language-switch-desktop"
            value={isEnglish ? "en" : "it"}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground/80">
            <option value="it" className="bg-background text-foreground">IT</option>
            <option value="en" className="bg-background text-foreground">EN</option>
          </select>
        </div>
        <div className="flex items-center gap-3 xl:hidden">
          <label className="sr-only" htmlFor="language-switch-mobile">
            Language
          </label>
          <select
            id="language-switch-mobile"
            value={isEnglish ? "en" : "it"}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground/80">
            <option value="it" className="bg-background text-foreground">IT</option>
            <option value="en" className="bg-background text-foreground">EN</option>
          </select>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
