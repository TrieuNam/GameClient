import { IProtocolHelper, NetData } from "./ProtocolHelper";
import protobufjs from 'protobufjs';
import { MsgId } from "./MsgIdRegister";
import { Uint8ArrayUtils } from "./Uint8ArrayUtils";

export class BaseProtocolHelper implements IProtocolHelper {
    getHeadlen(msg: NetData): number {
        var reader = new protobufjs.Reader(msg);
        var length = reader.fixed32();
        return length
    }
    getHearbeat(): any {
        let message = PB_CSHeartbeatReq.create();
        message.reserve = 0;
        return message;
    }
    checkPackage(msg: NetData): boolean {
        var length = this.getHeadlen(msg);
        if (length === msg.length - 4) return true;
        return false;
    }
    getPackageId(msg: NetData): number {
        var reader = protobufjs.Reader.create(msg);
        reader.fixed32();
        var msgId = reader.fixed32();
        return msgId;
    }
    getPackageData(msg: NetData, msgProto: any): any {
        var reader = protobufjs.Reader.create(msg);
        const protoData = msgProto.decode(msg.slice(8, reader.len));
        return protoData;
    }
    handlePackageData(data: any): Uint8Array {
        const msgId = MsgId.GetMsgId(data.constructor);
        if (msgId === 0) {
            console.error(`未注册协议: ${data.constructor.name}`);
            return;
        }
        const netData = data.constructor.encode(data).finish();
        var length = netData.length + 8;
        var uinya = new Uint8Array(length);
        var lengthArray = Uint8ArrayUtils.convertToByteArray(length - 4);
        var msgArray = Uint8ArrayUtils.convertToByteArray(msgId);

        for (let index = 0; index < lengthArray.length; index++) {
            uinya[index] = lengthArray[index];
        }

        for (let index = 0; index < msgArray.length; index++) {
            uinya[index + 4] = msgArray[index];
        }

        for (let index = 0; index < netData.length; index++) {
            uinya[index + 8] = netData[index];
        }
        return uinya
    }
}
