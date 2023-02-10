import { useState, useEffect } from 'react';

interface Props {
    data: {
        videoId: string;
    };
}

export default function Video({ data }: Props) {
    var windowSize = useWindowSize();
    const canvas = () => {
        {
            var n = 3
            const result = [];
            for (let i = 0; i < n * n; i++) {
                {
                    result.push(<canvas className='hidden' id={"canvas" + i} key={i} ></ canvas>);
                }
            }
            return result;
        }
    }

    function play_puzzle() {
        const script = document.createElement("script");
        script.src = "/scripts/puzzle.js";
        script.async = true;
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length; i--;) {
            if (scripts[i].src.includes("/scripts/puzzle.js")) {
                document.body.removeChild(scripts[i]);
            };
        }
        document.body.appendChild(script);
    }
    return (
        <>
            <div className='flex flex-col'>
                <div>
                    <button id="play" className="bg-blue-500 hover:bg-blue-700 text-white font-bold ">Play</button>
                    <button id="pause" className="bg-blue-500 hover:bg-blue-700 text-white font-bold">Pause</button>
            <div id="stage" style={{ width: windowSize.width / 2.5, border: "0px", padding: "0px", outline: "1px solid black" }} >
                    </div>
                    </div>
            {canvas()}
            <div>
                <video className='hidden' id="video" src={data.videoId + ".mp4"} onLoadedData={play_puzzle} width={windowSize.width} height={windowSize.height} loop></video>
                </div>
                </div>
        </>
    );

}

// // Hook
// function useWindowSize() {
//     // Initialize state with undefined width/height so server and client renders match
//     // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
//     const [windowSize, setWindowSize] = useState({
//         width: 0,
//         height: 0,
//     });
//     function handleResize() {
//         // Set window width/height to state
//         setWindowSize({
//             width: window.innerWidth,
//             height: window.innerHeight,
//         });
//     }

//     useEffect(() => {
//         // only execute all the code below in client side
//         if (typeof window !== 'undefined') {
//             // Handler to call on window resize

//             // Add event listener
//             window.addEventListener("onLoad", handleResize);

//             // Call handler right away so state gets updated with initial window size
//             // handleResize();

//             // Remove event listener on cleanup
//             return () => window.removeEventListener("onLoad", handleResize);
//         }
//     }, []); // Empty array ensures that effect is only run on mount
//     return windowSize;
// }


// Hook
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