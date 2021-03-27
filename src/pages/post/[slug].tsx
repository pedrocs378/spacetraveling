import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  const router = useRouter()

  const estimatedReadingTime = useMemo(() => {
    const totalWordsValue = post.data.content.reduce((prev, currentPost) => {
      const headingWordsLength = currentPost.heading?.split(' ').length ?? 0
      const bodyWordsLength = RichText.asText(currentPost.body).split(' ').length

      return prev + headingWordsLength + bodyWordsLength
    }, 0)

    return Math.ceil(totalWordsValue / 200)
  }, [post])

  const publicationDate = useMemo(() => {
    return format(new Date(post.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR
    })
  }, [post])

  const updatedAt = useMemo(() => {
    if (post.first_publication_date !== post.last_publication_date) {
      return format(new Date(post.last_publication_date), "dd MMM yyyy', às' HH:mm", {
        locale: ptBR
      })
    } else {
      return null
    }
  }, [post])

  const content = useMemo(() => {
    return post.data.content.map(content => {

      return {
        heading: content.heading,
        body: RichText.asHtml(content.body)
      }
    })
  }, [post])

  if (router.isFallback) {
    return <p>Carregando...</p>
  }

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
            <div className={styles.postInfo}>
              <div>
                <FiCalendar />
                <time>{publicationDate}</time>
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
            {updatedAt && (
              <em>* editado em {updatedAt}</em>
            )}
          </div>


          <div className={styles.content}>
            {content.map(({ heading, body }) => {
              return (
                <section key={heading}>
                  <h2 className={styles.headingContent}>{heading}</h2>
                  <div
                    className={styles.bodyContent}
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                </section>
              )
            })}
          </div>
        </article>

        <div className={`${commonStyles.commonContainer} ${styles.divider}`} />

        <div className={`${commonStyles.commonContainer} ${styles.postNavigation}`}>
          <div>
            <p>Como utilizar hooks</p>
            <Link href="#">
              <a>Post anterior</a>
            </Link>
          </div>
          <div>
            <p>Criando um app CRA do zero</p>
            <Link href="#">
              <a>Próximo post</a>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title'],
    pageSize: 2
  });

  const paths = postsResponse.results.map((post) => {
    return {
      params: {
        slug: post.uid
      },
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log(response.first_publication_date === response.last_publication_date)

  return {
    props: { post: response },
    revalidate: 1
  }
};
