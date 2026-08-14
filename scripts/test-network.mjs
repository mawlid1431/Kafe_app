#!/usr/bin/env bun
/**
 * Test if your phone can reach your PC on the local network
 * Run this while dev server is running: bun scripts/test-network.mjs
 */
import os from 'node:os';

const METRO_PORT = 8081;

console.log('\n📱 Network Connectivity Test\n');

// Show all network interfaces
console.log('Your PC Network Addresses:');
console.log('─'.repeat(50));

const interfaces = os.networkInterfaces();
for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log(`${name}: ${addr.address}`);
        }
    }
}

console.log('\n');
console.log('🔍 Troubleshooting Checklist:');
console.log('─'.repeat(50));
console.log('1. Is your phone on the SAME Wi-Fi network?');
console.log('   (Not mobile data, not guest network)');
console.log('');
console.log('2. Can you access this URL from your phone browser?');
console.log(`   http://172.16.115.247:${METRO_PORT}`);
console.log('   (Should show "React Native packager is running")');
console.log('');
console.log('3. Windows Firewall blocking?');
console.log('   Run: scripts\\allow-firewall.ps1 (as Administrator)');
console.log('');
console.log('4. Still not working? Use tunnel mode:');
console.log('   Ctrl+C → bun run dev -- --tunnel');
console.log('');
