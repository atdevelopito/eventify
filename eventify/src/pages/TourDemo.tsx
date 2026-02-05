"use client";

import { TourPopover } from "@/components/ui/tour-popover";

function TourDemo() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center space-y-8">
                <h1 className="text-3xl font-bold">Tour Component Demo</h1>
                <TourPopover />
            </div>
        </div>
    );
}

export default TourDemo;
