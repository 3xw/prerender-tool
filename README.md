# prerender-tool
- Prerender util that generates html content ready to cache where you want ( redis / files / whatever).
- And can also create/maintain a sitemap.xml

This packages is build on top of

- puppeteer

It offers you a solid tool to crate a bin task using the power of js

1. [Install](#install)
2. [Usage](#usage)
3. [Full Examples](#examples)
- [Prerender in redis](#redis)
- [Prerender in file system](#fs)

## <a name="install"></a>Install
```sh
npm install prerender-tool
```

## <a name="usage"></a>Usage
render in redis
```js
const
{ PrerenderTool } = require('prerender-tool'),
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

### create sitemap.xml:
```js
await prerender.buildSitemap(__dirname+'/../../sitemap.xml')
```

### cache as files:
```js
const prerender = await PrerenderTool.create({
	cache: new FileEngine({prefix: __dirname+'/../tmp/'}) // we pass a file cache engine
})

//import FileEngine first: { PrerenderTool, FileEngine } = require('prerender-tool')
```
### configure nginx
pass options for [npm-redis](https://github.com/NodeRedis/node_redis#rediscreateclient):
```js
const prerender = await PrerenderTool.create({
	prefix: 'prerender:',
	duration: 3600, // 0 means forever default is 3600
	createOptions: {} // directly pass to redis client see doc
})
```

### create provide urls then parse:
```js
await prerender.setParseList({key:'', url:'https://dev.ginduvallon.ch'})
await prerender.parse()
```

do both in one:
```js
await prerender.parse({key:'', url:'https://dev.ginduvallon.ch'})
```

### provide a good sitemap and customise your urls:
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

## <a name="examples"></a>Full Examples

### <a name="redis"></a>Redis & Nginx

#### Install
```sh
npm i prerender-tool
```

#### Directory Structure
```bash
├── bin
|		└── prerender.js (your bin goes here)
├── dist (or build)
├── node_modules
├── src
├── README.md
├── package.json
└── .gitignore
```

#### bin/prerender.js
```js
#!/usr/bin/env node
const
{ PrerenderTool} = require('prerender-tool'),
moment = require('moment'),
run = async () =>
{

  const prerender = await PrerenderTool.create({
    cacheOpts:
    {
      createOptions:
      {
        host: 'redis01.aws.3xw'
      },
      prefix: 'dev.ginduvallon.ch:',
      duration: 60 * 60 * 24 * 10
    }
  })
  await prerender.parse([
    {key:'/', url:'https://dev.ginduvallon.ch'},
    {key:'/a-propos', url:'https://dev.ginduvallon.ch/a-propos'},
    {key:'/contact',url:'https://dev.ginduvallon.ch/contact'},
  ])

  await prerender.buildSitemap(__dirname+'/../dist/sitemap.xml') // or build...

  await prerender.destroy()

  process.exit(0)
}

run()
```

#### Build
```sh
bin/prerender.js
```

#### Nginx

redis with:
- [ngx_redis](https://github.com/onnimonni/redis-nginx-module)
- [ngx_headers_more](https://github.com/openresty/headers-more-nginx-module)

```nginx
server {
	listen 443;
	server_name example.com;

	ssl on;
	ssl_certificate /etc/nginx/ssl/global_self_signed/global.crt;
	ssl_certificate_key /etc/nginx/ssl/global_self_signed/global.key;

	#logs off
	access_log off;
	log_not_found off;

	# root directive should be global
	root /data01/sites/example.com/dev/example.com/dist;
	index index.html;

	# such as .htaccess, .htpasswd, .DS_Store (Mac).
	location ~ /\. {
		deny all;
	}

	# Media: images, icons, video, audio, HTC
	location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|otf|ttf|eot|woff|woff2|svgz|mp4|ogg|ogv|webm|webp|htc)$ {
		expires 1M;
		access_log off;
		add_header Vary Accept-Encoding;
		add_header Cache-Control "public";
		try_files $uri @rewrites;
	}

	## All static files will be served directly.
	location ~* ^.+\.(?:css|cur|js|xml)$ {
		expires 1M;
		access_log off;
		add_header Vary Accept-Encoding;
		add_header Cache-Control "public";
		try_files $uri @rewrites;
	}

	## All other files
	location / {
		try_files $uri @prerender;
	}

	location @prerender {

		set $prerender 0;

		if ($http_user_agent ~* "baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator") {
			set $prerender 1;
		}
		if ($args ~ "_escaped_fragment_") {
			set $prerender 1;
		}
		if ($http_user_agent ~ "Prerender") {
			set $prerender 0;
		}
		if ($uri ~ "\.(php|json|js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff)") {
			set $prerender 0;
		}

		# set redis settings  "$host:"
		set $redis_key  "$host:$request_uri";
		if ($args) {
			set $redis_key  "$host:$request_uri?$args";
		}

		if ($prerender = 1) {

			# response header
			set $custom_response_header "text/html; charset=UTF-8";

			redis_pass redis01.aws.3xw:6379;
			error_page 404 405 502 504 = @fallback;
			more_set_headers "Content-Type: $custom_response_header";
		}

		try_files $uri $uri/ @rewrites;
	}

	#try vue
	location @rewrites {
		rewrite ^(.+)$ /index.html last;
	}
}
```

### <a name="fs"></a>File System & Nginx

#### Install
```sh
npm i prerender-tool
```

#### Directory Structure

```bash
├── bin
|  └── prerender.js (your bin goes here)
├── prerender (folder for your prerendered files)
├── dist (or build)
├── node_modules
├── src
├── README.md
├── package.json
└── .gitignore
```

#### bin/prerender.js
```js
#!/usr/bin/env node
const
{ PrerenderTool, FileEngine } = require('prerender-tool'),
moment = require('moment'),
run = async () =>
{

  const prerender = await PrerenderTool.create({
    cache: new FileEngine({prefix: __dirname+'/../prerender/'})
  })
  await prerender.parse([
    {key:'/index.html', url:'https://dev.ginduvallon.ch'},
    {key:'/a-propos.html', url:'https://dev.ginduvallon.ch/a-propos'},
    {key:'/contact.html',url:'https://dev.ginduvallon.ch/contact'},
  ])

  await prerender.buildSitemap(__dirname+'/../dist/sitemap.xml') // or build...

  await prerender.destroy()

  process.exit(0)
}

run()
```

#### Build
```sh
bin/prerender.js
```

#### Nginx
```sh
TODO
```


Have fun 👌
