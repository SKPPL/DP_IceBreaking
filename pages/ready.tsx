import { useRouter } from 'next/router';
import { createContext } from 'react';
import Image from 'next/image'
import tlogo from "/public/images/tlogo.png";
import ylogo from "/public/images/ylogo.png";
import plogo from "/public/images/plogo.png";
import { useContext, useEffect, useState } from "react";
const MyContext = createContext("")

interface video {
    id: string;
    title: string;
    thumbnails: {
        url: string
        
    }[]
}

export default function Ready() {
    const route = useRouter()
    const nickName = route.query.nickName as string

    return (
        <>
            <title>Ready</title>
            <div>
                <MyContext.Provider value={nickName}>
                    <ReadyBar />
                    <SearchBar />
                </MyContext.Provider>
            </div>


        </>
    )
}

function ReadyBar() {

    const nickName = useContext(MyContext);

    return (
        <div className="flex flex-col justify-center items-center rounded-3xl">
            <div>{nickName}</div>
            <div className='mt-10 text-3xl text-bold'>Select Video</div>
            <div className="p-10 flex flex-row justify-evenly">
                <Image
                    alt = "ylogo"
                    className="mr-10 w-20 h-16"
                    src={ylogo}
                />
                <Image
                    alt = "tlogo"
                    className="mr-14 w-16 h-16"
                    src={tlogo}
                        />
                <Image
                    alt="tlogo"
                    className='w-16 h-16'
                    src={plogo}
            />          
            </div>
                
            </div>
    )
}

function SearchBar() { // 모드 + 검색어 UI
    
    
    const [videos, setVideos] = useState<video[]>();
    const [input, setInput] = useState<string>("");
    const [mode, setMode] = useState(true);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const { result } = await (
                await fetch(
                    'http://localhost:3000/api/youtube/youtubeParse', {
                    method: 'POST',
                    body: JSON.stringify({ "input": "하니" }), // 실행되면 기본적으로 "하니"를 입력으로 유튜브 영상들을 불러옴
                }
                )
            ).json()
            setVideos(result)
        })()
    }, [])

    const changeMode = () => {
        setMode((prev : boolean) => !prev)
    }

    const getVideos = async () => {
        const res = await fetch('http://localhost:3000/api/youtube/youtubeParse', {
            method: 'POST',
            body: JSON.stringify({ input }), // 인풋을 받아서 유튜브 영상들을 불러옴
        })
        const { result } = await res.json()
        setVideos(result)
    }

    const sendVideo = (id : string, mode : boolean) => {
        router.push(
            {
                pathname: '/play',
                query: {
                    videoId: id, // play 화면에 해당 유튜브의 id, mode를 보내준다.
                    mode: mode,
                }
            },
            '/play'
        )
    }

    return (
        <>
            <div className='flex basis justify-evenly items-center mb-5'>
                <div className='flex basis 1/2 justify-center'>
                    <div className="flex flex-col w-full ">
                        <div className="flex flex-row">
                            <li>Mode : </li>
                            <button onClick={changeMode}>{mode ? "rectangle" : "slide"}</button>
                        </div>

                        <div className="flex">
                            <input className='flex w-96 border-solid text-xl border rounded-l-full border-red-800 text-center'
                                type='text'
                                value={input}
                                onChange={(e) => setInput(e.target.value)} // 인풋에 입력한 값이 바뀔때마다 input 값을 변경해준다
                                placeholder="검색어를 입력하세요"></input>
                            <button className='flex basis-1/6 justify-center items-center border border-black rounded-r-full font-bold bg-blue-300 bg-opacity-50' onClick={getVideos}>
                                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </button>
                            
                        </div>
                    </div>

                </div>
            </div>
            <div className='flex flex-row justify-evenly items-center'>
                <div className='flex basis-1/2 flex-col justify-evenly items-center '>
                    {!videos && <h4 className="text-3xl text-violet-400">Loading...</h4>}
                    {videos?.map((video) => ( //비디오가 로딩되면 각각을 썸네일과 타이틀을 표시해준다.
                        <div className="flex flex-row container" key={video.id}>
                            {/* {video.} */}
                            <img className="flex basis-3/5 grow-0 border border-black rounded-2xl" src={video.thumbnails[0].url}></img>
                            <div className="flex basis-2/5 justify-center items-center p-5 text-blue-700 border border-black rounded-2xl" onClick={() => { sendVideo(video.id, mode) }}>{video.title}</div>
                        </div>
                    ))}
                </div>

            </div>

        </>
    )

}