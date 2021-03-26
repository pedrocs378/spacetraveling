import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';

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

export default function Post({ post }: PostProps) {

  const estimatedReadingTime = useMemo(() => {
    const totalWordsValue = post.data.content.reduce((prev, currentPost) => {
      const headingWordsLength = currentPost.heading?.split(' ').length ?? 0
      const bodyWordsLength = RichText.asText(currentPost.body).split(' ').length

      return prev + headingWordsLength + bodyWordsLength
    }, 0)

    return Math.round(totalWordsValue / 200)
  }, [post])

  const content = useMemo(() => {
    return post.data.content.map(content => {

      return {
        heading: content.heading,
        body: RichText.asHtml(content.body)
      }
    })
  }, [post])

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />
      <main className={styles.container}>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
        />
        <article className={`${commonStyles.commonContainer} ${styles.post}`}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfoContainer}>
            <div>
              <FiCalendar />
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock />
              <p>{estimatedReadingTime} min</p>
            </div>
          </div>


          <div className={styles.content}>
            {content.map(({ heading, body }) => {
              return (
                <>
                  <h2 className={styles.headingContent}>{heading}</h2>
                  <div
                    className={styles.bodyContent}
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                </>
              )
            })}
          </div>

        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1
  });

  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    ...response,
    first_publication_date: format(new Date(response.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR
    }),
  }

  return {
    props: { post },
    revalidate: 60 * 30
  }
};
