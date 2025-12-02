"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ===========================
   Типы
   =========================== */

type SidebarItem = {
  label: string;
  href: string;
  badge?: string;
};

type SuperShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

type SuperPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};

type SuperCardProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
};

type SuperStatTileProps = {
  label: string;
  value: string;
  hint?: string;
};

type SuperSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

/* ===========================
   Shell — фон и общая композиция
   =========================== */

export function SuperShell({ sidebar, children }: SuperShellProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8f8f8] via-[#f1f1f1] to-[#e4e4e4] text-[#111] antialiased">
      <div className="flex">
        {sidebar}
        <main className="flex-1 px-6 lg:px-14 py-10 lg:py-14 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10 lg:space-y-14">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===========================
   Sidebar в стиле Superlist
   =========================== */

type SuperSidebarProps = {
  title?: string;
  subtitle?: string;
  items: SidebarItem[];
  footer?: React.ReactNode;
};

export function SuperSidebar({
  title = "Portal",
  subtitle,
  items,
  footer,
}: SuperSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="
        hidden lg:flex flex-col justify-between
        w-[320px] px-10 py-14
        bg-white/70 backdrop-blur-xl
        border-r border-black/5
        shadow-[inset_-8px_0_35px_rgba(0,0,0,0.04)]
      "
    >
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-black/50 max-w-[220px] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group w-full flex items-center justify-between
                  px-4 py-3 rounded-2xl text-base font-medium
                  transition-all
                  ${
                    active
                      ? "bg-black text-white shadow-xl shadow-black/20"
                      : "text-black/70 hover:text-black hover:bg-black/5"
                  }
                `}
              >
                <span>{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full 
                        ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-black/5 text-black/60"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${
                        active
                          ? "bg-white"
                          : "bg-black/10 group-hover:bg-black/25"
                      }
                    `}
                  />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-black/5 text-sm text-black/55 space-y-3">
        {footer}
        <p className="text-black/35">© {new Date().getFullYear()} MediaWork</p>
      </div>
    </aside>
  );
}

/* ===========================
   Заголовок страницы
   =========================== */

export function SuperPageHeader({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: SuperPageHeaderProps) {
  return (
    <header className="space-y-6 lg:space-y-8">
      <div className="space-y-4">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
          {title}
        </h1>
        {description && (
          <p className="text-base lg:text-lg text-black/60 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </header>
  );
}

/* ===========================
   Кнопки
   =========================== */

type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function SuperPrimaryButton({ children, className = "", ...rest }: ButtonBaseProps) {
  return (
    <button
      {...rest}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-2xl text-sm font-semibold
        bg-black text-white
        shadow-[0_18px_45px_rgba(0,0,0,0.35)]
        hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        active:scale-[0.97]
        transition-all
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function SuperSecondaryButton({
  children,
  className = "",
  ...rest
}: ButtonBaseProps) {
  return (
    <button
      {...rest}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-2xl text-sm font-semibold
        bg-white text-black
        border border-black/10
        hover:bg-black/4
        active:scale-[0.98]
        transition-all
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function SuperGhostButton({
  children,
  className = "",
  ...rest
}: ButtonBaseProps) {
  return (
    <button
      {...rest}
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5 rounded-full text-xs font-medium
        text-black/60 hover:text-black
        hover:bg-black/5
        transition-all
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/* ===========================
   Карточки
   =========================== */

export function SuperCard({
  title,
  description,
  children,
  className = "",
  footer,
}: SuperCardProps) {
  return (
    <section
      className={`
        bg-white rounded-[28px] 
        shadow-[0_24px_70px_rgba(0,0,0,0.08)]
        border border-black/5
        p-7 lg:p-9
        flex flex-col gap-6
        ${className}
      `}
    >
      {(title || description) && (
        <header className="space-y-2">
          {title && (
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-black/60 leading-relaxed">
              {description}
            </p>
          )}
        </header>
      )}

      {children}

      {footer && <footer className="pt-3 border-t border-black/5">{footer}</footer>}
    </section>
  );
}

export function SuperCardTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/4 text-[11px] font-medium text-black/60">
      {children}
    </span>
  );
}

/* ===========================
   Stat Tiles
   =========================== */

export function SuperStatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {children}
    </div>
  );
}

export function SuperStatTile({ label, value, hint }: SuperStatTileProps) {
  return (
    <div
      className="
        bg-white rounded-3xl px-5 py-5
        border border-black/5
        shadow-[0_18px_55px_rgba(0,0,0,0.06)]
        flex flex-col gap-1
      "
    >
      <p className="text-xs font-medium text-black/45 uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-black/50">{hint}</p>}
    </div>
  );
}

/* ===========================
   Section-обёртка
   =========================== */

export function SuperSection({ title, description, children }: SuperSectionProps) {
  return (
    <section className="space-y-6">
      {(title || description) && (
        <header className="space-y-2">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-black/60 max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

/* ===========================
   Декоративные “листики” как у Superlist
   =========================== */

export function SuperFloatingDecor() {
  return (
    <>
      <div className="pointer-events-none fixed -right-10 top-32 opacity-[0.13]">
        <div className="w-[260px] h-[260px] rounded-3xl bg-white shadow-[0_40px_110px_rgba(0,0,0,0.35)] rotate-[10deg]" />
      </div>
      <div className="pointer-events-none fixed left-[-40px] top-[420px] opacity-[0.1]">
        <div className="w-[220px] h-[220px] rounded-2xl bg-white shadow-[0_38px_90px_rgba(0,0,0,0.35)] rotate-[-8deg]" />
      </div>
    </>
  );
}
