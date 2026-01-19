"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center mb-4 gap-2">
            <AlertCircle className="h-9 w-9 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-600">
           We can’t seem to find the page you are looking for!
          </p>

          {/* 👇 Go Home Button */}
          <div className="mt-6">
            <Button
              onClick={() => setLocation("/home")}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
