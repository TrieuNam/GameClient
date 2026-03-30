import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortData } from "./EscortData";

@BaseView.registView 
export class EscortQualityUp extends BaseView {
    data: EscortData = EscortData.Inst()
    boat_seq = 0;
    protected viewRegcfg = {
        UIPackName: "EscortQualityUp",
        ViewName: "EscortQualityUp",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        Boat: <fgui.GLoader>null,
        NameSp: <fgui.GLoader>null,
        BoatName: <fgui.GTextField>null,
        List: <fgui.GList>null,
    };

    /* protected extendsCfg = [
        { ResName: "组件名", ExtendsClass: 拓展类 }
    ]; */

    InitData(boat_seq: number) {
        //根据当前正在刷新的船进行获取信息
        this.boat_seq = boat_seq
        this.viewNode.Board.SetData(new BoardData(EscortQualityUp, Language.Escort.Title6))
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        let qua = this.boat_seq
        let boat = this.data.GetBoatData(qua);
        let level = qua + 1
        UH.SetText(this.viewNode.BoatName, TextHelper.Format(Language.Escort.BoatName, DataHelper.GetDaXie(level)))
        this.viewNode.BoatName.color = this.data.name_color[qua]
        UH.SpriteName(this.viewNode.NameSp, "Escort", `${level}JiBie`)
        UH.SpriteName(this.viewNode.Boat, "Escort", "ChuanDa" + level)
        let rewards = [];
        let rewad_list = boat.escort_reward
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        this.viewNode.List.SetData(rewards)
    }

    CloseCallBack() {
    }
}