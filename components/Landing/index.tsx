import Head from 'next/head';
import * as React from 'react';
export default function Landing(): JSX.Element {
  return (
    <>
      <Head>
        <title>dialect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1 className="mt-24 md:mt-64 text-8xl font-crimson dark:text-gray-200">dialect</h1>
        <p className="text-lg text-center">
          On-chain, encrypted Solana messaging protocol.
        </p>
      </div>
    </>
  );
}
