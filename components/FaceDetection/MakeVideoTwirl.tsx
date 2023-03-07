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
                const newX = Math.round(centerX + distance * Math.cos(an));
                const newY = Math.round(centerY + distance * Math.sin(an));
                // Set the new position and color values for the pixel!
                const newIndex = (newY * 320 + newX) * 4;
                if (newIndex >= 307200 || newIndex < 0) continue; //307200 = 320*240*4
                frame2.data[newIndex] = frame.data[index]; //r
                frame2.data[newIndex + 1] = frame.data[index + 1];//g
                frame2.data[newIndex + 2] = frame.data[index + 2];; //b
                frame2.data[newIndex + 3] = frame.data[index + 3];; //a
            }
        }
        let tempIndex1 = 0;
        let cnt1 = 0;
        let tempIndex2 = 0;
        let cnt2 = 0;
        for (let y = 0; y < 240; y++) {
            for (let x = 0; x < 320; x++) {
                const index = (y * 320 + x) * 4;
                if (frame2.data[index] == 0 || frame2.data[index + 1] == 0 || frame2.data[index + 2] == 0 || frame2.data[index + 3] == 0) {
                    //tempIndex1, tempIndex2는 0이 아닌 값이 나올 때까지 앞뒤로 탐색, for interpolation of the color!
                    tempIndex1 = index;
                    cnt1 = 0;
                    tempIndex2 = index;
                    cnt2 = 0;
                    while ((frame2.data[tempIndex1] == 0 || frame2.data[tempIndex1 + 1] == 0 || frame2.data[tempIndex1 + 2] == 0 || frame2.data[tempIndex1 + 3] == 0) && tempIndex1 >= 0) {
                        tempIndex1 -= 4;
                        cnt1 += 1;
                    }
                    while ((frame2.data[tempIndex2] == 0 || frame2.data[tempIndex2 + 1] == 0 || frame2.data[tempIndex2 + 2] == 0 || frame2.data[tempIndex2 + 3] == 0) && tempIndex2 < 307200) {// 307200 = 320*240*4
                        tempIndex2 += 4;
                        cnt2 += 1;
                    }
                    //내분점으로 보간법 적용해봄, cnt가 0이면 0으로 나누는 에러가 발생하므로 예외처리
                    if (cnt1 == 0 && cnt2 == 0) {
                        frame2.data[index] = frame.data[index];
                        frame2.data[index + 1] = frame.data[index + 1];
                        frame2.data[index + 2] = frame.data[index + 2];
                        frame2.data[index + 3] = frame.data[index + 3];
                    } else {
                        frame2.data[index] = Math.floor(frame2.data[tempIndex1] * cnt2 + cnt1 * frame2.data[tempIndex2]) / (cnt1 + cnt2);
                        frame2.data[index + 1] = Math.floor(frame2.data[tempIndex1 + 1] * cnt2 + cnt1 * frame2.data[tempIndex2 + 1]) / (cnt1 + cnt2);
                        frame2.data[index + 2] = Math.floor(frame2.data[tempIndex1 + 2] * cnt2 + cnt1 * frame2.data[tempIndex2 + 2]) / (cnt1 + cnt2);
                        frame2.data[index + 3] = Math.floor(frame2.data[tempIndex1 + 3] * cnt2 + cnt1 * frame2.data[tempIndex2 + 3]) / (cnt1 + cnt2);
                    }
                }
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

