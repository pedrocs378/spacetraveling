import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import ReactLoading from 'react-loading'
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import { Header } from '../../components/Header';
import { Comments } from '../../components/Comments';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

interface PaginationPost {
  uid: string
  title: string
}

interface PostProps {
  post: Post;
  preview: boolean
  nextPost: PaginationPost
  prevPost: PaginationPost
}

export default function Post({ post, preview, prevPost, nextPost }: PostProps) {
  const router = useRouter()

  const estimatedReadingTime = useMemo(() => {
    if (!post) {
      return
    }

    const totalWordsValue = post.data.content.reduce((prev, currentPost) => {
      const headingWordsLength = currentPost.heading?.split(' ').length ?? 0
      const bodyWordsLength = RichText.asText(currentPost.body).split(' ').length

      return prev + headingWordsLength + bodyWordsLength
    }, 0)

    return Math.ceil(totalWordsValue / 200)
  }, [post])

  const publicationDate = useMemo(() => {
    if (!post) {
      return
    }

    return format(new Date(post.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR
    })
  }, [post])

  const updatedAt = useMemo(() => {
    if (!post) {
      return
    }

    if (post.first_publication_date !== post.last_publication_date) {
      return format(new Date(post.last_publication_date), "dd MMM yyyy', às' HH:mm", {
        locale: ptBR
      })
    } else {
      return null
    }
  }, [post])

  const content = useMemo(() => {
    if (!post) {
      return
    }

    return post.data.content.map(content => {

      return {
        heading: content.heading,
        body: RichText.asHtml(content.body)
      }
    })
  }, [post])

  if (router.isFallback) {
    return (
      <div className={styles.loading}>
        <ReactLoading
          type="bubbles"
          color="var(--pink-700)"
          height={80}
          width={80}
        />
      </div>
    )
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
          {prevPost && (
            <div className={styles.previousPost}>
              <p>{prevPost.title}</p>
              <Link href={`/post/${prevPost.uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          )}
          {nextPost && (
            <div className={styles.nextPost}>
              <p>{nextPost.title}</p>
              <Link href={`/post/${nextPost.uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          )}
        </div>

        <Comments />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
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
    pageSize: 1
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

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null
  });

  const postsBeforeResponse = await prismic.query([
    Prismic.predicates.dateBefore('document.first_publication_date', response.first_publication_date)
  ], {
    fetch: ['posts.title'],
    pageSize: 1,
    ref: previewData?.ref ?? null
  });

  const postsAfterResponse = await prismic.query([
    Prismic.predicates.dateAfter('document.first_publication_date', response.first_publication_date)
  ], {
    fetch: ['posts.title'],
    pageSize: 1,
    ref: previewData?.ref ?? null
  });

  const nextPost = postsAfterResponse.results.length !== 0 && {
    uid: postsAfterResponse.results[0].uid,
    title: postsAfterResponse.results[0].data.title,
  }

  const prevPost = postsBeforeResponse.results.length !== 0 && {
    uid: postsBeforeResponse.results[0].uid,
    title: postsBeforeResponse.results[0].data.title,
  }

  return {
    props: {
      post: response,
      preview,
      nextPost,
      prevPost
    },
    revalidate: 1
  }
};
