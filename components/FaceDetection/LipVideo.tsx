import { useCallback, useEffect, useMemo, useRef } from "react";
import { isMacOs, isChrome } from 'react-device-detect';
interface segmentData {
    auth: boolean;
}


export default function LipVideo({ auth }: segmentData) {
    const videoId = auth ? 'peer_lip' : 'my_lip';
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

    const video = document.getElementById(videoId) as HTMLCanvasElement;

    const draw = useCallback(() => {
        ctx!.drawImage(video, 0, 0, 213, 160, 0, 0, 213, 160);
        requestID.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
    }, [video]);


    return (
        <>
            <canvas id={`${auth ? 'my_lip_copy' : 'peer_lip_copy'}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    );

}