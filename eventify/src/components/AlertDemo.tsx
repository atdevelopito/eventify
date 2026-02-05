import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Radio, X } from "lucide-react"

export default function AlertDemo() {
    return (
        <div className="p-10 flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-4">Alert Component Demo</h2>

            <Alert
                className="min-w-[400px]"
                layout="row"
                isNotification
                size="lg"
                action={
                    <Button
                        variant="ghost"
                        className="group -my-1.5 -me-2 size-8 p-0 hover:bg-transparent"
                        aria-label="Close notification"
                    >
                        <X
                            size={16}
                            strokeWidth={2}
                            className="opacity-60 transition-opacity group-hover:opacity-100"
                        />
                    </Button>
                }
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                        aria-hidden="true"
                    >
                        <Radio className="opacity-60" size={16} strokeWidth={2} />
                    </div>
                    <div className="flex grow items-center justify-between gap-12">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Live in 27 hours</p>
                            <p className="text-xs text-muted-foreground">November 20 at 8:00 PM.</p>
                        </div>
                        <Button size="sm">Notify me</Button>
                    </div>
                </div>
            </Alert>
        </div>
    )
}
