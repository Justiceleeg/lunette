"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-default-font mb-2">
            Lunette
          </h1>
          <p className="text-subtext-color">Learn music through code</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full bg-neutral-100 hover:bg-neutral-200 text-default-font"
            size="lg"
          >
            <Github className="size-5" />
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </Button>
        </div>

        <p className="text-center text-sm text-subtext-color mt-8">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
