export class MsgId {
    static RegisterMsg(msgid: number, protoClass: any) {
        protoClass.msgId = msgid;
        MsgId.msgMap.set(msgid, protoClass);
    }

    static GetMsgClass(msgid: number) {
        return MsgId.msgMap.get(msgid)
    }

    static GetMsgId(protoClass: any) {
        let msgId = 0;
        MsgId.msgMap.forEach((value, key) => {
            if (value === protoClass) {
                msgId = key;
            }
        })
        return msgId
    }

     static msgMap: Map<number, any> = new Map<number, any>()
}

