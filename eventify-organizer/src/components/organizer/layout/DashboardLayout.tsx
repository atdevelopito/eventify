import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { OrganizerBottomNav } from "./OrganizerBottomNav";
import { OrganizerNavbar } from "./OrganizerNavbar";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile

    return (
        <div className="flex min-h-screen w-full bg-background relative pb-20 md:pb-0 pt-16 md:pt-0">
            <div className="md:hidden">
                <OrganizerNavbar />
            </div>

            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <motion.main
                className="flex-1 p-4 md:p-8 overflow-auto w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Spacer for mobile navbar (since it's fixed/absolute usually? No, OrganizerNavbar is usually fixed) */}
                {/* If OrganizerNavbar is fixed 16 top, we need spacer. If it's relative, we don't. */}
                {/* OrganizerNavbar is fixed in Step 931. So we need spacer on mobile. */}
                {/* The pt-16 on container handles it. */}
                <Outlet />
            </motion.main>

            <OrganizerBottomNav />
        </div>
    );
}
