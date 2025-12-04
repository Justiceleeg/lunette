"use client";

import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-default-background flex items-center justify-center">
        <div className="text-subtext-color">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-default-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-subtext-color mb-4">Please sign in to access settings</p>
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-background">
      <div className="max-w-2xl mx-auto p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-subtext-color hover:text-default-font mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to editor
        </Link>

        <h1 className="text-2xl font-semibold text-default-font mb-8">Settings</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium text-default-font mb-4">Account</h2>
            <div className="bg-neutral-50 rounded p-4 space-y-4">
              <div className="flex items-center gap-4">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    width={64}
                    height={64}
                    className="size-16 rounded-full"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-medium">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="text-default-font font-medium">{session.user.name || "User"}</p>
                  <p className="text-subtext-color text-sm">{session.user.email}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
