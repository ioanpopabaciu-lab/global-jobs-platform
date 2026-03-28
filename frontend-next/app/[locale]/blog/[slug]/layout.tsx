import { Metadata } from 'next';

type Props = {
  params: { slug: string; locale: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
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

    const getLoc = (field: any) => {
      if (!field) return "";
      if (typeof field === "string") return field;
      return field[params.locale] || field.ro || Object.values(field)[0] || "";
    };

    return {
      title: `${getLoc(post.title)} | Global Jobs Consulting`,
      description: getLoc(post.excerpt),
      openGraph: {
        title: getLoc(post.title),
        description: getLoc(post.excerpt),
        url: `https://gjc.ro/${params.locale}/blog/${params.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: getLoc(post.title),
          },
        ],
        type: 'article',
        publishedTime: post.created_at,
        authors: [post.author || "Global Jobs Consulting"],
      },
      twitter: {
        card: "summary_large_image",
        title: getLoc(post.title),
        description: getLoc(post.excerpt),
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
