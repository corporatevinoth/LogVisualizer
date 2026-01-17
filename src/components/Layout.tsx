import React from 'react';

interface LayoutProps {
    leftPanel: React.ReactNode;
    centerPanel: React.ReactNode;
    rightPanel: React.ReactNode;
}

export function Layout({ leftPanel, centerPanel, rightPanel }: LayoutProps) {
    return (
        <div className="flex h-screen w-full bg-slate-900 overflow-hidden">
            {/* Left Sidebar - Input */}
            <aside className="w-80 flex-shrink-0 border-r border-slate-700 bg-slate-900/50 backdrop-blur-sm flex flex-col">
                {leftPanel}
            </aside>

            {/* Center - Flow Chart */}
            <main className="flex-1 relative bg-[url('/grid.svg')] bg-repeat bg-center">
                <div className="absolute inset-0 bg-slate-900/80 pointer-events-none" />
                <div className="relative h-full w-full">
                    {centerPanel}
                </div>
            </main>

            {/* Right Sidebar - Dashboard */}
            <aside className="w-80 flex-shrink-0 border-l border-slate-700 bg-slate-900/50 backdrop-blur-sm flex flex-col">
                {rightPanel}
            </aside>
        </div>
    );
}
