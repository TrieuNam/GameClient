import { IProtocolHelper, NetData } from "./ProtocolHelper";
import protobufjs from 'protobufjs';
import { MsgId } from "./MsgIdRegister";
import { Uint8ArrayUtils } from "./Uint8ArrayUtils";

export class BaseProtocolHelper implements IProtocolHelper {
   getHeadlen(msg: NetData): number {
        const data = msg.buffer instanceof Uint8Array ? msg.buffer : new Uint8Array(msg.buffer);
        return (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
    }
    getHearbeat(): any {
        let message = PB_CSHeartbeatReq.create();
        message.reserve = 0;
        return message;
    }
    checkPackage(msg: NetData): boolean {
        const length = this.getHeadlen(msg);
        const totalBodyLength = msg.length;

        // Do length bao gồm cả phần header 4 byte, nên so sánh trực tiếp với msg.length
        return length === totalBodyLength;
    }
    getPackageId(msg: NetData): number {
         const buffer = msg instanceof Uint8Array ? msg : new Uint8Array(msg);
         return (buffer[4] << 24) | (buffer[5] << 16) | (buffer[6] << 8) | buffer[7];
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

        // Encode protobuf message
        const netData = data.constructor.encode(data).finish();

        // Tổng chiều dài = 4 byte length + 4 byte msgId + payload
        const totalLength = 4 + 4 + netData.length;
        const result = new Uint8Array(totalLength);

        // Ghi length và msgId theo Big Endian
        const lengthBytes = Uint8ArrayUtils.convertToByteArray(totalLength);
        const msgIdBytes = Uint8ArrayUtils.convertToByteArray(msgId);

        // Copy vào buffer
        result.set(lengthBytes, 0);        // 0~3: tổng chiều dài
        result.set(msgIdBytes, 4);         // 4~7: mã lệnh
        result.set(netData, 8);            // 8+: nội dung protobuf

        return result;
    }
}
