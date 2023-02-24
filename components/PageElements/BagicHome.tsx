import logo from "/public/images/logo.png";
import background from "/public/images/background.png"
import Image from 'next/image';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Start from "./Start";
import PuzzleScreen from "@/components/PageElements/puzzle";


export default function BagicHome() {

  const [appear, setappear] = useState<boolean>(false)
  

  useEffect(() => {
    setTimeout(() => setappear(true), 1700)    
  }, [])

  return (
    <>
      <div className="flex flex-row p-2 rounded-3xl">
      <div className= "flex flex-col">
        <div className="flex flex-col items-center w-96">
          {/* { appear && <Start /> } */}
          <PuzzleScreen/>
        </div>
      </div>
      
      </div>
      
    </>
  )
}