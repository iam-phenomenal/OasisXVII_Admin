import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rate:login",
});
