import { useCallback, useEffect, useMemo, useRef } from "react";
import { getHostLip } from "./FaceLandMarkMy";
import { getGuestLip } from "./FaceLandMarkPeer";
import { useSetRecoilState } from 'recoil'
import { myLipState, peerLipState } from "../Game/atom";
import { isMacOs, isChrome } from 'react-device-detect';
interface segmentData {
    auth: boolean;
}
export default function MakeVideoLip({ auth }: segmentData) {
    var videoId = auth ? 'peerface' : 'myface';
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
            auth ? myLipSet(false) : peerLipSet(false)

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
            ctx!.drawImage(video, xyr.current[0] - lr, xyr.current[1] - sr, 2 * lr, 2 * sr, 0, 0, 213, 160);
            requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(requestID.current);
        }

    }, [video]);

    const myLipSet = useSetRecoilState(myLipState)
    const peerLipSet = useSetRecoilState(peerLipState)
    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
        auth ? myLipSet(true) : peerLipSet(true)
    }, [video])


    return (
        <>
            <canvas id={`${auth ? 'peer_lip' : 'my_lip'}`} width="213" height="160" ref={cloneRef} style={{ display: "none" }} ></canvas>
        </>
    )

}