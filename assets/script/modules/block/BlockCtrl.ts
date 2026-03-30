
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { BlockConfig } from './BlockConfig';
import { BlockData } from './BlockData';

export class BlockCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCBuildBlockInfo, func: this.OnBuildBlockInfo },
        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Block.View,
            BlockData.Inst().FlushData,
            BlockData.Inst().GetBlockRedNum.bind(BlockData.Inst()), "FlushInfo", "FlushInfoInlay", "FlushInfoRemove", "FlushInfoAchieve"));
    }

    public OnBuildBlockInfo(protocol: PB_SCBuildBlockInfo) {
        // LogError("OnBuildBlockInfo", protocol)
        BlockData.Inst().SetBuildBlockInfo(protocol);
    }

    public SendBlockReq(type: number, param: number[] = []) {
        let protocol = this.GetProtocol(PB_CSBlockReq);
        protocol.opType = type;
        protocol.param = param;
        // LogError("SendBlockReq", protocol)
        this.SendToServer(protocol);
    }

    public SendBlockReqInlay(model_id: number, block_index: number, pos_x: number, pos_y: number) {
        this.SendBlockReq(BlockConfig.ReqType.inlay, [model_id, block_index, pos_x, pos_y]);
    }

    public SendShenQiReqRemove(model_id: number, block_index: number) {
        this.SendBlockReq(BlockConfig.ReqType.remove, [model_id, block_index]);
    }

    public SendShenQiReqCompose(block_index1: number, block_index2: number, block_index3: number) {
        this.SendBlockReq(BlockConfig.ReqType.compose, [0, block_index1, block_index2, block_index3]);
    }

    public SendShenQiReqActivate(seq: number) {
        this.SendBlockReq(BlockConfig.ReqType.activate, [seq]);
    }

    public SendShenQiReqMapWear(model_id: number) {
        this.SendBlockReq(BlockConfig.ReqType.map_wear, [model_id]);
    }
}

