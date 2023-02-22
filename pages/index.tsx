import Head from 'next/head'
import { Inter } from '@next/font/google'
const inter = Inter({ subsets: ['latin'] })
import BagicHome from '@/components/PageElements/BagicHome'
import Rocket from '@/components/Game/SegmentState/rocket'
import MainPage from '@/components/PageElements/MainPage'
import styles from '../components/PageElements/styles.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Jigsaw Puzzle</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className=''>
        <div className="container-2xl" >
          <main className="flex flex-col bg-center bg-cover justify-center items-center h-screen" >
            <div className={styles.indexbox}>
              <MainPage />
              <BagicHome />

            </div>
          </main>
        </div>
      </div>
    </>
  )
}