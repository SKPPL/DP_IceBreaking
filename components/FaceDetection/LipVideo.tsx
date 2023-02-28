import { useCallback, useEffect, useMemo, useRef } from "react";
import { getHostLip } from "./FaceLandMarkMy";
import { getGuestLip } from "./FaceLandMarkPeer";
interface segmentData {
    auth: boolean;
}
export default function LipVideo({ auth }: segmentData) {
    var videoId = auth ? 'peerface' : 'myface';
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var requestID = useRef<number>(0);
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
    const xyr = useRef([320, 240, 50])
    const video = document.getElementById(videoId) as HTMLVideoElement;
    const draw = useCallback(() => {
        if (!unmountCheck) {
            var tempXYR = auth ? getGuestLip() : getHostLip();
            if (tempXYR) {
                xyr.current = tempXYR;
            }
            //장축과 단축
            var lr = Math.floor(xyr.current[2] * 1.5);
            var sr = Math.floor(xyr.current[2]);
            ctx!.drawImage(video, xyr.current[0] - lr, xyr.current[1] - sr, 2 * lr, 2 * sr, 0, 0, 640, 480);
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
            <canvas id={`${auth ? 'my_lip' : 'peer_lip'}`} width="640" height="480" ref={cloneRef} ></canvas>
        </>
    )

}