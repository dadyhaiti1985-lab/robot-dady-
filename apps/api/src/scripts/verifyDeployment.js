#!/usr/bin/env node
/**
 * verifyDeployment.js — Run after deployment to verify all services.
 * Usage: node apps/api/src/scripts/verifyDeployment.js
 */

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const API_URL = 'http://localhost:3001';

async function check(name, fn) {
  try {
    const ok = await fn();
    console.log(`${ok ? '✅' : '❌'} ${name}`);
    return ok;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    return false;
  }
}

async function verifyDeployment() {
  console.log('Starting deployment verification...\n');

  const results = await Promise.all([
    check('PocketBase reachable', async () => {
      const res = await fetch(`${POCKETBASE_URL}/api/health`);
      return res.ok;
    }),

    check('Express API reachable', async () => {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    }),

    check('System health endpoint', async () => {
      const res = await fetch(`${API_URL}/system-health`);
      return res.status < 500;
    }),

    check('ENCRYPTION_KEY set', async () => Boolean(process.env.ENCRYPTION_KEY)),

    check('POCKETBASE_URL set', async () => Boolean(process.env.POCKETBASE_URL)),

    check('NODE_ENV set', async () => Boolean(process.env.NODE_ENV)),
  ]);

  const allPassed = results.every(Boolean);
  console.log(`\n${allPassed ? '✅ DEPLOYMENT VERIFIED' : '⚠️  DEPLOYMENT HAS ISSUES — check above'}`);
  process.exit(allPassed ? 0 : 1);
}

verifyDeployment();
