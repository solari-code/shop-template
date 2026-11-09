/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import Link from 'next/link'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'
import { dataset, projectId } from '../../../sanity/env'
import { isConfigured } from '@/lib/env'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

// The Studio only needs a Sanity project, so it stays available even when
// the shop itself runs in local mode (e.g. to set up products before Stripe).
const sanityConfigured = isConfigured(projectId) && isConfigured(dataset)

export default function StudioPage() {
  if (!sanityConfigured) return <StudioUnavailable />
  return <NextStudio config={config} />
}

function StudioUnavailable() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-base-100 px-6 font-sans font-light text-brand-content">
      <div className="max-w-lg space-y-4 text-sm leading-relaxed">
        <h1 className="text-2xl tracking-wide">Sanity Studio is not available</h1>
        <p>
          No Sanity project is configured. In local mode, the shop uses the example
          products from <code className="bg-brand-base-300 px-1">data/products.js</code>;
          edit that file to change them. Stock sold in local mode is stored
          in <code className="bg-brand-base-300 px-1">.local-data/</code>; delete that folder to reset it.
        </p>
        <p>
          To manage products in the Studio, set <code className="bg-brand-base-300 px-1">NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{' '}
          <code className="bg-brand-base-300 px-1">NEXT_PUBLIC_SANITY_DATASET</code> in <code className="bg-brand-base-300 px-1">.env.local</code> and rebuild.
        </p>
        <Link href="/" className="inline-block underline hover:text-brand-content/70 transition-colors">
          Back to the shop
        </Link>
      </div>
    </main>
  )
}
