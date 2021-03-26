import { GetStaticProps } from 'next';
import Link from 'next/link'
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={`${commonStyles.commonContainer} ${styles.container}`}>
        <img src="/svg/logo.svg" alt="logo" />

        <div className={styles.posts}>
          <Link href="#">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.postInfoContainer}>
                <div>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FiUser />
                  <p>Joseph Oliveira</p>
                </div>
              </div>
            </a>
          </Link>
          <Link href="#">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.postInfoContainer}>
                <div>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FiUser />
                  <p>Joseph Oliveira</p>
                </div>
              </div>
            </a>
          </Link>
          <Link href="#">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.postInfoContainer}>
                <div>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FiUser />
                  <p>Joseph Oliveira</p>
                </div>
              </div>
            </a>
          </Link>

          <button type="button">
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
