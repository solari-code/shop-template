import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '../env'
import { isConfigured } from '@/lib/env'

// Clients are created on first use, so the app can be built and run
// without a Sanity project (local mode never calls these).

function assertSanityConfigured() {
  if (!isConfigured(projectId) || !isConfigured(dataset)) {
    throw new Error('Sanity is not configured: set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET, or run the shop with SHOP_MODE=local.')
  }
}

let client
export function getClient() {
  if (!client) {
    assertSanityConfigured()
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  }
  return client
}

let writeClient
export function getWriteClient() {
  if (!writeClient) {
    assertSanityConfigured()
    writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    })
  }
  return writeClient
}

let builder
export function urlFor(source) {
  if (!builder) {
    assertSanityConfigured()
    builder = imageUrlBuilder({ projectId, dataset })
  }
  return builder.image(source)
}
