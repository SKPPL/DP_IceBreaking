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
    let dividedVideoWidth = Math.floor(video.videoWidth / 3);
    let dividedVideoHeight = Math.floor(video.videoHeight / 3);

    const draw = useCallback(() => {
        if (video.videoWidth === 640) {
            ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 213, 160);
            cancelAnimationFrame(requestID.current);
            requestID.current = requestAnimationFrame(draw640);
        }
        else {
            dividedVideoWidth = Math.floor(video.videoWidth / 3);
            dividedVideoHeight = Math.floor(video.videoHeight / 3);
            ctx!.drawImage(video, dividedVideoWidth * (id % 3), dividedVideoHeight * ((id - id % 3) / 3), dividedVideoWidth, dividedVideoHeight, 0, 0, 213, 160);
            requestID.current = requestAnimationFrame(draw);
        }
    }, []);

    const draw640 = useCallback(() => {
        ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 213, 160);
        requestID.current = requestAnimationFrame(draw640);
    }, []);


    useEffect(() => {
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
    }, []);


    return (
        <>
            <canvas id={`${auth ? 'my' : 'peer'}_${id}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    );

}