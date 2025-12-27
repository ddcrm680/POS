"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ServerOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServiceUnavailableOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-8 pb-6 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
              <ServerOff className="h-7 w-7 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            Service Temporarily Unavailable
          </h1>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            We’re experiencing a temporary system issue.
            Our team is already working on it.
            <br />
            Please try again in a moment.
          </p>

          {/* Actions */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Refresh Page
            </Button>
          </div>

          {/* Footer hint */}
          <p className="mt-4 text-xs text-gray-400">
            If the problem persists, contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
