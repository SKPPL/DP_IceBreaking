import React, { useRef, useEffect, useState, memo } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { useDrag, useGesture } from "react-use-gesture";
import { Provider, useSelector, useDispatch } from "react-redux";
import itemStore from "@/components/Game/store";
import { useRouter } from "next/router";
import styles from "./styles.module.css";
import DefaultSegment from "./SegmentState/defaultSegment";
import Ice from "./SegmentState/ice";
import Rocket from "./SegmentState/rocket";
import Magnet from "./SegmentState/magnet";

interface Props {
  i: number;
  videoId: string;
  auth: boolean;
  peerxy: { peerx: number; peery: number } | undefined;
  dataChannel: RTCDataChannel | undefined;
  segmentState: string;
}
function Segment({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {


  return (
    <>
      {segmentState === "default" && <DefaultSegment key={`default_${i}`} i={i} auth={auth} peerxy={peerxy} dataChannel={dataChannel} videoId={videoId} segmentState={segmentState} />}
      {segmentState === "rocket" && <Rocket key={`rocket_${i}`} i={i} auth={auth} peerxy={undefined} dataChannel={dataChannel} />}
      {segmentState === "ice" && <Ice key={`ice_${i}`} i={i} auth={auth} segmentState={segmentState} />}
      {segmentState === "magnet" && <Magnet key={`magnet_${i}`} i={i} auth={auth} peerxy={undefined} dataChannel={dataChannel} videoId={videoId} segmentState={segmentState} />}
    </>
  );
}

export default memo(Segment);