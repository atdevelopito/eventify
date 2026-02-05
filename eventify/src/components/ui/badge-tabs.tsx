"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface BadgeTabItem {
    value: string;
    label: string;
    badge?: number;
    content?: React.ReactNode;
}

interface BadgeTabsProps {
    items?: BadgeTabItem[];
    defaultValue?: string;
    className?: string;
}

export default function BadgeTabs({
    items,
    defaultValue,
    className,
}: BadgeTabsProps) {
    // Safe default value handling
    const initialValue = defaultValue || (items && items.length > 0 ? items[0].value : "");
    const [active, setActive] = React.useState(initialValue);

    // Guard clause if no items provided
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className={cn("flex flex-col items-center justify-center w-full", className)}>
            <Tabs value={active} onValueChange={setActive} className="w-full">
                {/* Tabs */}
                <TabsList className="relative flex w-full max-w-lg mx-auto gap-2 bg-background/30 p-2 rounded-xl border mb-8">
                    {items.map((item) => {
                        const isActive = item.value === active;
                        return (
                            <TabsTrigger
                                key={item.value}
                                value={item.value}
                                asChild
                                className="data-[state=active]:bg-transparent"
                            >
                                <motion.button
                                    className={cn(
                                        "relative flex-1 flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none bg-transparent",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Active background pill - only if active */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-primary/10 rounded-lg z-0"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        />
                                    )}

                                    <span className="relative z-10 font-bold">{item.label}</span>

                                    {/* Badge */}
                                    <AnimatePresence mode="popLayout">
                                        {item.badge !== undefined && (
                                            <motion.span
                                                key={`${item.value}-badge`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className={cn(
                                                    "ml-2 relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                                                    isActive ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
                                                )}
                                            >
                                                {item.badge}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* Tab Content */}
                <div className="w-full">
                    {items.map((item) => (
                        <TabsContent key={item.value} value={item.value} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            {/* Content is rendered here but container styling is up to usage */}
                            {item.content}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
