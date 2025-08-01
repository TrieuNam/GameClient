
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { RedPoint } from "modules/extends/RedPoint";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { BlockCtrl } from "./BlockCtrl";
import { BlockData } from "./BlockData";

@BaseView.registView
export class BlockAchieveView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockAchieve",
        ViewName: "BlockAchieveView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: BlockAchieveViewShowItem },
        { ResName: "AttrItem", ExtendsClass: BlockAchieveViewAttrItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(BlockAchieveView));

        this.viewNode.ShowList.setVirtual();

        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushShow.bind(this), "FlushInfoAchieve");
    }

    InitUI() {
        this.FlushShow();
    }

    FlushShow() {
        let show_list = BlockData.Inst().GetAchieveShowList()
        this.viewNode.ShowList.SetData(show_list)
    }

}

export class BlockAchieveViewShowItem extends BaseItem {
    protected viewNode = {
        Actived: <fgui.GImage>null,
        TitleShow: <fgui.GTextField>null,
        ProgressShow: <fgui.GTextField>null,
        LevelShow: <fgui.GTextField>null,
        BtnActive: <fgui.GButton>null,
        AttrList: <fgui.GList>null,
        RedPointShow: <RedPoint>null,
    };

    protected onConstruct() {
        super.onConstruct()
        this.viewNode.BtnActive.onClick(this.OnClickActive, this);
    }

    public SetData(data: any) {
        super.SetData(data)

        if (data) {
            let filled_num = BlockData.Inst().FillNum
            let active_info = BlockData.Inst().GetAchieveActive(data.seq, data.model_num)
            UH.SetText(this.viewNode.TitleShow, TextHelper.Format(Language.Block.BlockAchieve.TitleShow, data.model_num))
            UH.SetText(this.viewNode.ProgressShow, TextHelper.Format(Language.Block.BlockAchieve.ProgressShow, active_info.is_active ? data.model_num : filled_num, data.model_num))
            UH.SetText(this.viewNode.LevelShow, data.seq)
            this.viewNode.ProgressShow.color = active_info.is_active ? COLORS.Green3 : COLORS.Red5
            this.viewNode.Actived.visible = active_info.is_active
            this.viewNode.BtnActive.visible = !active_info.is_active

            let attrs = []
            for (let element of data.achieve) {
                attrs.push({ type: element.type, add: element.add, is_gray: !active_info.is_active })
            }
            this.viewNode.AttrList.SetData(attrs)

            this.viewNode.RedPointShow.SetNum(!active_info.is_active && active_info.can_active ? 1 : 0)
        }
    }

    public OnClickActive() {
        BlockCtrl.Inst().SendShenQiReqActivate(this._data ? this._data.seq : 0)
    }
}

export class BlockAchieveViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrShow: <fgui.GTextField>null,

    };

    public SetData(data: any) {
        this.viewNode.AttrShow.grayed = data.is_gray
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockAchieve.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add)))
    }
}