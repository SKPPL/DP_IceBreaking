import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import "@tensorflow/tfjs-backend-webgl";
import React, { useEffect, useRef, useState } from "react";
import { annotateFeatures, scaler, setupModel } from "./prediction";
//npm install --no-progress --verbose --loglevel silly
const WIDTH = 480;

interface Props{
  i: string
}


let hostLip: number[] | undefined;

let guestLip: number[] | undefined;

export function getHostLip() {
  return hostLip;
}

export function getGuestLip() {
  return guestLip;
}

export default function FaceLandMark({i}: Props) {


  const user = i === 'host' ? 'myface' : 'peerface';
  const videoElement = document.getElementById(user) as HTMLVideoElement;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);

  useEffect(() => {
    let rafId: number;

    const predict = async (model: MediaPipeFaceMesh) => {
      const run = async () => {
        if (!ctxRef.current) {
          // @ts-ignore
          ctxRef.current = canvasRef.current?.getContext("2d");
        }
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const video = videoElement;
        if (canvas && ctx && video && !video.paused && !video.ended) {
          if (canvas.width !== WIDTH) {
            canvas.width = WIDTH;
            canvas.height = (video.videoHeight / video.videoWidth) * WIDTH;
            console.log(
              (video.videoHeight / video.videoWidth) * WIDTH,
              video.videoHeight,
              video.videoWidth
            );
          }
          const predictions = await model.estimateFaces({
            input: video,
            returnTensors: false,
            flipHorizontal: false,
            predictIrises: false,
          });
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (predictions.length > 0) {
            if (i === 'host'){
              hostLip = annotateFeatures(ctx, predictions, scaler([canvas.width / video.videoWidth, canvas.width / video.videoWidth, 1]));
            }else{
              guestLip = annotateFeatures(ctx, predictions, scaler([canvas.width / video.videoWidth, canvas.width / video.videoWidth, 1]));
            }
            
          }
        } else if (ctx) {
          ctx.font = "30px Arial";
          if (!video) {
            ctx.fillText("Initializing video", 10, 50);
          } else if (video.paused) {
            ctx.fillText("Video paused", 10, 50);
          } else if (video.ended) {
            ctx.fillText("Video ended", 10, 50);
          }
        }
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(run);
      };
      rafId = requestAnimationFrame(run);
    };

    setupModel().then((model) => {
      predict(model);
    });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [videoElement]);
  
  return (
    <canvas className="w-[640px] h-[480px]" ref={canvasRef} />
  );
}

