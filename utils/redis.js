import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: 'https://precise-termite-137122.upstash.io',
  token: 'gQAAAAAAAheiAAIgcDFkNjdmNWZhNzgzOTU0NGRlYTNiOWIzMzk0NGQxYmEzNQ',
})

await redis.set("foo", "bar");
await redis.get("foo");
