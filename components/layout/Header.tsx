"use client";

import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-neutral-border bg-neutral-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold text-default-font hover:text-brand-600 transition-colors">
          Lunette
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/browse"
            className="text-sm text-subtext-color hover:text-default-font transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/gallery"
            className="text-sm text-subtext-color hover:text-default-font transition-colors"
          >
            My Patterns
          </Link>
          <Link
            href="/editor/new"
            className="text-sm text-subtext-color hover:text-default-font transition-colors"
          >
            Create
          </Link>
        </nav>
      </div>
      <UserMenu />
    </header>
  );
}
