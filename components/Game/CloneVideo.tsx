import { useCallback, useEffect, useRef } from "react";

interface segmentData {
    id: number;
    videoId: string;

}
export default function CloneVideo({ id, videoId }: segmentData) {
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var ctx: CanvasRenderingContext2D | null = null;
    useEffect(() => {
        if (!cloneRef.current) return
        ctx = cloneRef.current.getContext('2d');
    }, [cloneRef])

    const video = document.getElementById(videoId) as HTMLVideoElement;

    const draw = useCallback(() => {
        ctx!.drawImage(video, 640 / 3 * (id % 3), 160 * ((id - id % 3) / 3), 640 / 3, 160, 0, 0, 640, 480);
        setTimeout(function () {
            draw();
        }, 30);

    }, [video]);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        draw();
    }, [video])
    return (
        <>
            <canvas id={`${id}`} width="640" height="480" ref={cloneRef}></canvas>
        </>
    )

}