const
AbstractEngine = require('./AbstractEngine.js'),
redis = require("redis"),
chalk = require('chalk')

class RedisEngine extends AbstractEngine
{
  constructor(opts)
  {
    let _opts = {
      prefix: 'prerender:',
      duration: 3600,
      createOptions: {}
    }
    super(Object.assign(_opts, opts))
    this.setDuration(this.opts.duration)
    this.client = redis.createClient(this.opts.createOptions)
    this.client.on('error', this.error)
  }

  destroy()
  {
    this.client.quit()
    this.client = null
    console.log(chalk.magentaBright(' - RedisEngine destroyed'))
    return true
  }

  read(key)
  {
    return this.client.get(key)
  }

  write(key, value)
  {
    key = this.opts.prefix + key
    if(this.duration == 0) return this.client.set(key, value)
    return this.client.set(key, value, 'EX', this.duration)
  }

  del(key)
  {
    key = this.opts.prefix + key
    return this.client.del(key)
  }

  clear(check)
  {
    return this.client.del(this.opts.prefix)
  }
}

module.exports = RedisEngine
