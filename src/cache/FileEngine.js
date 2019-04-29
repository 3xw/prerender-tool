const
AbstractEngine = require('./AbstractEngine.js'),
fs = require('fs'),
chalk = require('chalk')

class FileEngine extends AbstractEngine
{
  constructor(opts)
  {
    let _opts = {
      prefix: 'tmp/',
    }
    super(Object.assign(_opts, opts))
  }

  async read(path, opts = 'utf8')
  {
    path = this.opts.prefix + path
    return new Promise((resolve, reject) => {
      fs.readFile(path, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async write(path, data, opts = 'utf8')
  {
    path = this.opts.prefix + path
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, opts, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async del(path)
  {
    path = this.opts.prefix + path
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = FileEngine
