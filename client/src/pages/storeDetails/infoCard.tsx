import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="rounded-xl">
            <CardHeader className="pb-2">
                <h3 className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">
                    {title}
                </h3>
            </CardHeader>
            <CardContent className="space-y-2">
                {children}
            </CardContent>
        </Card>
    );
}
