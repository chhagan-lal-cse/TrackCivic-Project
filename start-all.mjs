#!/usr/bin/env node

/**
 * TrackCivic Unified Runner
 * Runs Frontend, Backend, and checks Database together on a single server port.
 */

import { spawn } from 'child_process';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const MONGO_PORT = 27017;
const MONGO_HOST = '127.0.0.1';

console.log('========================================================');
console.log('🚀 Starting TrackCivic All-In-One Unified Server');
console.log('   - Frontend: React SPA (client/dist)');
console.log('   - Backend : Express API (/api/v1)');
console.log('   - Database: MongoDB (127.0.0.1:27017)');
console.log('========================================================\n');

function checkMongoPort(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command ${command} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

async function main() {
  // 1. Check MongoDB status
  console.log('🔍 Checking MongoDB database status on 127.0.0.1:27017...');
  const isMongoRunning = await checkMongoPort(MONGO_HOST, MONGO_PORT);

  if (isMongoRunning) {
    console.log('✅ MongoDB is active and accepting connections.\n');
  } else {
    console.warn('⚠️  MongoDB does not seem to be running on port 27017.');
    console.warn('   If you have MongoDB installed as a service, start it with:');
    console.warn('   - macOS: brew services start mongodb-community');
    console.warn('   - Linux: sudo systemctl start mongod');
    console.warn('   - Docker: docker compose up mongo -d\n');
  }

  // 2. Build Frontend if client/dist is missing
  const distPath = path.resolve(__dirname, 'client/dist');
  if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log('📦 Frontend build not found. Building client into client/dist...');
    try {
      await runCommand('npm', ['run', 'build'], path.resolve(__dirname, 'client'));
      console.log('✅ Frontend build completed successfully.\n');
    } catch (err) {
      console.error('❌ Failed to build frontend:', err.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Found built frontend assets in client/dist.\n');
  }

  // 3. Start unified Node server
  console.log(`🌐 Launching unified server on http://localhost:${PORT} ...\n`);
  const serverProc = spawn('node', ['src/server.js'], {
    cwd: path.resolve(__dirname, 'server'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(PORT),
    },
  });

  const stop = () => {
    console.log('\n🛑 Stopping TrackCivic unified server...');
    serverProc.kill();
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
