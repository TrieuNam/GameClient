import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { RedPoint } from "modules/extends/RedPoint";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishCollectRewardView } from "./FishCollectRewardView";
import { FishConfig } from "./FishConfig";
import { FishData } from "./FishData";

@BaseView.registView
export class FishHandbookView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishHandbook",
        ViewName: "FishHandbookView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnAttr: <fgui.GButton>null,
        ShowList: <fgui.GList>null,
    };

    InitData() {
        this.viewNode.BtnAttr.onClick(this.OnClickAttr, this);
        this.viewNode.Board.SetData(new BoardData(FishHandbookView));
        this.viewNode.ShowList.on(fgui.Event.CLICK_ITEM, this.OnClickShowItem.bind(this))


        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoIntegrityFlush");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoCollectionBookInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoBookListInfo");
    }

    protected extendsCfg = [
        { ResName: "ItemHandbook", ExtendsClass: FishHandbookItem }
    ];

    InitUI() {
        this.FlushIntegrityInfo()
    }

    FlushIntegrityInfo() {
        this.viewNode.ShowList.SetData(FishData.Inst().CfgPictureTypeShow())
    }

    OnClickShowItem(item: FishHandbookItem) {
        let data = item.GetData();
        ViewManager.Inst().OpenView(FishCollectRewardView, { orb_map: data.orb_map })
    }

    OnClickAttr() {
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: FishData.Inst().GetCollectAttrListShow(),
        })
    }
}

export class FishHandbookItem extends BaseItemGB {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        NameSp: <fgui.GLoader>null,
        ProgressShow: <fgui.GTextField>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        let list = FishData.Inst().CfgPictureInfo(data.orb_map);
        UH.SpriteName(this.viewNode.BgSp, "FishHandbook", `${GetCfgValue(FishConfig.HandbookSpName, data.orb_map)}`)
        UH.SpriteName(this.viewNode.NameSp, "FishHandbook", `_Loc${GetCfgValue(FishConfig.HandbookSpName, data.orb_map)}`)
        UH.SetText(this.viewNode.ProgressShow, TextHelper.Format(Language.Fish.FishHandbook.ProgressShow, FishData.Inst().GetWaBaoCollectNums(data.orb_map), list.length));
        if (0 == data.orb_map) {
            this.viewNode.RedPointShow.SetNum(FishData.Inst().GetWabaoCollectUpRedPoint())
        } else {
            this.viewNode.RedPointShow.SetNum(FishData.Inst().GetWabaoCollectionBookActiveRedPoint(data.orb_map))
        }
    }
}