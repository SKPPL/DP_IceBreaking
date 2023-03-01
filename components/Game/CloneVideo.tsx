import { useCallback, useEffect, useRef } from "react";
import { isMacOs, isChrome } from 'react-device-detect';
interface segmentData {
    auth: boolean;
    id: number;
    videoId: string;
    segmentState: string | undefined;
}
export default function CloneVideo({ id, auth, videoId, segmentState }: segmentData) {
    const cloneRef = useRef<HTMLCanvasElement>(null);
    const requestID = useRef<number>(0);
    var ctx: CanvasRenderingContext2D | null = null;

    useEffect(() => {
        if (!cloneRef.current) return;
        if (isMacOs && isChrome) {
            ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
        }
        else {
            ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true });
        }
        return () => {
            cancelAnimationFrame(requestID.current);
        };
    }, [cloneRef]);

    const video = document.getElementById(videoId) as HTMLVideoElement;

    const draw = useCallback(() => {
        ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 213, 160);
        requestID.current = requestAnimationFrame(draw);
    }, [video]);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
    }, [video]);


    return (
        <>
            <canvas id={`${auth ? 'my' : 'peer'}_${id}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    );

}