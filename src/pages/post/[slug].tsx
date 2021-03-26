import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {


  return (
    <>
      <Head>
        <title>Criando um app CRA do zero | spacetraveling</title>
      </Head>

      <Header />
      <main className={styles.container}>
        <img
          src="/image.png"
          alt="Image name"
        />
        <div className={styles.post}>
          <h1>Criando um app CRA do zero</h1>
          <div className={styles.postInfoContainer}>
            <div>
              <FiCalendar />
              <time>15 Mar 2021</time>
            </div>
            <div>
              <FiUser />
              <p>Joseph Oliveira</p>
            </div>
            <div>
              <FiClock />
              <p>4 min</p>
            </div>
          </div>

          <div className={styles.content}>
            Proin et varius

            Lorem ipsum dolor sit amet, consectetur adipiscing elit.

            Nullam dolor sapien, vulputate eu diam at, condimentum hendrerit tellus.
            Nam facilisis sodales felis, pharetra pharetra lectus auctor sed.

            Ut venenatis mauris vel libero pretium, et pretium ligula faucibus.
            Morbi nibh felis, elementum a posuere et, vulputate et erat. Nam venenatis.
          </div>
        </div>
      </main>
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
