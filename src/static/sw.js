importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "voxel-royal-client",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/app.d4abd8bececaea49b762.js",
    "revision": "3d54e9ca1bd51e63aeb901e9f24c6079"
  },
  {
    "url": "/_nuxt/components/royal-game.953abe8f805678071fa2.js",
    "revision": "c56b3dfdcc9f9d99345e52400e5a801a"
  },
  {
    "url": "/_nuxt/e70dc88b21e49d20456c.worker.js",
    "revision": "282ec8d7ac649d5b928e985464482f51"
  },
  {
    "url": "/_nuxt/f35fe147853f7a73b9cc.worker.js",
    "revision": "23db9bfee507678d6c170861b0ce769a"
  },
  {
    "url": "/_nuxt/layouts_default.9b9a5014b6a611afafdf.js",
    "revision": "7f0accfb7f45db590583f4b82c58fe4d"
  },
  {
    "url": "/_nuxt/manifest.2eba9997596849165313.js",
    "revision": "942c9ac370a3a8467503b45aa22a7ac5"
  },
  {
    "url": "/_nuxt/pages/index-page.eaf998808a6dee54bbdc.js",
    "revision": "4d0d4b7bbf23584f1379f39973d364eb"
  },
  {
    "url": "/_nuxt/vendor.63ff91d94094e1e1ed64.js",
    "revision": "135c67d2cf5ecc114eda2364e20c00cd"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

