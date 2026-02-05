'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Minus,
    Plus,
} from 'lucide-react';

export default function DrawerDemo() {
    const [goal, setGoal] = React.useState(350);

    function onClick(adjustment: number) {
        setGoal(Math.max(200, Math.min(400, goal + adjustment)));
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Move Goal</DrawerTitle>
                    <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                    <div className="flex items-center justify-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 shrink-0 rounded-full"
                            onClick={() => onClick(-10)}
                            disabled={goal <= 200}
                        >
                            <Minus />
                            <span className="sr-only">Decrease</span>
                        </Button>
                        <div className="flex-1 text-center">
                            <div className="text-7xl font-bold tracking-tighter">{goal}</div>
                            <div className="text-muted-foreground text-[0.70rem] uppercase">
                                Calories/day
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 shrink-0 rounded-full"
                            onClick={() => onClick(10)}
                            disabled={goal >= 400}
                        >
                            <Plus />
                            <span className="sr-only">Increase</span>
                        </Button>
                    </div>
                </DrawerBody>
                <DrawerFooter className="grid-cols-2">
                    <DrawerClose asChild>
                        <Button className="w-full" variant="outline">
                            Cancel
                        </Button>
                    </DrawerClose>
                    <Button className="w-full">Submit</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
