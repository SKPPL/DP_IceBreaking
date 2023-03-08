import React, { useCallback, useRef, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { myTwirlState, peerTwirlState } from '../Game/atom';

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

    const d = 0.7;

    // angle from -2 rad to 2 rad, function is made to pass the origin quickly!
    function convolution(t: number) {
        if (t < 4) {
            return d * t * (4 - t);
        }
        else
            return d * (t - 4) * (t - 8);
    }
    const centerX = 160;
    const centerY = 120;
    const radius = 120;

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
            for (let x = 40; x < 280; x++) { // 정사각형 모양으로 잘라서 필요한 부분만 계산
                const index = (y * 320 + x) * 4;
                // Calculate the distance from the center point..
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Calculate the angle from the center point..
                const an = Math.atan2(dy, dx) + convolution(cnt.current) * (radius - distance) / radius;
                // Set the new position and color values for the pixel!
                let newX = Math.round(centerX + distance * Math.cos(an));
                // 0<=centerX+distanse*cos(an) < 320
                let newY = Math.round(centerY + distance * Math.sin(an));
                // 0<=centerX+distanse*cos(an) < 240
                const newIndex = (newY * 320 + newX) * 4;
                // 구할 인덱스는 어디서 오면 좋을까를 구하는게 좋음, 원래 좌표가 어디로 갈지를 정하면 빈 곳이 너무 많음, 따로 처리해줘야함..
                frame2.data[index] = frame.data[newIndex]; //r
                frame2.data[index + 1] = frame.data[newIndex + 1];//g
                frame2.data[index + 2] = frame.data[newIndex + 2];; //b
                frame2.data[index + 3] = 255; //a
            }
        }
        cnt.current += 0.2;
        cnt.current %= 8;
        ctx!.putImageData(frame2, 0, 0);
        requestID.current = requestAnimationFrame(draw);

    }, []);

    const myTwirlSet = useSetRecoilState(myTwirlState);
    const peerTwirlSet = useSetRecoilState(peerTwirlState);
    useEffect(() => {
        auth ? myTwirlSet(true) : peerTwirlSet(true);
        requestID.current = requestAnimationFrame(draw);
    }, []);
    return <></>;
}

