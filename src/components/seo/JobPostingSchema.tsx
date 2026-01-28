interface JobPostingSchemaProps {
  title: string
  description: string
  orgao: string
  datePosted: string
  validThrough?: string
  salaryMin?: number
  salaryMax?: number
  city?: string
  state?: string
  url: string
}

export function JobPostingSchema({
  title,
  description,
  orgao,
  datePosted,
  validThrough,
  salaryMin,
  salaryMax,
  city,
  state,
  url
}: JobPostingSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: title,
    description: description,
    datePosted: datePosted,
    hiringOrganization: {
      "@type": "GovernmentOrganization",
      name: orgao,
      sameAs: url
    },
    employmentType: "FULL_TIME",
    jobLocationType: city ? undefined : "TELECOMMUTE",
    directApply: false,
    identifier: {
      "@type": "PropertyValue",
      name: orgao,
      value: url
    }
  }

  // Adicionar salário se disponível
  if (salaryMin || salaryMax) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "BRL",
      value: {
        "@type": "QuantitativeValue",
        minValue: salaryMin,
        maxValue: salaryMax || salaryMin,
        unitText: "MONTH"
      }
    }
  }

  // Adicionar localização se disponível
  if (city || state) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: state,
        addressCountry: "BR"
      }
    }
  }

  // Data de validade (inscrições)
  if (validThrough) {
    schema.validThrough = validThrough
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
