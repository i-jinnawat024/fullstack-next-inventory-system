'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { ThemeToggle } from './theme-toggle';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password');
    const currentYear = new Date().getFullYear();

    if (isAuthPage) {
        // For auth pages, render only children without header/footer
        return <>{children}</>;
    }

    // For other pages, render with header and footer
    return (
        <div
            className="flex min-h-screen flex-col"
            style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
            }}
        >
            <AppHeader />

            <main className="w-full flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    {children}
                </div>
            </main>

            <footer
                className="border-t"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                }}
            >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>
                        © {currentYear} Jinnawat Inyim. All rights reserved.
                    </span>
                </div>
            </footer>

            <ThemeToggle />
        </div>
    );
}
