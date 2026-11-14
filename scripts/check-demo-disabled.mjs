// 仅启动/停止本脚本创建的本机进程，验证正式运行默认关闭 Demo。
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
    env: { ...process.env, SSR_DEMOS_ENABLED: 'false' }, stdio: 'ignore',
});
const exited = once(child, 'exit');
try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
        if (child.exitCode !== null) throw new Error('Temporary verification server exited');
        try {
            const response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
            await response.arrayBuffer();
            if (response.ok) { ready = true; break; }
        } catch {}
        await delay(100);
    }
    assert.ok(ready, 'Temporary verification server did not start');
    for (const path of ['/demos/ssr', '/ko/demos/ssr']) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, { signal: AbortSignal.timeout(5000) });
        assert.equal(response.status, 404, path);
        await response.arrayBuffer();
    }
    console.log('PASS: Demo flag disabled — English and Korean URLs return HTTP 404');
} finally {
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    try { await exited; } finally { clearTimeout(timer); }
}
