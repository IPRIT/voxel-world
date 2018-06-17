importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "voxel-royal-client",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/app.934a7d453435cbb0292c.js",
    "revision": "ef061f5d18c3c67affe8c4a6436ac7a8"
  },
  {
    "url": "/_nuxt/d1977b072036d54b261f.worker.js",
    "revision": "282ec8d7ac649d5b928e985464482f51"
  },
  {
    "url": "/_nuxt/f35fe147853f7a73b9cc.worker.js",
    "revision": "23db9bfee507678d6c170861b0ce769a"
  },
  {
    "url": "/_nuxt/layouts_default.b3ff4383d7b47d48b960.js",
    "revision": "d329e0b57c3a5f49b8f16e16811f1b3e"
  },
  {
    "url": "/_nuxt/manifest.b58ad747c55752f00aae.js",
    "revision": "8999fbfee4d7199c382dc9acadf866ee"
  },
  {
    "url": "/_nuxt/pages/game-page.0d4804e15f110f0aed9e.js",
    "revision": "327b7cf65e0fe6e844400f43c63fd064"
  },
  {
    "url": "/_nuxt/vendor.9e43d0fd2898bdff7751.js",
    "revision": "427def1818ca4eb386dadd9910bc9593"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

