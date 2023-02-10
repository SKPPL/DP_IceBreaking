import { useState, useEffect } from 'react';

interface Props {
    data: {
        videoId: string;
    };
}

// data : pre-render에서 받아온 영상 경로및 이름
export default function Slide({ data }: Props) {

    // TODO: client의 window size 변경시 따라서 변경되게 하기
    //  client window 사이즈
    var windowSize = useWindowSize();

    // n*n을 지정하여 개수만큼 canvas 태그 생성하여 리턴
    const canvas = () => {
        {
            var n = 3
            const result = [];
            for (let i = 0; i < n * n; i++) {
                {
                    result.push(<canvas id={"canvas" + i} key={i} style={{ display: "none" }} ></ canvas>);
                }
            }
            return result;
        }
    }

    function play_puzzle() {
        const script = document.createElement("script");
        script.src = "/scripts/slidePuzzle.js";
        script.async = true;
        document.body.appendChild(script);
    }

    return (
        <>
            <div className='flex flex-col'>
                {/* video 재생 정지 버튼 */}
                <div className='flex flex-row'>
                    <button id="play" className="bg-blue-500 hover:bg-blue-700 text-white font-bold ">Play</button>
                    <button id="pause" className="bg-blue-500 hover:bg-blue-700 text-white font-bold">Pause</button>
                </div>
            {/*  client window사이즈의 1/2.5배 폭의 play stage div 생성 */}
            <div id="stage" style={{ width: windowSize.width / 2.5, border: "0px", padding: "0px", outline: "1px solid black" }} >
            </div>

            {/*  canvas태그 n*n 리턴받기 */}
            {canvas()}

            {/*  원본 비디오 맨 아래에 가린채 배치 */}
            <div>
                <video id="video" src={data.videoId + ".mp4"} onLoadedData={play_puzzle} width={windowSize.width} height={windowSize.height} loop style={{ display: "none" }}></video>
                </div>
                </div>
        </>
    );

}


// Hook
// XXX: 단순히 window size로 잡혀서 가로 세로 비율이 어떻게 적용될지?
// client에서 1회적으로 시작될 때 client의 window 화면 크기를 구하여 리턴
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
    }, []);
    return windowSize;
}