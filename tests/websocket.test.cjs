const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('socket disposal cancels reconnect and listeners; instances do not share users', () => {
    const sockets = [];
    const timers = new Map();
    class Socket {
        listeners = {};
        sent = [];
        constructor() { sockets.push(this); }
        addEventListener(name, fn) { this.listeners[name] = fn; }
        send(value) { this.sent.push(value); }
        close() { this.listeners.close(); }
    }
    const sandboxModule = { exports: {} };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/hooks/websocket.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
        module: sandboxModule, exports: sandboxModule.exports, window: { WebSocket: Socket },
        setTimeout: fn => { const id = timers.size + 1; timers.set(id, fn); return id; },
        clearTimeout: id => timers.delete(id),
        require: name => name === '@constants/config' ? { Config: { WebSocketDomain: 'wss://example.test' } } : { inflate: () => '{}' },
    });
    const Wrapper = sandboxModule.exports.default;
    const first = new Wrapper();
    assert.notEqual(first, new Wrapper());
    first.connect();
    first.send({ event: 'sub', channel: 'BTC' });
    sockets[0].listeners.open();
    assert.equal(sockets[0].sent.length, 1);
    first.sendQueuedMessages();
    assert.equal(sockets[0].sent.length, 1);
    let messages = 0;
    const off = first.onMessage(() => messages++);
    sockets[0].listeners.message({ data: '{broken' });
    sockets[0].listeners.message({ data: '{}' });
    assert.equal(messages, 1);
    off();
    sockets[0].listeners.message({ data: '{}' });
    assert.equal(messages, 1);
    first.close();
    assert.equal(timers.size, 0);
    assert.equal(first.isConnected, false);
});
