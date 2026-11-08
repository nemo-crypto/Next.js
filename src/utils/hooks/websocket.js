import { Config } from '@constants/config';
import { inflate } from 'pako';

class WebSocketWrapper {
    constructor() {
        if (WebSocketWrapper.instance) {
            return WebSocketWrapper.instance;
        };

        this.url = Config.WebSocketDomain || '';
        this.socket = null;
        this.isConnected = false; // socket连接状态
        this.messageListeners = []; // 接受WS返回消息
        this.messageQueue = []; // 消息队列
        this.reconnectInterval = 3000; // 重连间隔时间（毫秒）

        WebSocketWrapper.instance = this;
    };

    connect() {
        if (!this.url) {
            this.triggerConnectionEvent(false);
            return;
        };
        if (this.socket) {
            return; // 已经连接，不执行重复连接
        };

        // 如果 WebSocket 实例已存在，先关闭它
        const BrowserWebSocket = window.WebSocket || window.MozWebSocket;
        this.socket = new BrowserWebSocket(this.url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.addEventListener('open', () => {
            this.isConnected = true;

            // 触发连接成功事件
            this.triggerConnectionEvent(true);

            // 连接建立后发送消息队列中的消息
            this.sendQueuedMessages();
        });

        this.socket.addEventListener('close', () => {
            this.isConnected = false;
            this.socket = null;

            // 触发连接关闭事件
            this.triggerConnectionEvent(false);

            // 断线重连
            this.reconnect();
        });

        this.socket.addEventListener('message', (event) => {
            const ua = new Uint8Array(event.data);
            const json = inflate(ua, { to: "string" });
            const message = JSON.parse(json);

            // 发送pong消息 保持连接
            if (message?.ping) {
                this.send({
                    pong: message.ping
                });
            };

            // 触发消息事件，传递消息给组件
            this.triggerMessageEvent(message);
        });
    };
  
    send(message) {
        if (this.isConnected) {
            this.socket.send(JSON.stringify(message));
        } else {
            // 如果未连接，将消息加入队列
            if (message.event === 'sub') {
                this.messageQueue.push(message);
            };
        };
    };
  
    onConnectionChange(callback) {
        this.connectionChangeCallback = callback;
    };

    onMessage(callback) {
        this.messageListeners.push(callback);
    };

    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        };
    };
  
    triggerConnectionEvent(isConnected) {
        if (typeof this.connectionChangeCallback === 'function') {
            this.connectionChangeCallback(isConnected);
        };
    };
  
    triggerMessageEvent(message) {
        this.messageListeners.forEach(listener => listener(message));
    };

    sendQueuedMessages() {
        const subEvnet = this.messageQueue;
        for(let i = 0; i < subEvnet.length; i++) {
            this.socket.send(JSON.stringify(subEvnet[i]));
        };
    };
  
    reconnect() {
        if (!this.isConnected) {
            setTimeout(() => this.connect(), this.reconnectInterval);
        };
    };
};

export default WebSocketWrapper;
