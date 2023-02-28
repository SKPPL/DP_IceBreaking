import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import "@tensorflow/tfjs-backend-webgl";
import React, { use, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useIsMounted } from "usehooks-ts";
import { myFaceLandMarkState, peerFaceLandMarkState } from "../Game/atom";
import LipVideo from "./LipVideo";
import { annotateFeatures, scaler, setupModel } from "./predictionMy";
//npm install --no-progress --verbose --loglevel silly
const WIDTH = 640;
const HEIGHT = 480;

let hostLip: number[] | undefined;

export function getHostLip() {
  return hostLip;
}

export function startItem(){
  doRun = true;
  predict(predictModel);
}

export function stopItem(){
  doRun = false;
}

let predictModel: MediaPipeFaceMesh;

let rafId: number;

let doRun:boolean = false;

const predict = async (model: MediaPipeFaceMesh) => {
  const videoElement = document.getElementById('myface') as HTMLVideoElement;
  const run = async () => {
    const video = videoElement;
    if (video && !video.paused && !video.ended) {
      console.log('myface predicting');
      const predictions = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: false,
      });
      if (predictions.length > 0) {
        hostLip = annotateFeatures(predictions, scaler([WIDTH / video.videoWidth, WIDTH / video.videoWidth, 1]));
      }
    }
    cancelAnimationFrame(rafId);
    if (doRun){
      rafId = requestAnimationFrame(run);
    }
  };
  rafId = requestAnimationFrame(run);
};

export default function FaceLandMark() {
  const videoElementUse = document.getElementById('myface') as HTMLVideoElement;

  useEffect(() => {

    setupModel().then((model) => {
      predictModel = model;
      console.log('mymodel is ready', predictModel);
      // predict(model);
    });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [videoElementUse]);

  const faceLandMarkReady = useSetRecoilState(myFaceLandMarkState)
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