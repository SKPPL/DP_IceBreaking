import { useCallback, useEffect, useRef } from "react";

interface segmentData {
    auth: boolean;
    id: number;
    videoId: string;
    segmentState: string | undefined;
}
export default function CloneVideo({ id, auth, videoId, segmentState }: segmentData) {
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var ctx: CanvasRenderingContext2D | null = null;
    var unmountCheck = false;
    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return
        ctx = cloneRef.current.getContext('2d');
        return () => {
            unmountCheck = true;
        }
    }, [cloneRef])

    const video = document.getElementById(videoId) as HTMLVideoElement;
    const draw = useCallback(() => {
        if (!unmountCheck) {
            ctx!.drawImage(video, 640 / 3 * (id % 3), 160 * ((id - id % 3) / 3), 640 / 3, 160, 0, 0, 640, 480);
            setTimeout(draw, 16.666);
        }

    }, [video]);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        draw();
    }, [video])


    return (
        <>
            <canvas id={`${auth ? 'my' : 'peer'}_${id}`} width="640" height="480" ref={cloneRef} ></canvas>
        </>
    )

}