import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import "@tensorflow/tfjs-backend-webgl";
import React, { use, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useIsMounted } from "usehooks-ts";
import { myFaceLandMarkState, peerFaceLandMarkState } from "../Game/atom";
import LipVideo from "./LipVideo";
import { annotateFeatures, scaler, setupModel } from "./prediction";
//npm install --no-progress --verbose --loglevel silly
const WIDTH = 640;
const HEIGHT = 480;
interface Props {
  id: string
  auth: boolean
}

let hostLip: number[] | undefined;

let guestLip: number[] | undefined;

export function getHostLip() {
  return hostLip;
}

export function getGuestLip() {
  return guestLip;
}

export default function FaceLandMark({ auth, id }: Props) {

  const user = id;
  const videoElement = document.getElementById(user) as HTMLVideoElement;

  useEffect(() => {
    let rafId: number;

    const predict = async (model: MediaPipeFaceMesh) => {
      const run = async () => {
        const video = videoElement;
        if (video && !video.paused && !video.ended) {
          const predictions = await model.estimateFaces({
            input: video,
            returnTensors: false,
            flipHorizontal: false,
            predictIrises: false,
          });
          if (predictions.length > 0) {
            if (id === 'myface') {
              hostLip = annotateFeatures(predictions, scaler([WIDTH / video.videoWidth, WIDTH / video.videoWidth, 1]));
            } else {
              guestLip = annotateFeatures(predictions, scaler([WIDTH / video.videoWidth, WIDTH / video.videoWidth, 1]));
            }
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

  const faceLandMarkReady = useSetRecoilState(auth ? myFaceLandMarkState : peerFaceLandMarkState)
  const isMounted = useIsMounted()
  useEffect(() => {
    if (isMounted()) {
      faceLandMarkReady(true)
    }
  }, [isMounted])

  return (
    <>
    </>
  )

}