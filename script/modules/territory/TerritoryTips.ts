import { CfgTerritoryData } from "config/CfgTerritory";
import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { TerritoryData } from "./TerritoryData";
@BaseView.registView
export class TerritoryTips extends BaseView {


    data = TerritoryData.Inst()
    protected viewRegcfg = {
        UIPackName: "TerritoryTips",
        ViewName: "TerritoryTips",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        Line: <fgui.GImage>null,
    }
    InitData(param: any): void {
        this.viewNode.Board.SetData(new BoardData(TerritoryTips))

    }

    InitUI(): void {
        //0-195
        let rate = this.data.my_territory.rewardCount / this.data.GetOtherCfg().max_num
        this.viewNode.Line.height = 195 * rate
    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {

    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}