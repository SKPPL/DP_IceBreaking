import { useCallback, useEffect, useMemo, useRef } from "react";
import { getHostLip } from "./FaceLandMarkMy";
import { getGuestLip } from "./FaceLandMarkPeer";
import { useSetRecoilState } from 'recoil';
import { myLipState, peerLipState } from "../Game/atom";
import { isMacOs, isChrome } from 'react-device-detect';

interface segmentData {
    auth: boolean;
}

export default function MakeVideoLip({ auth }: segmentData) {
    var videoId = auth ? 'peerface' : 'myface';
    var cloneRef = document.getElementById(auth ? "peer_lip" : "my_lip") as HTMLCanvasElement;
    var requestID = useRef<number>(0);
    var ctx: CanvasRenderingContext2D | null = null;
    useEffect(() => {
        if (!cloneRef) return;
        if (isMacOs && isChrome) {
            ctx = cloneRef.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
        }
        else {
            ctx = cloneRef.getContext('2d', { alpha: false, willReadFrequently: true });
        }
        return () => {
            cancelAnimationFrame(requestID.current);
            auth ? myLipSet(false) : peerLipSet(false);
            cloneRef.remove();

        };
    }, []);
    const xyr = useRef([320, 240, 50]);
    const video = document.getElementById(videoId) as HTMLVideoElement;
    const draw = useCallback(() => {
        var tempXYR = auth ? getGuestLip() : getHostLip();
        if (tempXYR) {
            xyr.current = tempXYR;
        }
        //장축과 단축
        var lr = Math.floor(xyr.current[2] * 1.5);
        var sr = Math.floor(xyr.current[2]);
        ctx!.drawImage(video, xyr.current[0] - lr, xyr.current[1] - sr, 2 * lr, 2 * sr, 0, 0, 213, 160);
        requestID.current = requestAnimationFrame(draw);

    }, []);

    const myLipSet = useSetRecoilState(myLipState);
    const peerLipSet = useSetRecoilState(peerLipState);
    useEffect(() => {
        requestID.current = requestAnimationFrame(draw);
        auth ? myLipSet(true) : peerLipSet(true);
    }, []);

    return <></>;
}