import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="en">
      <Head>
      </Head>
      <body className="bg-[url('../public/images/wall.png')] bg-center bg-cover">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}