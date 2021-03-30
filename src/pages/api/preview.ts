import { NextApiRequest, NextApiResponse } from "next";
import { Document } from '@prismicio/client/types/documents';

import { getPrismicClient } from "../../services/prismic";

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export const Preview = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: ref, documentId } = req.query;
  const prismic = getPrismicClient()

  const redirectUrl = prismic
    .getPreviewResolver(ref as string, documentId as string)
    .resolve(linkResolver, '/')

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  res.setPreviewData({ ref })
  res.writeHead(302, { Location: `${redirectUrl}` })
  res.end()
}
