import { HandleCollector } from "core/HandleCollector";
import { MsgId } from "core/net/MsgIdRegister";
import { Singleton } from "core/Singleton";
import { ByteBuffer } from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { NetManager } from "manager/NetManager";

export type regMsg = {
    msgType: any,
    func: (...params: any[]) => void
}

export type regMod = {
    modKey: number | { [key: string]: number },
    vClass: Function,
}

export class BaseCtrl extends Singleton {
    private map_sysID: Map<number, number>;
    private caches: Map<any, any> = new Map<any, any>();
    private regMsgs: regMsg[] = [];
    private regMods: regMod[] = [];

    protected handleCollector: HandleCollector;

    constructor() {
        super();
        let self = this;
        self.map_sysID = new Map();
        self.regMsgs = self.MsgCfg();
        self.regMods = self.ModCfg();
        this.handleCollector = HandleCollector.Create();
    }

    MsgCfg(): regMsg[] {
        return null;
    }

    ModCfg(): regMod[] {
        return null;
    }

    public OnInit() {
        this.regMsfCfg();
        this.regModCfg();
        this.initCtrl()
    }

    protected initCtrl() {

    }

    protected onDestroy() {
        this.removeAllNetMsg();
        this.removeAllProtocol();
        this.handleCollector.RemoveAll();
        this.handleCollector = null;
    }

    private regModCfg() {
        let self = this;
        if (self.regMods) {
            for (let index = 0; index < self.regMods.length; index++) {
                let regMod = self.regMods[index];
                ModManger.DeclareView(regMod.modKey, regMod.vClass);
            }
        }

    }

    private regMsfCfg() {
        let self = this;
        if (self.regMsgs) {
            for (let index = 0; index < self.regMsgs.length; index++) {
                let regMsg = self.regMsgs[index];
                self.regNetMsg(regMsg.msgType, regMsg.func);
            }
        }
    }

    private regNetMsg(msgProto: any, fun: (...params: any[]) => void): void {
        let self = this;
        const msgId = MsgId.GetMsgId(msgProto);
        self.map_sysID.set(msgId, 1);
        NetManager.Inst().RegisterSTCFunc(msgId, msgProto, fun, self);
    }

    private removeNetMsg(msgId: number) {
        NetManager.Inst().RemoveSTCFunc(msgId);
    }

    private removeAllNetMsg() {
        this.map_sysID.forEach((value, key) => {
            this.removeNetMsg(key);
        })
    }

    public SendToServer(data: any): void {
        NetManager.Inst().SendProtoBuf(data);
    }

    public GetProtocol<T>(con: new () => T): T {
        let proto = null;
        if (this.caches.has(con)) {
            return this.caches.get(con);
        }
        else {
            proto = new con();
            this.caches.set(proto.constructor, proto);
            return proto;
        }
    }

    private removeAllProtocol() {
        this.caches.clear();
    }

    public GetByteBuffer(bytes: Uint8Array): ByteBuffer {
        var buffer: ByteBuffer = new ByteBuffer(bytes);
        buffer.littleEndian = true;
        return buffer;
    }
}

