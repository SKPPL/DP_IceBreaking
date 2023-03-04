import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import "@tensorflow/tfjs-backend-webgl";
import React, { use, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useIsMounted } from "usehooks-ts";
import { myFaceLandMarkState, peerFaceLandMarkState } from "../Game/atom";
import LipVideo from "../Game/VideoDivide/LipVideo";
import { annotateFeatures, scaler, setupModel } from "./predictionPeer";
//npm install --no-progress --verbose --loglevel silly
const WIDTH = 640;
const HEIGHT = 480;

let guestLip: number[] | undefined;

export function getGuestLip() {
  return guestLip;
}

export function startItem() {
  doRun = true;
  predict(predictModel);
}

export function stopItem() {
  doRun = false;
}

export function isLoad(){
  return loadCompleteMy;
}

let predictModel: MediaPipeFaceMesh;

let rafId: number;

let doRun: boolean = false;

let loadCompleteMy: boolean = false;

const predict = async (model: MediaPipeFaceMesh) => {
  loadCompleteMy = true;
  const videoElement = document.getElementById('peerface') as HTMLVideoElement;
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
        guestLip = annotateFeatures(predictions, scaler([WIDTH / video.videoWidth, HEIGHT / video.videoHeight, 1]));
      }
    }
    cancelAnimationFrame(rafId);
    if (doRun) {
      rafId = requestAnimationFrame(run);
    }
  };
  rafId = requestAnimationFrame(run);
};

export default function FaceLandMark() {
  const videoElementUse = document.getElementById('peerface') as HTMLVideoElement;

  useEffect(() => {

    setupModel().then((model) => {
      predictModel = model;
      predict(model);
    });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [videoElementUse]);

  const faceLandMarkReady = useSetRecoilState(peerFaceLandMarkState);
  const isMounted = useIsMounted();
  useEffect(() => {
    if (isMounted()) {
      faceLandMarkReady(true);
    }
  }, [isMounted]);

  return (
    <>
    </>
  );

}