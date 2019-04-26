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
    console.log(chalk.red('E - ', err))
    return this
  }

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
    return true
  }
}

module.exports = AbstractEngine
