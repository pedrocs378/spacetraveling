import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { GetStaticProps } from 'next';
import Link from 'next/link'
import Head from 'next/head';
import Prismic from '@prismicio/client'
import axios from 'axios'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function handleLoadNextPage() {
    if (!nextPage) {
      return
    }

    const response = await axios.get(postsPagination.next_page)
    const results = response.data.results as Post[]

    const nextPosts = results.map(post => {
      return {
        ...post,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR
        })
      }
    })

    setPosts([...posts, ...nextPosts])
    setNextPage(response.data.next_page)
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={`${commonStyles.commonContainer} ${styles.container}`}>
        <img src="/svg/logo.svg" alt="logo" />

        <div className={styles.posts}>
          {posts.map(post => {

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
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        ...post,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR
        })
      }
    })
  }

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30
  }
};
