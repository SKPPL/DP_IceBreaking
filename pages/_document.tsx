import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="en">
      <Head>
      </Head>
      <body className="bg-[url('../public/images/wall.webp')] bg-center bg-cover overflow-hidden bg-no-repeat">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}