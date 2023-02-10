import { useEffect, useRef, useState } from "react";
import Video from "./video";
import { useRouter } from "next/router";
import Script from "next/script";
import useScript from "@/components/usehooks-ts";
import axios from "axios";
import Slide from "./Slide";

export default function Puzzle() {
    const route = useRouter();
    const id = route.query.videoId as string;
    const mode = route.query.mode
    var temp;
    const [applicationData, setApplicationData] = useState({ videoId: '' });
    useEffect(() => {
        const userRequest = async () => {
            const res = await axios.get(`http://localhost:3000/api/youtube/youtubeDownloader?videoId=${id}`, { timeout: 20000 });
            if (res.data.videoId !== 'undefined' && res.data.videoId !== 'error') {
                setApplicationData(res.data);
            }
        };
        userRequest();
    }, [id]);

    // const status = useScript(`/scripts/puzzle.js`, {
    //     shouldPreventLoad: false,
    //     removeOnUnmount: false,
    // })

    return (
        <>
            <div className="flex flex-row">
            <div className="flex flex-row basis-1/2 justify-center grow-0">
            {/* {console.log(applicationData.videoId, id)} */}
            {applicationData.videoId !== id && <h4 className="text-3xl text-violet-400">Loading...</h4>}
            {applicationData.videoId === id && mode==='true' && <Video data={{ videoId: id }} />}
            {applicationData.videoId === id && mode==='false' && <Slide data={{ videoId: id }} />}
                    
                </div>
                </div>
            </>

    )
}




