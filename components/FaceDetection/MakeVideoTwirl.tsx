import React, { useState, useCallback, useRef, useEffect } from 'react'

import { useSetRecoilState } from 'recoil'
import { myTwirlState, peerTwirlState } from '../Game/atom'
interface Props {
    videoId: string;
    auth: boolean;
}

export default function Twirl({ videoId, auth }: Props) {
    // auth가 true면 내 비디오를 변환해서 상대 퍼즐에 표시함, false면 상대 비디오를 변환해서 내 퍼즐에 표시함
    const myTwirlSet = useSetRecoilState(myTwirlState)
    const peerTwirlSet = useSetRecoilState(peerTwirlState)
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var cnt = useRef<number>(0);
    var requestID = useRef<number>(0);
    var ctx: CanvasRenderingContext2D | null = null;
    var unmountCheck = false;

    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return
        ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
        return () => {
            unmountCheck = true;
            auth ? myTwirlSet(false) : peerTwirlSet(false)
        }
    }, [cloneRef])

    const video = document.getElementById(videoId) as HTMLVideoElement;
    const canvas2 = document.createElement('canvas');
    canvas2.width = 640;
    canvas2.height = 480;
    const ctx2 = canvas2.getContext('2d', { alpha: false, willReadFrequently: true, desynchronized: true });
    const d = 0.7
    function convolution(t: number) {

        if (t < 4) {
            return d * t * (4 - t)
        }
        else
            return d * (t - 4) * (t - 8)

    }
    const centerX = 320;
    const centerY = 240;
    const radius = 240
    const draw = useCallback(() => {
        if (!cloneRef.current) return
        if (!unmountCheck) {
            cnt.current += 0.2
            cnt.current %= 8
            ctx2!.drawImage(video, 0, 0, 640, 480, 0, 0, 640, 480);
            const frame = ctx2!.getImageData(0, 0, 640, 480);
            const frame2: ImageData = new ImageData(640, 480)
            for (let y = 0; y < 480; y++) {
                for (let x = 80; x < 560; x++) {
                    let index = (y * 640 + x) * 4;
                    // Calculate the distance from the center point
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    // Calculate the angle from the center point
                    // Calculate the new position for the pixel
                    const an = Math.atan2(dy, dx) + convolution(cnt.current) * (radius - distance) / radius;
                    const newX = Math.round(centerX + distance * Math.cos(an * (1 + 1 / distance)));
                    const newY = Math.round(centerY + distance * Math.sin(an * (1 + 1 / distance)));
                    // Get the color values for the pixel
                    const r = frame.data[index];
                    const g = frame.data[index + 1];
                    const b = frame.data[index + 2];
                    const a = frame.data[index + 3];

                    // Set the new position and color values for the pixel
                    const newIndex = (newY * 640 + newX) * 4;
                    frame2.data[newIndex] = r;
                    frame2.data[newIndex + 1] = g;
                    frame2.data[newIndex + 2] = b;
                    frame2.data[newIndex + 3] = a;
                }
            }
            for (let y = 0; y < 480; y++) {
                for (let x = 0; x < 640; x++) {
                    const index = (y * 640 + x) * 4;
                    if (frame2.data[index] == 0 || frame2.data[index + 1] == 0 || frame2.data[index + 2] == 0 || frame2.data[index + 3] == 0) {
                        var tempIndex1 = index;
                        var tempIndex2 = index;
                        while ((frame2.data[tempIndex1] == 0 || frame2.data[tempIndex1 + 1] == 0 || frame2.data[tempIndex1 + 2] == 0 || frame2.data[tempIndex1 + 3] == 0) && tempIndex1 >= 0)
                            tempIndex1 -= 4
                        while ((frame2.data[tempIndex2] == 0 || frame2.data[tempIndex2 + 1] == 0 || frame2.data[tempIndex2 + 2] == 0 || frame2.data[tempIndex2 + 3] == 0) && tempIndex2 < 1228800) // 1228800 = 640*480*4
                            tempIndex2 += 4
                        const r = Math.floor(frame2.data[tempIndex1] + frame2.data[tempIndex2]) / 2;
                        const g = Math.floor(frame2.data[tempIndex1 + 1] + frame2.data[tempIndex2 + 1]) / 2;
                        const b = Math.floor(frame2.data[tempIndex1 + 2] + frame2.data[tempIndex2 + 2]) / 2;
                        const a = Math.floor(frame2.data[tempIndex1 + 3] + frame2.data[tempIndex2 + 3]) / 2;
                        frame2.data[index] = r;
                        frame2.data[index + 1] = g;
                        frame2.data[index + 2] = b;
                        frame2.data[index + 3] = a;
                    }
                }
            }
            ctx!.putImageData(frame2, 0, 0);
            requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(requestID.current);
        }
    }, [])


    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        auth ? myTwirlSet(true) : peerTwirlSet(true)
        requestID.current = requestAnimationFrame(draw);
    }, [video])


    return (
        <div >
            <canvas id={`${videoId}_twirl`} width="640" height="480" ref={cloneRef} ></canvas>
        </div >
    )
}

