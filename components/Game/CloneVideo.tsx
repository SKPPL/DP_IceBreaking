import { useCallback, useEffect, useRef } from "react";
interface segmentData {
    auth: boolean;
    id: number;
    videoId: string;
    segmentState: string | undefined;
}
export default function CloneVideo({ id, auth, videoId, segmentState }: segmentData) {
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var requestID = useRef<number>(0);
    var ctx: CanvasRenderingContext2D | null = null;
    var unmountCheck = false;
    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return
        ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
        return () => {
            unmountCheck = true;
        }
    }, [cloneRef])

    const video = document.getElementById(videoId) as HTMLVideoElement;


    const draw = useCallback(() => {
        if (!unmountCheck) {
            ctx!.drawImage(video, 640 / 3 * (id % 3), 160 * ((id - id % 3) / 3), 640 / 3, 160, 0, 0, 213, 160);
            requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(requestID.current);
        }

    }, [video]);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
    }, [video])


    return (
        <>
            <canvas id={`${auth ? 'my' : 'peer'}_${id}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    )

}