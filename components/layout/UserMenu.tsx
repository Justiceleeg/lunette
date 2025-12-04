"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="size-8 rounded-full bg-neutral-100 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign in
        </Button>
      </Link>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 focus:ring-offset-default-background">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              width={32}
              height={32}
              className="size-8 rounded-full"
            />
          ) : (
            <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-default-font">
            {session.user.name || "User"}
          </p>
          <p className="text-xs text-subtext-color truncate">
            {session.user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-error-600 focus:text-error-600"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
