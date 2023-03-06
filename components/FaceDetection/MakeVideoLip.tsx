import { useCallback, useEffect, useMemo, useRef } from "react";
import { getHostLip } from "./FaceLandMarkMy";
import { getGuestLip } from "./FaceLandMarkPeer";
import { useSetRecoilState } from 'recoil';
import { myLipState, peerLipState } from "../Game/atom";


interface segmentData {
    auth: boolean;
}

export default function MakeVideoLip({ auth }: segmentData) {
    //내가 움직여야하는 것은 peerface이므로 auth가 true면 내 비디오를 변환해서 상대 퍼즐에 표시함, false면 상대 비디오를 변환해서 내 퍼즐에 표시함
    const videoId = auth ? 'peerface' : 'myface';
    const cloneRef = document.getElementById(auth ? "peer_lip" : "my_lip") as HTMLCanvasElement;
    const requestID = useRef<number>(0);
    let ctx: CanvasRenderingContext2D | null = null;
    useEffect(() => {
        if (!cloneRef) return;
        ctx = cloneRef.getContext('2d', { alpha: false, willReadFrequently: true });
        return () => {
            cancelAnimationFrame(requestID.current);
            auth ? myLipSet(false) : peerLipSet(false);
            cloneRef.remove();
        };
    }, []);
    const xyr = useRef([320, 240, 30]);
    const video = document.getElementById(videoId) as HTMLVideoElement;
    let tempXYR, lr, sr;
    const draw = useCallback(() => {
        if (video.videoWidth !== 640) {
            xyr.current = [video.videoWidth / 2, video.videoHeight / 2, Math.floor(30 * video.videoWidth / 640)];
        }
        tempXYR = auth ? getGuestLip() : getHostLip();
        if (tempXYR) {
            xyr.current = tempXYR.map((v) => Math.floor(v * video.videoWidth / 640));
        }

        //장축과 단축
        lr = Math.floor(xyr.current[2] * 1.5);
        sr = Math.floor(xyr.current[2]);
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