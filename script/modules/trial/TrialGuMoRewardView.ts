
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard3 } from 'modules/common_board/CommonBoard3';
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TrialCtrl } from "./TrialCtrl";
import { TrialData } from './TrialData';

@BaseView.registView
export class TrialGuMoRewardView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialGuMoReward",
        ViewName: "TrialGuMoRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnGet: <fgui.GButton>null,
        BtnArrowLeft: <fgui.GButton>null,
        BtnArrowRight: <fgui.GButton>null,

        ShowList: <fgui.GList>null,

        Reward0: <fgui.GImage>null,
        ConditionShow: <fgui.GRichTextField>null,
        GpGet: <fgui.GList>null,
        CellShow:<ItemCell>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: TrialGuMoRewardViewShowItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialGuMoRewardView));

        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
        this.viewNode.BtnArrowLeft.onClick(this.OnClickLeft, this);
        this.viewNode.BtnArrowRight.onClick(this.OnClickRight, this);

        this.viewNode.ShowList.setVirtual();
        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushGuMoListShow.bind(this), "GuMoListInfo");
    }

    InitUI(){
        this.FlushShow()
        this.FlushGuMoListShow()
    }

    FlushShow(){
        let info = TrialData.Inst().GetDayRewardShow()
        let list = TrialData.Inst().CfgGuMoRewardShowList()
        
        this.viewNode.ShowList.SetData(list)
        this.viewNode.CellShow.SetData(info.succ ? Item.Create(info.rewards[0], {is_num:true}) : null)
        UH.SetText(this.viewNode.ConditionShow, Language.Trial.GuMoTower.RewardConditionShow)
    }
    
    
    FlushGuMoListShow(){
        let info = TrialData.Inst().ResultData.GuMoListInfo
        this.viewNode.Reward0.visible = 0 == info.lastdayLevel
        this.viewNode.GpGet.visible = info.lastdayLevel > 0
        this.viewNode.BtnGet.grayed = 0 != info.dayReward
    }

        
    OnClickGet(){
        let level = TrialData.Inst().ResultData.GuMoListInfo.lastdayLevel
        TrialCtrl.Inst().SendGuMoPagodaReqDayReward(level)
    }

    OnClickLeft(){
        this.viewNode.ShowList.scrollPane.scrollLeft()
    }

    OnClickRight(){
        this.viewNode.ShowList.scrollPane.scrollRight()
    }
}

export class TrialGuMoRewardViewShowItem extends BaseItem {
    protected viewNode = {
        DescShow: <fgui.GTextField>null,
        CellShow:<ItemCell>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        this.viewNode.CellShow.SetData(Item.Create(data.element.day[0], {is_num:true}))
        UH.SetText(this.viewNode.DescShow, TextHelper.Format(Language.Trial.GuMoTower.RewardDescShow, data.start == data.end ? data.start : `${data.start}-${data.end}`))
    }
}
