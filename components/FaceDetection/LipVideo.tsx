import { useCallback, useEffect, useMemo, useRef } from "react";
import { isMacOs, isChrome } from 'react-device-detect';
interface segmentData {
    auth: boolean;
}


export default function LipVideo({ auth }: segmentData) {
    var videoId = auth ? 'peer_lip' : 'my_lip';
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var requestID = useRef<number>(0);
    var ctx: CanvasRenderingContext2D | null = null;
    var unmountCheck = false;
    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return
        if (isMacOs && isChrome) {
            ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
        }
        else {
            ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true });
        }
        return () => {
            unmountCheck = true;
        }
    }, [cloneRef])
    const video = document.getElementById(videoId) as HTMLCanvasElement;
    const draw = useCallback(() => {
        if (!unmountCheck) {
            ctx!.drawImage(video, 0, 0, 213, 160, 0, 0, 213, 160);
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
            <canvas id={`${auth ? 'my_lip_copy' : 'peer_lip_copy'}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    )

}