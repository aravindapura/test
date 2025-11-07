import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function LotusFeetApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Лотосные стопы</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default LotusFeetApp;
