const
PrerenderTool = require('../index.js')



;(async () => {

  const prerender = await PrerenderTool.create()
  await prerender.destroy()
})()
