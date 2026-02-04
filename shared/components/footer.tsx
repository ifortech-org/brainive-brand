"use client";

import Link from "next/link";
import LogoDynamic from "@/shared/components/logo-dynamic";
import { usePathname } from "next/navigation";

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

export default function Footer() {
  const pathname = usePathname();
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

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer>
      <div className="dark:bg-background p-5 xl:p-5 dark:text-gray-300">
        <Link
          className="block w-[6.25rem] mx-auto"
          href={addLangPrefix("/")}
          aria-label="Home page">
          <LogoDynamic />
        </Link>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-7 text-primary">
          {navItems.map((navItem) => (
            <Link
              key={navItem.label}
              href={navItem.href}
              target={navItem.target ? "_blank" : undefined}
              rel={navItem.target ? "noopener noreferrer" : undefined}
              className="transition-colors hover:text-foreground/80 text-foreground/60 text-sm">
              {navItem.label}
            </Link>
          ))}
        </div>
        {/* Modifica veloce rimosso lg:flex-row. se serve si sistema più avanti */}
        {/* <div className="mt-8 flex flex-col lg:flex-row gap-6 justify-center text-center lg:mt-5 text-xs border-t pt-8"> */}
        <div className="mt-8 flex flex-col gap-4 justify-center text-center lg:mt-5 text-xs border-t pt-8">
          <p className="text-xs font-thin">
            {isEnglish
              ? "Brainive is a brand of iFortech srl"
              : "Brainive è un marchio di iFortech srl"}
          </p>
          <p className="text-xs font-thin">
            {isEnglish
              ? "Share capital € 40,000.00 fully paid - VAT & Tax ID: 07927140967 - REA: MI-1991600"
              : "CAP. SOC. € 40.000,00 I.V. - P.IVA E CF: 07927140967 - REA: MI-1991600"}
          </p>
          <p className="text-xs font-thin">
            {isEnglish
              ? "Registered office: Via Pordenone 35 - Cologno Monzese - 20093 (MI)"
              : "SEDE LEGALE: VIA PORDENONE 35 - COLOGNO MONZESE - 20093 (MI)"}
          </p>
          <p className="text-foreground/60">
            &copy; {getCurrentYear()}&nbsp;iFortech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
