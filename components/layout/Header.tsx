"use client";

import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-neutral-border bg-neutral-50">
      <Link href="/" className="text-lg font-semibold text-default-font hover:text-brand-600 transition-colors">
        Lunette
      </Link>
      <UserMenu />
    </header>
  );
}
