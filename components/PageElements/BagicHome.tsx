import logo from "/public/images/logo.png";
import Image from 'next/image';
import { useRouter } from "next/router";
import { useState } from "react";


export default function BagicHome() {
  const router = useRouter();
  const [nickName, setNickName] = useState<string>("");

  const goToVideo = (nickName : string) => {
    router.push(
        {
            pathname: '/ready',
            query: {
                nickName : nickName
            }
      },
      '/ready'
    )
  }
  return (
    <div className="flex flex-row p-8 rounded-3xl">
      <div className= "flex flex-col">
        <h1 className="text-4xl text-red-300"><span className="text-5xl text text-red-600 font-medium italic" >Dive</span> into The Dynamic <br></br>
          Of Jigsaw <span className="text-5xl text text-red-600 font-medium italic">Puzzle</span>
        </h1>
        <h4 className="text-xl pt-5 pb-5 pr-3">
          Show your favorite Youtube, Tiktok, personal video <br></br>to the other Player
        </h4>
        <div className="flex flex-col w-96">
          <li>Please write your NickName : </li>
          <input className="mb-5 w-32 rounded-full text-center"
            type='text'
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            maxLength={8}></input>
          {nickName.length > 0 && <button onClick={() => goToVideo(nickName)} className="text-2xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg px-5 py-2.5 text-center mr-2 mb-2">
            Play Game -&gt;
            {/* 클릭하면 ready 화면으로 이동하는 Play game 버튼 */}
          </button>}
        </div>
      </div>
      <Image
        className="w-72"
        src={logo}
        alt="logo"
        priority
      />
    </div>
  )
}