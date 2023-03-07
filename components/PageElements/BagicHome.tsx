import { useEffect, useState } from "react";
import PuzzleScreen from "@/components/PageElements/puzzle";


export default function BagicHome() {

  const [appear, setAppear] = useState<boolean>(false);


  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <>
      <div className="flex rounded-3xl absolute mt-[400px] mr-[10px]">
        <div className="flex flex-col">
          {appear && <PuzzleScreen />}
        </div>
      </div>

    </>
  );
}