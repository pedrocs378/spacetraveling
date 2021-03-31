import { useMemo, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { GetStaticProps } from 'next';
import Link from 'next/link'
import Head from 'next/head';
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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
  preview: boolean
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  const postsFormatted = useMemo(() => {
    return posts.map(post => {
      return {
        ...post,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR
        })
      }
    })
  }, [posts])

  async function handleLoadNextPage() {
    if (!nextPage) {
      return
    }

    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const results = data.results as Post[]

        const nextPosts = results.map(post => {
          return {
            ...post,
            first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR
            })
          }
        })

        setPosts([...posts, ...nextPosts])
        setNextPage(data.next_page)
      })
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={`${commonStyles.commonContainer} ${styles.container}`}>
        <img src="/svg/logo.svg" alt="logo" />

        <div className={styles.posts}>
          {postsFormatted.map(post => {

            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.postInfoContainer}>
                    <div>
                      <FiCalendar />
                      <time>{post.first_publication_date}</time>
                    </div>
                    <div>
                      <FiUser />
                      <p>{post.data.author}</p>
                    </div>
                  </div>
                </a>
              </Link>
            )
          })}

          {nextPage && (
            <button
              type="button"
              onClick={handleLoadNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </div>

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

export const getStaticProps: GetStaticProps = async ({ preview = false, previewData }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
    ref: previewData?.ref ?? null
  });

  return {
    props: {
      postsPagination: postsResponse,
      preview
    },
    revalidate: 1
  }
};
