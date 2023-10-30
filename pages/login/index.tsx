import LoginForm from '@/components/pages/LoginForm'
import Head from 'next/head'
import styles from '@/styles/pages/login.module.scss'

export default function Login() {
  return (<>
    <Head>
      <title>Log In</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main id="main">
      <div className={styles.outerWrapper}>
        <div className={styles.innerWrapper}>
          <h1>Log In</h1>
          <LoginForm />
        </div>
      </div>
    </main>
  </>)
}
