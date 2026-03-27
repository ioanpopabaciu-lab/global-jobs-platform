import { Metadata } from 'next';

type Props = {
  params: { slug: string; locale: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = "https://global-jobs-platform-production.up.railway.app/api";
  
  try {
    let post = null;
    const res = await fetch(`${baseUrl}/v1/gjc/blog/posts/${params.slug}`);
    if (!res.ok) {
      const res2 = await fetch(`${baseUrl}/blog/posts/${params.slug}`);
      if (res2.ok) {
        post = await res2.json();
      }
    } else {
      post = await res.json();
    }

    if (!post) {
      return {
        title: "Articol negăsit - Global Jobs Consulting",
      };
    }

    const imageUrl = post.image_url 
      ? (post.image_url.startsWith('http') ? post.image_url : `https://gjc.ro${post.image_url}`)
      : "https://gjc.ro/images/logo_gjc.png";

    return {
      title: `${post.title} | Global Jobs Consulting`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `https://gjc.ro/${params.locale}/blog/${params.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        type: 'article',
        publishedTime: post.created_at,
        authors: [post.author || "Global Jobs Consulting"],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [imageUrl],
      }
    };
  } catch (error) {
    return {
      title: "Blog | Global Jobs Consulting",
    };
  }
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
