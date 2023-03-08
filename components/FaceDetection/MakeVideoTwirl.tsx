import React, { useCallback, useRef, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { myItemState, peerItemState } from '../Game/atom';
import { twirlArray } from "@/components/WebRTC/CheckReady"; 

interface segmentData {
    videoId: string;
    auth: boolean;
}

export default function MakeVideoTwirl({ videoId, auth }: segmentData) {
    // auth가 true면 내 비디오를 변환해서 상대 퍼즐에 표시함, false면 상대 비디오를 변환해서 내 퍼즐에 표시함

    const cloneRef = document.getElementById(`${videoId}_twirl`) as HTMLCanvasElement;
    const cnt = useRef<number>(0);
    const requestID = useRef<number>(0);
    let ctx: CanvasRenderingContext2D | null = null;
    useEffect(() => {
        ctx = cloneRef.getContext('2d', { alpha: false, willReadFrequently: true });
        return () => {
            auth ? myTwirlSet(false) : peerTwirlSet(false);
            cancelAnimationFrame(requestID.current);
            cloneRef.remove();
        };
    }, []);

    const video = document.getElementById(videoId) as HTMLVideoElement;
    const canvas2 = document.createElement('canvas'); // twirl 만들 캔버스
    canvas2.width = 320;
    canvas2.height = 240;
    let ctx2: CanvasRenderingContext2D | null = null;

    ctx2 = canvas2.getContext('2d', { alpha: false, willReadFrequently: true });

    const draw = useCallback(() => {
        if (video.videoWidth !== 640) {
            ctx2!.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 320, 240);
        }
        else {
            ctx2!.drawImage(video, 0, 0, 640, 480, 0, 0, 320, 240);
        }
        const frame = ctx2!.getImageData(0, 0, 320, 240);
        const frame2: ImageData = new ImageData(320, 240);
        for (let y = 0; y < 240; y++) {
            for (let x = 40; x < 280; x++) {
              const index = (y * 320 + x) * 4;
              const newIndex = twirlArray[cnt.current][y * 320 + x - 40];
              // 구할 인덱스는 어디서 오면 좋을까를 구하는게 좋음, 원래 좌표가 어디로 갈지를 정하면 빈 곳이 너무 많음, 따로 처리해줘야함..
              frame2.data[index] = frame.data[newIndex]; //r
              frame2.data[index + 1] = frame.data[newIndex + 1]; //g
              frame2.data[index + 2] = frame.data[newIndex + 2]; //b
              frame2.data[index + 3] = 255; //a
            }
        }
        cnt.current += 1;
        cnt.current %= 40;
        ctx!.putImageData(frame2, 0, 0);
        requestID.current = requestAnimationFrame(draw);

    }, []);

    const myTwirlSet = useSetRecoilState(myItemState);
    const peerTwirlSet = useSetRecoilState(peerItemState);
    useEffect(() => {
        auth ? myTwirlSet(true) : peerTwirlSet(true);
        requestID.current = requestAnimationFrame(draw);
    }, []);
    return <></>;
}

