import { Page } from "@/lib/types"
import Link from "next/link"

type Props = {
  pages: Page[], // list of all pages to include (from site config)
  current: string, // relative url for the current page
}

export default function Navbar({ pages, current }: Props) {
  return (
    <nav aria-labelledby="nav-label">
      <h2 className="sr-only" id="nav-label">Main Menu</h2>
      <ul>
        {pages.map(({ route, menu }) =>
          <li key={route}>
            <Link href={route} aria-current={route === current ? 'page' : undefined}>
              {menu}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}