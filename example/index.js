#!/usr/bin/env node

const
{ PrerenderTool, FileEngine, RedisEngine } = require('../PrerenderTool.js'),
moment = require('moment'),
run = async () =>
{

  const prerender = await PrerenderTool.create({
    //cache: new FileEngine({prefix: __dirname+'/../prerender/'}), if you prefer file cache...
    cacheOpts:
    {
      prefix: 'dev.ginduvallon.ch:',
      duration: 120
    }
  })
  await prerender.parse([
    {key:'', url:'https://dev.ginduvallon.ch'},
    {key:'/a-propos', url:'https://dev.ginduvallon.ch/a-propos'},
    {
      key:'/contact',
      url:'https://dev.ginduvallon.ch/contact',
      opts: // see https://github.com/GoogleChrome/puppeteer/blob/v1.15.0/docs/api.md#pagegotourl-options
      {
        waitUntil: 'networkidle2'
      },
      sitemap: // see https://www.npmjs.com/package/xmlbuilder for syntax and https://www.sitemaps.org/protocol.html
      {
        priority:{'#text':1},
        changefreq:{'#text':'monthly'},
        lastmod:{'#text':moment().format('YYYY-MM-DD')}
      }
    },
  ])

  await prerender.buildSitemap(__dirname+'/../../sitemap.xml')

  await prerender.destroy()
}

run()
