'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { siteConfig } from './config/site.mjs'

export default defineConfig({
  basePath: '/admin',
  title: siteConfig.name,
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
  ],
})