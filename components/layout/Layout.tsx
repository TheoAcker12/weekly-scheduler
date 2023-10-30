import { ReactNode } from "react"
import Navbar from "./Navbar";
import { pages } from "@/lib/config";
import Head from 'next/head'

type Props = {
  current: string, // relative url of the current page
  title: string, // page title for the current page
  children: ReactNode,
}
export default function Layout({ current, title, children }: Props) {
  return (<>
    <Head>
      <title>{title}</title>
      <meta name="description" content="Generated by create next app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <header>
      {/* skip link */}
      <a href="#main" id="main-skip-link" className="skip-link">Skip to Content</a>
      <Navbar
        pages={pages}
        current={current}
      />
    </header>
    <main id="main">
      <h1>{title}</h1>
      {children}
    </main>
  </>)
}