import logo from "/public/images/logo.png";
import background from "/public/images/background.png"
import Image from 'next/image';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Start from "./Start";
import PuzzleScreen from "@/components/PageElements/puzzle";


export default function BagicHome() {

  const [appear, setAppear] = useState<boolean>(false)
  

  useEffect(() => {
    setAppear(true)
    // setTimeout(() => setAppear(true), 1700)    
  }, [])

  return (
    <>
      <div className="flex rounded-3xl absolute mt-[400px] mr-[10px]">
      <div className= "flex flex-col">
          {/* { appear && <Start /> } */}
          { appear && <PuzzleScreen/> }
      </div>
      
      </div>
      
    </>
  )
}