import HomePage from '@/components/HomePage';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>E-Judiciary CMS — Lwengo Grade I Magistrate&apos;s Court</title>
        <meta name="description" content="Electronic Case Scheduling System for Lwengo Grade I Magistrate's Court, Uganda." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <HomePage />
    </>
  );
}
