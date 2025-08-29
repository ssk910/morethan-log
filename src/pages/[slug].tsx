import Detail from "src/routes/Detail"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "src/routes/Error"
import { getRecordMap, getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { GetStaticProps } from "next"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "src/hooks/usePostQuery"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  try {
    const posts = await getPosts()
    console.log('All posts:', posts.length)
    
    const filteredPost = filterPosts(posts, filter)
    console.log('Filtered posts:', filteredPost.length)
    console.log('Post IDs:', filteredPost.map(p => ({ slug: p.slug, id: p.id })))

    return {
      paths: filteredPost.map((row) => `/${row.slug}`),
      fallback: 'blocking',
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    return {
      paths: [],
      fallback: 'blocking',
    }
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  try {
    const slug = context.params?.slug

    if (!slug) {
      return {
        notFound: true,
      }
    }

    const posts = await getPosts()
    const feedPosts = filterPosts(posts)
    await queryClient.prefetchQuery({
      queryKey: queryKey.posts(),
      queryFn: () => feedPosts
    })

    const detailPosts = filterPosts(posts, filter)
    const postDetail = detailPosts.find((t: any) => t.slug === slug)
    
    // 더 엄격한 검증
    if (!postDetail) {
      console.log(`Post not found for slug: ${slug}`)
      return {
        notFound: true,
      }
    }

    if (!postDetail.id) {
      console.log(`Post id is missing for slug: ${slug}`, postDetail)
      return {
        notFound: true,
      }
    }

    console.log(`Processing post: ${slug}, id: ${postDetail.id}`)
    const recordMap = await getRecordMap(postDetail.id)

    await queryClient.prefetchQuery({
      queryKey: queryKey.post(`${slug}`),
      queryFn: () => ({
        ...postDetail,
        recordMap,
      })
    })

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
      revalidate: CONFIG.revalidateTime,
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      notFound: true,
    }
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const image =
    post.thumbnail ??
    CONFIG.ogImageGenerateURL ??
    `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`

  const date = post.date?.start_date || post.createdTime || ""

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || "",
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
