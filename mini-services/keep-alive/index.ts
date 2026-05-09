// Keep-alive service: pings Next.js dev server every 5s to prevent sandbox timeout
const DEV_URL = 'http://localhost:3000';

async function ping() {
  try {
    const res = await fetch(DEV_URL, { method: 'GET', signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      console.log(`[${new Date().toISOString()}] ✅ Next.js alive (${res.status})`);
    } else {
      console.log(`[${new Date().toISOString()}] ⚠️ Next.js responded ${res.status}`);
    }
  } catch (err) {
    console.log(`[${new Date().toISOString()}] ❌ Next.js unreachable — will restart`);
    // Try to restart Next.js
    const { spawn } = await import('child_process');
    spawn('npx', ['next', 'dev', '-p', '3000'], {
      cwd: '/home/z/my-project',
      stdio: 'inherit',
      detached: true,
    }).unref();
  }
}

// Start pinging
console.log('Keep-alive service started — pinging Next.js every 5s');
setInterval(ping, 5000);
ping();

// Also serve a simple health endpoint
const server = Bun.serve({
  port: 3001,
  fetch() {
    return new Response('OK', { status: 200 });
  },
});
console.log(`Health check on port ${server.port}`);
