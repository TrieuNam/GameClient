import { bit } from "core/net/bit";
import { ViewManager } from "manager/ViewManager";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { LevelupView } from "modules/levelup/LevelupView";


export class GMCmdCtrl extends BaseCtrl {
    now_time: number = 0;
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCGMCommand, func: this.OnGmCommandReturn },
        ]
    }
    //发送GM命令
    public SendGMCommand(cmd_type: string, cmd_params?: string) {
        // if ("addattrall" == cmd_type){
        //     for(let i = BATTLE_ATTR.BATTLE_ATTR_MIN + 1; i < BATTLE_ATTR.BATTLE_ATTR_MAX; i++){
        //         let protocol = PB_CSGMCommand.create();
        //         protocol.type = bit.StringToUint8Array("addattr");
        //         protocol.command = bit.StringToUint8Array(cmd_params);
        //         this.SendToServer(protocol);
        //     }
        // }
        let protocol = PB_CSGMCommand.create();
        protocol.type = bit.StringToUint8Array(cmd_type);
        protocol.command = bit.StringToUint8Array(cmd_params);
        this.SendToServer(protocol);
        console.log(`Send GM Cmd Type=${cmd_type},params=${cmd_params}`);
    }
    //GM命令返回
    private OnGmCommandReturn(protocol: PB_SCGMCommand) {
        let type = bit.Uint8ArrayToString(protocol.type);
        let result = bit.Uint8ArrayToString(protocol.result);
        console.log(`Recv GM Cmd Resut=${result},Type=${type}`);
    }
    //添加道具物品
    public OnAddItem(item_id: number, num: number) {
        this.SendGMCommand("additem", `${item_id} ${num} 0`);
    }
    //测试代码
    is_test = false
    public TestFunction(param: string) {
        // ViewManager.Inst().OpenView(WaitView)
        //    PublicPopupCtrl.Inst().CenterAttr("11111", -1)
        // ViewManager.Inst().OpenView(InscriptionTowerView)

        // LoginData.Inst().ResultData.currentId = this.id
        // EventCtrl.Inst().emit(CommonEvent.NET_BEFORE_SWITCH);
        // NetManager.Inst().NetNodeStateSwitch()
        // Main.Inst().connect();
        // this.id = this.id == 104 ? 101 : 104

        // ViewManager.Inst().OpenView(AngelFesView)
        // LogError(color.toRGBValue())
        // this.num=512;
        // if(this.num>0){
        //     this.num-=1;
        // }
        // this.is_test=true
        // LogError("开始:",TimeCtrl.Inst().ClientTime)
        // PetData.Inst().GemUp();
        // for (let i = 0; i <= 5; i++) {
        //     LocalStorageHelper.PrefsInt(LocalStorageHelper.PetGemRed(i), -1)
        // }
        ViewManager.Inst().OpenView(LevelupView)
    }
}