
import Link from 'next/link'

import styles from './header.module.scss'

export function Header() {

  return (
    <header className={`${styles.headerContainer}`}>
      <div className={styles.logo}>
        <Link href="/">
          <a>
            <img src="/svg/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
