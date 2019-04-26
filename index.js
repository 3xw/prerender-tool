const
chalk = require('chalk'),
RedisEngine = require('./src/cache/RedisEngine.js'),
puppeteer = require('puppeteer')

/*
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //await page.goto('http://3xw.ch', {waitUntil: 'networkidle2'});
  //await page.screenshot({path: '3xw.ch.png'});


  await page.goto('http://localhost:8888/solvalor.ch/factsheet/2019/1/RIRS', {waitUntil: 'networkidle2'});
  await page.pdf({path: 'test.pdf', format: 'A4'});

  await browser.close();
})();
*/

class PrerenderTool
{
  static async create(opts = {})
  {
    const prerender = new PrerenderTool(opts)
    await prerender.launchEngines()
    return prerender
  }

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

  async destroy()
  {
    await this.browser.close()
    this.cache.destroy()
    console.log(chalk.magentaBright(' - PrerenderTool destroyed'))
  }

  async launchEngines()
  {
    this._launchCache()
    await this._launchBrowser()
  }

  _launchCache()
  {
    if(!this.opts.cache) this.cache = new RedisEngine(this.cacheOpts)
    else this.cache = this.opts.cache
    console.log(chalk.magentaBright(' - Prerender',this.cache.constructor.name,'launched'))
  }

  async _launchBrowser()
  {
    this.browser = await puppeteer.launch();
    const page = await this.browser.newPage();
    console.log(chalk.magentaBright(' - Prerender',this.browser.constructor.name,'launched'))

    //await page.goto('http://3xw.ch', {waitUntil: 'networkidle2'});
    //await page.screenshot({path: '3xw.ch.png'});

    /*
    await page.goto('http://localhost:8888/solvalor.ch/factsheet/2019/1/RIRS', {waitUntil: 'networkidle2'});
    await page.pdf({path: 'test.pdf', format: 'A4'});

    await browser.close();
    */
  }

  setParseList(list = [])
  {
    this.parseList = list
  }
}

module.exports = PrerenderTool
