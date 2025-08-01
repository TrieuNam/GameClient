import { NetData } from "./ProtocolHelper";

// Socket接口
export interface ISocket {
    onConnected: (event: Event) => void;           // 连接回调
    onMessage: (msg: NetData) => void;      // 消息回调
    onError: (event: Event) => void;               // 错误回调
    onClosed: (event: CloseEvent) => void;              // 关闭回调

    connect(options: any): any;              // 连接接口
    send(buffer: NetData): any;                  // 数据发送接口
    close(code?: number, reason?: string): any;  // 关闭接口
}