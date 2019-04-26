# prerender-tool
- Prerender util that generates html content ready to cache where you want ( redis / files / whatever).
- And can also create/maintain a sitemap.xml

This packages is build on top of

- puppeteer

It offers you a solid toll to crate bin taks using the power of js

## Install

	npm install prerender-tool


## use
render in redis
```js
const
{ PrerenderTool } = require('prerender-tool.js'),
run = async () =>
{
	//the class
  const prerender = await PrerenderTool.create()

	// parse urls
  await prerender.parse([
		{key:'index.html', url:'https://ginduvallon.ch'},
    {key:'/a-propos.html', url:'https://ginduvallon.ch/a-propos'},
  ])

	// and go sleep
  await prerender.destroy()
}

// run code!
run()
```

create sitemap.xml:
```js
	await prerender.buildSitemap(__dirname+'/../../sitemap.xml')
```

cache as files:
```js
const prerender = await PrerenderTool.create({
	cache: new FileEngine({prefix: __dirname+'/../tmp/'}) // we pass a file cache engine
})

//import FileEngine first: { PrerenderTool, FileEngine } = require('prerender-tool.js')
```

create provide urls then parse:
```js
	await prerender.setParseList({key:'', url:'https://dev.ginduvallon.ch'})
	await prerender.parse()
```

do both in one:
```js
	await prerender.parse({key:'', url:'https://dev.ginduvallon.ch'})
```

provide a good sitemap and customise your urls:
```js
	await prerender.parse({

		// min required
		key:'index.html',
		url:'https://dev.ginduvallon.ch',

		// site map
		// see https://www.npmjs.com/package/xmlbuilder for syntax and https://www.sitemaps.org/protocol.html
		sitemap:
		{
			priority:
			{
				'#text':1
			},
			changefreq:
			{
				'#text':'monthly'
			},
			lastmod:
			{
				'#text':moment().format('YYYY-MM-DD')
			}
		}

		// parser options
		// see https://github.com/GoogleChrome/puppeteer/blob/v1.15.0/docs/api.md#pagegotourl-options
		opts:
		{
			waitUntil: 'networkidle2'
		},
	})

	await prerender.buildSitemap(__dirname+'/../../sitemap.xml')
```

full example:

```js
const
{ PrerenderTool, FileEngine, RedisEngine } = require('prerender-tool.js'),
moment = require('moment'),
run = async () =>
{

  const prerender = await PrerenderTool.create({
    cacheOpts:
    {
      prefix: 'dev.ginduvallon.ch:',
      duration: 120
    }
  })
  await prerender.parse([

		{key:'', url:'https://dev.ginduvallon.ch'},
    {key:'/a-propos', url:'https://dev.ginduvallon.ch/a-propos'},
		{key:'/contact',url:'https://dev.ginduvallon.ch/contact'},
  ])

  await prerender.buildSitemap(__dirname+'/../../sitemap.xml')

  await prerender.destroy()
}

run()
```

Have fun 👌
