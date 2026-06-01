const { Redis } = require('@upstash/redis');
require('dotenv').config();

const OneTimeStore = () => {
  const redis = new Redis({
    url: 'https://precise-termite-137122.upstash.io',
    token: process.env.REDIS_API_KEY,
  })
}

// await redis.set("foo", "bar");
// await redis.get("foo");
module.exports = { OneTimeStore };
