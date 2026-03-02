"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-600">
          Something went wrong!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>

        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-4">
          <Button variant="default" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
