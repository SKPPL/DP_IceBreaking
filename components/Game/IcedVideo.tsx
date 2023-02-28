import { useCallback, useEffect, useRef } from "react";
interface segmentData {
    auth: boolean;
    id: number;
    videoId: string;
    segmentState: string | undefined;
    iceCount: number;
}

const img = new Image();
img.src = "../images/new_ice.png";
img.width = 640
img.height = 480


export default function IcedVideo({ iceCount, id, auth, videoId, segmentState }: segmentData) {

    var cloneRef = useRef<HTMLCanvasElement>(null);
    var ctx: CanvasRenderingContext2D | null = null;
    var unmountCheck = false;
    useEffect(() => {
        unmountCheck = false;
        if (!cloneRef.current) return
        ctx = cloneRef.current.getContext('2d', { alpha: false });

        return () => {
            unmountCheck = true;
        }
    }, [cloneRef])

    const video = document.getElementById(videoId) as HTMLVideoElement;
    const draw = () => {
        if (!unmountCheck) {
            ctx!.drawImage(video, 213 * (id % 3), 160 * ((id - id % 3) / 3), 213, 160, 0, 0, 640, 480);
            if (segmentState === 'ice' && iceCount > 0) {
                ctx!.drawImage(img, 0, 0)
            }
            setTimeout(draw, 16);
        }
    }

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        draw();
    }, [video])

    return (
        <>
            <canvas id={`${auth ? 'my' : 'peer'}_${id}`} width="640" height="480" ref={cloneRef} ></canvas>
        </>
    )

}