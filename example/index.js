const
  RedisEngine = require('../src/cache/RedisEngine'),
  cache = new RedisEngine({
    duration: 120
  })

console.log(cache.write('test','test'))

cache.destroy()
