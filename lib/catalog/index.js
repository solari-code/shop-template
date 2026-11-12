import 'server-only'
import { isLocalMode } from '@/lib/shopMode'
import * as sanityCatalog from './sanity'
import * as localCatalog from './local'

// The product data source for the current shop mode. Both provide the
// same functions with the same return shapes: getProducts,
// getProductsByCategory, getProductBySlug, getActiveCategories,
// getProductsByProductIds, getProductByProductId and decrementStock.
export function getCatalog() {
    return isLocalMode() ? localCatalog : sanityCatalog
}
