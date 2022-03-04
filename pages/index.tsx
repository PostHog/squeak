import Head from 'next/head'

import type { GetServerSideProps, NextPage } from 'next'

import styles from '../styles/Home.module.css'

interface Props {
  supabase: {
    anonKey: string,
    url: string,
  }
}

const Home: NextPage<Props> = ({supabase}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Squeak</title>
        <meta name="description" content="Something about Squeak here..." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Squeak
        </h1>

        <p>The Supabase URL is: {supabase.url}</p>
        <p>The Supabase Anon Key is: {supabase.anonKey}</p>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps =  async () => {
  return {
    props: {
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
      },
    },
  }
}

export default Home
