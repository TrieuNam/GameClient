import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";
import { ViewManager } from "manager/ViewManager";
import { PetGemLvItem } from "./PetGemView";
import { PetGemData } from "./PetData";

@BaseView.registView
export class PetGemReplaceView extends BaseView {
    private confirm_call:Function;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemReplace",
        ViewName: "PetGemReplaceView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        Item1: <PetGemLvItem>null,
        Item2: <PetGemLvItem>null,
        BtnConfirm: <fgui.GButton>null,
    }


    InitData(data: { cur_data:PetGemData, change_data:PetGemData, call_back: Function }) {
        this.confirm_call=data.call_back;
        this.viewNode.Board.SetData(new BoardData(PetGemReplaceView));
        this.viewNode.Item1.SetData(data.cur_data);
        this.viewNode.Item2.SetData(data.change_data);
        this.viewNode.BtnConfirm.onClick(this.onConfirm.bind(this));
    }

    private onConfirm(){
        this.confirm_call && this.confirm_call();
        ViewManager.Inst().CloseView(PetGemReplaceView);
    }

    InitUI() {
    }
}