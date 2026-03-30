
import { LogError } from 'core/Debugger';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { RankData } from './RankData';



export class RankCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRankList, func: this.OnRankList },
        ]
    }

    public OnRankList(protocol: PB_SCRankList) {
        RankData.Inst().setRanInfo(protocol);
    }

    public SendRankReq(type: number, list_begin?: number,force:boolean = false) {
        LogError("?发送排行榜请求协议：",type,!RankData.Inst().IsMax(type))
        if (!RankData.Inst().IsMax(type) || force) {
            list_begin = list_begin ?? RankData.Inst().GetReqParam(type);
            let protocol = this.GetProtocol(PB_CSRankReq);
            protocol.type = type;
            protocol.listBegin = list_begin ?? 0;
            LogError("排行榜协议已成功发出")
            this.SendToServer(protocol);
        }
    }
}

