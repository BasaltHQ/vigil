import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/posts'
import LOCATIONS from '@/lib/data/locations.json'
import { getAllCodexTerms } from '@/lib/data/codex'
import { getAllIndustries } from '@/lib/data/industries'
import { getAllComparisons } from '@/lib/data/comparisons'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vigil.basalthq.com'

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/industries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/comparisons`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/codex`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const industryEntries: MetadataRoute.Sitemap = getAllIndustries().map((ind) => ({
    url: `${baseUrl}/industries/${ind.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const comparisonEntries: MetadataRoute.Sitemap = getAllComparisons().map((comp) => ({
    url: `${baseUrl}/comparisons/${comp.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Limit to 10k locations for sitemap size limits (or chunk them, but we'll just slice for now to avoid massive file)
  const locationEntries: MetadataRoute.Sitemap = LOCATIONS.slice(0, 10000).map((loc: any) => ({
    url: `${baseUrl}/locations/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const codexEntries: MetadataRoute.Sitemap = getAllCodexTerms().map((term) => ({
    url: `${baseUrl}/codex/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries, ...industryEntries, ...comparisonEntries, ...locationEntries, ...codexEntries]
}
