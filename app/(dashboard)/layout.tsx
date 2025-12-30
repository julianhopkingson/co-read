import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-accent/30">
            <main className="pb-20 pt-4 px-4 max-w-2xl mx-auto">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
