import { useCallback, useEffect, useMemo, useRef } from "react";
// import { getHostFace } from "./FaceLandMarkMy";
// import { getGuestFace } from "./FaceLandMarkPeer";
interface segmentData {
    auth: boolean;
}
export default function TwirlVideo({ auth }: segmentData) {
    var videoId = auth ? 'peerface_twirl' : 'myface_twirl';
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
    const xyr = useRef([160, 120, 50])
    const video = document.getElementById(videoId) as HTMLCanvasElement; // twirl된 것은 canvas에 그린거라 CanvasElement로 

    const draw = useCallback(() => {

        if (!unmountCheck) {
            var lr = Math.round(xyr.current[2] * 2.25);
            var sr = Math.round(xyr.current[2] * 1.5);
            ctx!.drawImage(video, xyr.current[0] - lr, xyr.current[1] - sr, 2 * lr, 2 * sr, 0, 0, 320, 240);
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
            <canvas id={`${auth ? 'my_twirl' : 'peer_twirl'}`} width="320" height="240" ref={cloneRef} ></canvas>
        </>
    )

}