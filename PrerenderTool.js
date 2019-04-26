const
chalk = require('chalk'),
RedisEngine = require('./src/cache/RedisEngine.js'),
FileEngine = require('./src/cache/FileEngine.js'),
puppeteer = require('puppeteer'),
builder = require('xmlbuilder')

class PrerenderTool
{
  constructor(opts)
  {
    let _opts = {
      parseList: [],
      cache: null,
      cacheOpts:
      {
        duration: 3600
      }
    }
    this.opts = Object.assign(_opts, opts)
    this.parseList = this.opts.parseList
  }

  static async create(opts = {})
  {
    const prerender = new PrerenderTool(opts)
    await prerender.launchEngines()
    return prerender
  }

  async destroy()
  {
    await this.browser.close()
    this.cache.destroy()
    this.fileEngine.destroy()
    console.log(chalk.magentaBright(' - PrerenderTool destroyed'))
  }

  async launchEngines()
  {
    this.fileEngine = new FileEngine({prefix:''});
    this._launchCache()
    await this._launchBrowser()
  }

  _launchCache()
  {
    if(!this.opts.cache) this.cache = new RedisEngine(this.opts.cacheOpts)
    else this.cache = this.opts.cache
    console.log(chalk.magentaBright(' - Prerender',this.cache.constructor.name,'launched'))
  }

  async _launchBrowser()
  {
    this.browser = await puppeteer.launch();
    console.log(chalk.magentaBright(' - Prerender',this.browser.constructor.name,'launched'))
  }

  setParseList(list = [])
  {
    this.parseList = list
  }

  async parse(list = [])
  {
    this.parseList = this.parseList.concat(list)
    let page = await this.browser.newPage()

    for(let i in this.parseList)
    {
      let url = this.parseList[i]
      console.log(chalk.magentaBright(' - Parse',url.url))

      await page.goto(url.url, Object.assign({}, url.opts))
      try
      {
        if(this.cache.write.constructor.name === 'AsyncFunction') await this.cache.write(url.key, await page.content())
        else this.cache.write(url.key, await page.content())
      } catch (e) { this.cache.error(e) }
    }

    await page.close()
  }

  async buildSitemap(path, list = [])
  {
    this.parseList = this.parseList.concat(list)

    //
    let urlset = builder.create({
      urlset: {
        '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9'
      }
    }, { version: '1.0',  encoding: 'UTF-8' })

    for(let i in this.parseList)
    {
      let url = this.parseList[i]
      let ele = {url:Object.assign({loc:{'#text': url.url}}, url.sitemap)}
      urlset.ele(ele)
    }

    console.log(chalk.magentaBright(' - Parse create site map at',path))
    this.fileEngine.write(path, urlset.end({ pretty: true }))
  }
}

module.exports = { PrerenderTool, FileEngine, RedisEngine }
