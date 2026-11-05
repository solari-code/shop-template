'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { StudioNavbar } from './sanity/components/StudioNavbar'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
  ],
})