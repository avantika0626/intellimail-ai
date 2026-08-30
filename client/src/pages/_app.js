import React, { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    if (initAuth) {
      initAuth();
    }
  }, [initAuth]);

  return (
    <>
      <Head>
        <title>IntelliMail AI | Your AI-Powered Email Workspace</title>
        <meta
          name="description"
          content="IntelliMail AI — Next-generation AI-powered email management workspace with real-time Gmail integration, smart summaries, tone-based replies, and action extraction."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
