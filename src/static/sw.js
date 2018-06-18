importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "voxel-royal-client",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/app.67bd89072169b5a92388.js",
    "revision": "34448c6a2d179f5f32f56fc69f42e85e"
  },
  {
    "url": "/_nuxt/db1aa2162427b65e20e7.worker.js",
    "revision": "282ec8d7ac649d5b928e985464482f51"
  },
  {
    "url": "/_nuxt/f35fe147853f7a73b9cc.worker.js",
    "revision": "23db9bfee507678d6c170861b0ce769a"
  },
  {
    "url": "/_nuxt/layouts_default.1dbf5ba97e30be97e894.js",
    "revision": "a34445b969ad80420f0b6c092b559bf0"
  },
  {
    "url": "/_nuxt/manifest.0f4f91db70b00c17bf5e.js",
    "revision": "4569eda74b947974e7c8c423c2051c67"
  },
  {
    "url": "/_nuxt/pages/game-page.62bf7103bec0282b7dd9.js",
    "revision": "857a92462d0073ab6eedacb40d1e77aa"
  },
  {
    "url": "/_nuxt/vendor.9e43d0fd2898bdff7751.js",
    "revision": "427def1818ca4eb386dadd9910bc9593"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

