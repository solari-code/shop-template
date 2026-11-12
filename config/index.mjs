// All shop settings in one object. The files next to this one are the
// place to set up a new shop; run `npm run check-config` after editing.
//
// Config files are .mjs and use relative imports with file extensions, so
// Node can load them directly (next.config.mjs, the config check, tests).

import { siteConfig } from './site.mjs'
import { commerceConfig } from './commerce.mjs'
import { shippingOptions, shippingCountries } from './shipping.mjs'
import { themeConfig } from './theme.mjs'
import { homepageSections } from './homepage.mjs'
import { pagesConfig, navigation, footerConfig } from './pages.mjs'
import { textsConfig } from './texts.mjs'
import { wishlistConfig } from './wishlist.mjs'

export const shopConfig = {
    site: siteConfig,
    commerce: commerceConfig,
    shipping: { options: shippingOptions, countries: shippingCountries },
    theme: themeConfig,
    homepage: homepageSections,
    pages: pagesConfig,
    navigation,
    footer: footerConfig,
    texts: textsConfig,
    wishlist: wishlistConfig,
}
