import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

function StatusFrame({  }) {
    const [frameStatus, setFrameStatus] = useState("Test");

    useEffect(() => {
        const unlisten1 = listen<string>('download_speed', (event) => {
            console.log("event: ", event.payload);
            setFrameStatus(event.payload);
            
        });

        return () => {
            unlisten1.then(f => f());
        };
    }
        , []);
    return (
        <div className="flex items-center justify-center w-full h-full">
            <p className="text-xl text-yellow-400">{frameStatus}</p>
        </div>
    )
}
export default StatusFrame;
