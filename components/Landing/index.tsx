import Head from 'next/head';
import * as React from 'react';

export default function Landing(): JSX.Element {
  return (
    <>
      <Head>
        <title>dialect</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={'dialect'} key="ogtitle" />
        <meta
          property="og:description"
          content={'On-chain Solana messaging protocol.'}
          key="ogdesc"
        />
        <meta property="og:url" content={'dialect.to'} key="ogurl" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={'https://dialect-public.s3.us-west-2.amazonaws.com/dialect.png'} />
      </Head>
      <div className='flex flex-col flex-grow'>
        <h1 className="mt-24 md:mt-64 text-8xl font-crimson dark:text-gray-200">dialect</h1>
        <p className="text-lg text-center">
          <div className='flex flex-grow justify-center'>
            <div>On-chain Solana messaging protocol. Encryption coming soon.</div>
          </div>
        </p>
      </div>
    </>
  );
}
