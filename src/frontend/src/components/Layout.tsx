import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Home,
  Menu,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProfile } from "@/hooks/useProfile";
import { useRewards } from "@/hooks/useQueries";
import { formatPoints } from "@/lib/format";
import { createTranslator, normalizeLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  labelKey: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/matieres", labelKey: "nav.subjects", icon: BookOpen },
  { to: "/revisions", labelKey: "nav.revisions", icon: Sparkles },
  { to: "/progression", labelKey: "nav.progress", icon: TrendingUp },
  { to: "/profil", labelKey: "nav.profile", icon: User },
];

function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function PointsPill({ title }: { title: string }) {
  const { data: rewards } = useRewards();
  const points = rewards?.points ?? 0n;
  return (
    <span
      data-ocid="header.points_pill"
      className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 font-mono text-sm font-bold text-accent-foreground"
      title={title}
    >
      <Sparkles className="size-4 text-accent" aria-hidden="true" />
      {formatPoints(points)}
    </span>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: profile } = useProfile();
  const t = createTranslator(normalizeLanguage(profile?.language));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/"
            data-ocid="header.brand_link"
            className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-lg font-extrabold tracking-tight text-foreground">
                SMART STUDY
              </span>
              <span className="hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
                {t("home.slogan")}
              </span>
            </span>
          </Link>

          <nav
            aria-label={t("nav.main")}
            className="ml-4 hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.to);
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={`nav.${item.labelKey.split(".")[1]}.link`}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <PointsPill title={t("header.points")} />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("nav.openMenu")}
                  data-ocid="header.menu_button"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl font-extrabold">
                    SMART STUDY
                  </SheetTitle>
                </SheetHeader>
                <nav
                  aria-label={t("nav.mobile")}
                  className="mt-4 flex flex-col gap-1 px-4"
                >
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(pathname, item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        data-ocid={`mobile_nav.${item.labelKey.split(".")[1]}.link`}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition-smooth",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </nav>
                {profile && (
                  <p className="mt-6 px-4 text-sm text-muted-foreground">
                    {t("home.level")} {profile.level} · {profile.country}
                  </p>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <p className="font-display text-base font-bold text-foreground">
            {t("home.slogan")}
          </p>
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>

      <nav
        aria-label={t("nav.quick")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  data-ocid={`bottom_nav.${item.labelKey.split(".")[1]}.link`}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-5", active && "text-primary")}
                    aria-hidden="true"
                  />
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
