const chalk = require('chalk')

class AbstractEngine
{

  constructor(opts = {})
  {
    this.duration = 0
    this.opts = opts
  }

  setDuration(duration)
  {
    this.duration = duration
    return this
  }

  error(err)
  {
    console.log(chalk.red(' E',this.constructor.name+' -', err))
    return this
  }

  read(key){}

  write(key, value)
  {
    return true
  }

  writeMany(data)
  {
    r = {}
    for(i in data) r[i] = this.write(i, data[i])
    return r
  }

  del(key)
  {
    return true
  }

  clear(check)
  {
    return true
  }

  delMany(keys)
  {
    r = {}
    for(i in keys) r[i] = this.del(keys[i])
    return r
  }

  destroy()
  {
    console.log(chalk.magentaBright(' -',this.constructor.name,'destroyed'))
    return true
  }
}

module.exports = AbstractEngine
