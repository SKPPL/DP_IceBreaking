import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { AnnotatedPrediction } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";

export const setupModel = async () => {
  await tf.setBackend("webgl");
  const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, { maxFaces: 1 });
  return model;
};

export const region = (points: [number, number, number][], open: boolean = false) => {
  const path = new Path2D();
  path.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    path.lineTo(point[0], point[1]);
  }
  if (!open) {
    path.closePath();
  }
  return path;
};

type Scale = (point: [number, number, number]) => [number, number, number];
export const scaler =
  (scale: [number, number, number]): Scale =>
    (point) => {
      return [point[0] * scale[0], point[1] * scale[1], point[2] * scale[2]];
    };

export const annotateFeatures = (predictions: AnnotatedPrediction[], scale: Scale = scaler([1, 1, 1])) => {
  for (let prediction of predictions) {
    //@ts-ignore
    const { annotations } = prediction;

    // 위 좌표의 무게중심 계산
    let lipsUpperInnerSumX = 0;
    let lipsUpperInnerSumY = 0;
    for (let idx in annotations.lipsUpperInner.map(scale)) {
      lipsUpperInnerSumX += annotations.lipsUpperInner.map(scale)[idx][0];
      lipsUpperInnerSumY += annotations.lipsUpperInner.map(scale)[idx][1];
    }

    let lipsLowerInnerSumX = 0;
    let lipsLowerInnerSumY = 0;
    for (let idx in annotations.lipsUpperInner.map(scale)) {
      lipsLowerInnerSumX += annotations.lipsLowerInner.map(scale)[idx][0];
      lipsLowerInnerSumY += annotations.lipsLowerInner.map(scale)[idx][1];
    }
    let avgSumX = (lipsUpperInnerSumX + lipsLowerInnerSumX) / 22;
    let avgSumY = (lipsUpperInnerSumY + lipsLowerInnerSumY) / 22;
    let radiusX = (annotations.lipsUpperOuter.map(scale)[10][0] - annotations.lipsLowerOuter.map(scale)[0][0]) / 2;

    return [avgSumX, avgSumY, radiusX];
  }
};