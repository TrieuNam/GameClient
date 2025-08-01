import { BaseProtocolHelper } from "core/net/BaseProtocolHelper";
import { NetConnectOptions, NetNode } from "core/net/NetNode";
import { WebSock } from "core/net/WebSock";
import { Singleton } from "core/Singleton";
import { DataManager } from "./DataManager";


export class NetManager extends Singleton {

    private _netNode: NetNode = null;

    public Init() {
        let self = this;
        self._netNode = new NetNode()
        self._netNode.Init(new WebSock(), new BaseProtocolHelper())
        //self.connectServer()
    }

    public ConnectServer(host: string, port: number, callBack: (suc:boolean,opt:NetConnectOptions)=>void, autoReconnect:number = 10): void {
        let self = this;
        const _host = host;
        const _port = port;
        self._netNode.Connect({ host: _host, port: _port, autoReconnect: autoReconnect }, callBack)
    }

    public DisconnectServer(): void {
        DataManager.Inst().onDestroy();
        this._netNode.CloseSocket();
    }

    public NetNodeStateClosed(): void {
        this._netNode.StateClosed()
    }

    public NetNodeStateSwitch(): void {
        this._netNode.CloseSocket();
        this._netNode.StateSwitch();
    }


    public SendProtoBuf(data: any): any {
        let self = this;
        self._netNode.Send(data);
    }

    /**
     * 注册一个服务器发送到客户端的消息处理
     * @param msgId
     * @param fun
     */
    public RegisterSTCFunc(msgId: number, msgProto: any, fun: (...params: any[]) => void, sysClass: any): void {
        let self = this;
        self._netNode.RegisterSTCFunc(msgId, msgProto, fun, sysClass)
    }

    public RemoveSTCFunc(msgId: number) {
        let self = this;
        self._netNode.RemoveSTCFunc(msgId)
    }

    // public AutoReconnect() {
    //     let self = this;
    //     return self._netNode.AutoReconnect();
    // }

    public onClosed() {
        let self = this;
        return self._netNode.onClosed([]);
    }
}
