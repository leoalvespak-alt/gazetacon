interface ArticleSchemaProps {
  title: string
  description: string
  author: string
  publishedAt: string
  modifiedAt?: string
  imageUrl?: string
  url: string
}

export function ArticleSchema({
  title,
  description,
  author,
  publishedAt,
  modifiedAt,
  imageUrl,
  url
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    author: {
      "@type": "Person",
      name: author
    },
    publisher: {
      "@type": "Organization",
      name: "Gazeta dos Concursos",
      logo: {
        "@type": "ImageObject",
        url: "https://gazetadosconcursos.com.br/logo.png"
      }
    },
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    image: imageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
