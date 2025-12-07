import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-6xl font-bold text-brand-600">404</p>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-subtext-color">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" asChild>
            <a href="/browse">
              <Search className="w-4 h-4 mr-2" />
              Browse patterns
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
