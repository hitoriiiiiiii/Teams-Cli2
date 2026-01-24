#!/usr/bin/env ts-node

/**
 * Quick Redis connectivity test
 * Run: npx ts-node test-redis.ts
 */

import { initRedis, getRedisClient, closeRedis } from './src/api/redis';

async function testRedis() {
  console.log('🔍 Testing Redis Connection...\n');

  try {
    // Initialize Redis
    const redis = await initRedis();

    if (!redis) {
      console.log('❌ Failed to connect to Redis');
      process.exit(1);
    }

    console.log('✅ Connected to Redis\n');

    // Test 1: Simple PING
    console.log('Test 1: PING command');
    const pong = await redis.ping();
    console.log(`   Response: ${pong}\n`);

    // Test 2: Set a value
    console.log('Test 2: Setting a test value');
    await redis.set('test-key', 'test-value');
    console.log(`   ✅ Set test-key = test-value\n`);

    // Test 3: Get the value
    console.log('Test 3: Getting the value');
    const value = await redis.get('test-key');
    console.log(`   Retrieved: test-key = ${value}\n`);

    // Test 4: Rate limiting simulation
    console.log('Test 4: Simulating rate limiting');
    for (let i = 1; i <= 5; i++) {
      const count = await redis.incr('test-ratelimit:user123');
      console.log(`   Request ${i}: count = ${count}`);
    }

    // Test 5: Check TTL
    console.log('\nTest 5: Setting key with expiration');
    await redis.set('temp-key', 'expires-in-10s', { EX: 10 });
    const ttl = await redis.ttl('temp-key');
    console.log(`   ✅ Set temp-key with TTL: ${ttl} seconds\n`);

    // Test 6: Server info
    console.log('Test 6: Redis Server Info');
    const info = await redis.info();
    const lines = info.split('\r\n').slice(0, 5);
    lines.forEach(line => console.log(`   ${line}`));

    // Cleanup
    console.log('\n🧹 Cleaning up test keys...');
    await redis.del('test-key');
    await redis.del('test-ratelimit:user123');
    await redis.del('temp-key');
    console.log('   ✅ Cleanup complete\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ All Redis tests passed!');
    console.log('✅ Redis is working properly');
    console.log('═══════════════════════════════════════\n');

    await closeRedis();
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis Test Failed:', error);
    process.exit(1);
  }
}

testRedis();
