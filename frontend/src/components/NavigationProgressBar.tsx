"use client";

import { use, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgressBar() {
    const pathname = usePathname();
    const [visible , setVisible] = useState(false);
    const [width, setWidth] = useState(0);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];

        setVisible(true);
        setWidth(0);

        timers.current.push(setTimeout(() => setWidth(70), 20));
        timers.current.push(setTimeout(() => setWidth(100), 220));
        timers.current.push(setTimeout(() => setVisible(false), 420));

        return () => timers.current.forEach(clearTimeout);
    }, [pathname]);

    return (
        <div className={"nav-progress" + (visible ? " visible " : "")} aria-hidden="true">
            <div className="nav-progress-bar" style={{ width: width + "%"}}/>
        </div>
    )
}