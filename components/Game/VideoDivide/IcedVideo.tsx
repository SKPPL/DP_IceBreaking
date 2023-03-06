import { useCallback, useEffect, useRef } from "react";

interface segmentData {
    auth: boolean;
    id: number;
    videoId: string;
    segmentState: string | undefined;
    iceCount: number;
}

const img = new Image();
img.src = "../images/new_ice.png";
img.width = 213;
img.height = 160;


export default function IcedVideo({ iceCount, id, auth, videoId, segmentState }: segmentData) {

    var cloneRef = useRef<HTMLCanvasElement>(null);
    var ctx: CanvasRenderingContext2D | null = null;
    var requestID = useRef<number>(0);
    var unmountCheck = false;
    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return;
        ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true });
        return () => {
            unmountCheck = true;
        };
    }, [cloneRef]);

    const video = document.getElementById(videoId) as HTMLVideoElement;
    let dividedVideoWidth = Math.floor(video.videoWidth / 3);
    let dividedVideoHeight = Math.floor(video.videoHeight / 3);

    const draw = useCallback(() => {
        if (!unmountCheck) {
            if (video.videoWidth === 640) {
                ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 213, 160);
                if (segmentState === 'ice' && iceCount > 0) {
                    ctx!.drawImage(img, 0, 0);
                }
                cancelAnimationFrame(requestID.current);
                requestID.current = requestAnimationFrame(draw640);
            }
            else {
                dividedVideoWidth = Math.floor(video.videoWidth / 3);
                dividedVideoHeight = Math.floor(video.videoHeight / 3);
                ctx!.drawImage(video, dividedVideoWidth * (id % 3), dividedVideoHeight * ((id - id % 3) / 3), dividedVideoWidth, dividedVideoHeight, 0, 0, 213, 160);
                if (segmentState === 'ice' && iceCount > 0) {
                    ctx!.drawImage(img, 0, 0);
                }
                requestID.current = requestAnimationFrame(draw);
            }
        } else {
            cancelAnimationFrame(requestID.current);
        }
    }, []);

    const draw640 = useCallback(() => {
        if (!unmountCheck) {
            ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 213, 160);
            if (segmentState === 'ice' && iceCount > 0) {
                ctx!.drawImage(img, 0, 0);
            }
            requestID.current = requestAnimationFrame(draw640);
        } else {
            cancelAnimationFrame(requestID.current);
        }
    }, []);


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

};