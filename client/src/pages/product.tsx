// src/components/profile/password.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {CustomerAnalyticsOverview} from '@/lib/types'

export default function Product() {
 const { data: analytics, isLoading, error } = useQuery<CustomerAnalyticsOverview>({
    queryKey: ["/api/customers/analytics/overview"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error || !analytics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 `}>
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No product data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full ">
      <CardContent>
      </CardContent>
    </Card>
  );
}
