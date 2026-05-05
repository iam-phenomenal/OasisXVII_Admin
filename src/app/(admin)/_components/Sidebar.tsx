"use client";

import { BottleWine, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "space_dashboard" },
  { label: "Products", href: "/products", icon: "category" },
  { label: "Storefront", href: "/storefront", icon: "web" },
  { label: "Checkout Settings", href: "/checkout-settings", icon: "point_of_sale" },
  { label: "Orders", href: "/orders", icon: "package_2" },
];

function isActiveRoute(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-2 pb-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wine-glow/15 ring-1 ring-wine-glow/30">
          <BottleWine
            className="h-[18px] w-[18px] text-wine-glow"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            OasisXVII
          </p>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const icon = (
            <span
              className="material-symbols-outlined text-[18px] leading-none"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          );

          if (!item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/40 cursor-not-allowed"
                aria-disabled="true"
              >
                {icon}
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-wine-glow/10 text-on-surface ring-1 ring-inset ring-wine-glow/20"
                  : "text-muted-foreground hover:bg-surface-low hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] leading-none",
                  active ? "text-wine-glow" : "",
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <form action={logoutAction} className="border-t border-sidebar-border pt-4">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-surface-low hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </Button>
      </form>
    </aside>
  );
}
