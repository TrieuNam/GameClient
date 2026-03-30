import { sys } from "cc";
import { ISocket } from "./ISocket";
import { NetData } from "./ProtocolHelper";

export class WebSock implements ISocket {
    private _ws: WebSocket = null;              // websocket对象
    private sendFunc: Function;
    onConnected: (event: Event) => void = null;
    onMessage: (msg: NetData) => void = null;
    onError: (event: Event) => void = null;
    onClosed: (event: CloseEvent) => void = null;
    constructor() {
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            this.sendFunc = this.sendWx.bind(this);
        } else {
            this.sendFunc = this.sendNormal.bind(this);
        }
    }
    connect(options: any) {
        if (this._ws) {
            this._ws.close();
            this._ws = null;
            // if (this._ws.readyState === WebSocket.CONNECTING) {
            //     console.log("websocket connecting, wait for a moment...")
            //     return false;
            // }
        }

        let url = null;
        if (options.url) {
            url = options.url;
        } else {
            let host = options.host;
            let port = options.port;
            // Nếu host đã là full URL (ws:// hoặc wss://) thì dùng nguyên
            if (host.toString().startsWith("ws://") || host.toString().startsWith("wss://")) {
                url = `${host}:${port}`;
            } else {
                url = `ws://${host}:${port}/websocket-server/ws/game`;
            }
        }

        // Đính kèm session token vào query string để gateway xác thực
        if (options.token) {
            const sep = url.includes("?") ? "&" : "?";
            url = `${url}${sep}token=${encodeURIComponent(options.token)}`;
        }

        this._ws = new WebSocket(url);
        this._ws.binaryType = options.binaryType ? options.binaryType : "arraybuffer";
        this._ws.onmessage = (event) => {
            this.onMessage(event.data);
        };
        this._ws.onopen = this.onConnected;
        this._ws.onerror = this.onError;
        this._ws.onclose = this.onClosed;
        return true;
    }
    send(buffer: NetData): boolean {
        return this.sendFunc(buffer);
    }

    sendNormal(buffer: NetData): boolean {
        if (this._ws.readyState == WebSocket.OPEN) {
            this._ws.send(buffer);
            return true;
        }
        return false;
    }

    sendWx(buffer: NetData): boolean {
        if (this._ws.readyState == WebSocket.OPEN) {
            this._ws.send(buffer.buffer);
            return true;
        }
        return false;
    }

    close(code?: number, reason?: string) {
        this._ws.close();
    }
}