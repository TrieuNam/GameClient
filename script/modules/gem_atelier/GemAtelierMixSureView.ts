import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from "./GemAtelierCtrl";
import { GemAtelierData } from "./GemAtelierData";

@BaseView.registView 
export class GemAtelierMixSureView extends BaseView {
    protected param:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierMixSure",
        ViewName: "GemAtelierMixSureView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "MixItem", ExtendsClass: GemAtelierMixItem },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        button: <fgui.GButton>null,
        Item1: <GemAtelierMixItem>null,
        Item2: <GemAtelierMixItem>null,
    };

    InitData(data:any) {
        this.viewNode.Board.SetData(new BoardData(GemAtelierMixSureView,Language.GemAtelier.MixTitle));
        this.viewNode.button.onClick(this.OnClickButton, this);

        this.viewNode.Item1.SetData(data.ready_item)
        this.viewNode.Item2.SetData(data.target_item)

        this.param = data
    }

    private OnClickButton() {
        AudioManager.Inst().Play(AudioTag.ShengJi)

        GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.COMPOSE,
            {
                param1:this.param.select_list[0].item_id,
                param2:this.param.select_list[1].item_id,
                param3:this.param.select_list[2].item_id,
                param4:0
            })

        ViewManager.Inst().CloseView(GemAtelierMixSureView)
    }
}

export class GemAtelierMixItem extends BaseItem {
    protected viewNode = {
        ItemCall:<ItemCell>null,
        level_list:<fgui.GList>null,
    };

    public SetData(data:any){
        this._data = data;
        if(data == null){return }
        let levels = GemAtelierData.Inst().GetGemLevelList(data.level)
        this.viewNode.level_list.SetData(levels)
        this.viewNode.ItemCall.SetData(Item.Create({item_id:data.item_id },
             { is_num: false, is_click: false }))
    }
}