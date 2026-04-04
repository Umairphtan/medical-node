const redis = require("./db/redis");

async function test() {
  await redis.set("test", "Hello Redis");
  const data = await redis.get("test");

  console.log(data);
}

test();