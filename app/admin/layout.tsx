export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-accent/30">
            <main className="pb-20 pt-4 px-4">
                {children}
            </main>
        </div>
    );
}
