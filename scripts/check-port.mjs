#!/usr/bin/env bun
/**
 * Quick test: Can we reach Metro from localhost?
 * If this works but phone doesn't → firewall issue
 */

console.log('\n🔍 Testing Metro Bundler connectivity...\n');

try {
    const response = await fetch('http://localhost:8081/status', {
        signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
        console.log('✅ Metro is running on localhost:8081');
        console.log('\n📱 Now test from your PHONE browser:');
        console.log('   http://172.16.115.247:8081');
        console.log('\n   ✓ If it works → Firewall is OK');
        console.log('   ✗ If it times out → Run fix-firewall.bat as Administrator\n');
    }
} catch (error) {
    console.log('❌ Metro is not running or not responding');
    console.log('   Make sure "bun run dev" is running first\n');
}
