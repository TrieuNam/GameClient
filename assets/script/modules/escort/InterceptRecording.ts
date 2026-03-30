import { CfgEscortShip } from "config/CfgEscort";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { MainCapItem, MainCapNumItem } from "modules/main/MainItems";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { DataHelper } from "../../helpers/DataHelper";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortCtrl } from "./EscortCtrl";
import { EscortData, ESCORT_OPER_TYPE, ESCORT_RET_TYPE } from "./EscortData";

@BaseView.registView
export class InterceptRecording extends BaseView {
    data = EscortData.Inst()
    protected viewRegcfg = {
        UIPackName: "EscortInterceptRecording",
        ViewName: "InterceptRecording",
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
        Board: <CommonBoard2>null,
        BtnRefresh: <fgui.GButton>null,
        List: <fgui.GList>null,
        Count: <fgui.GTextField>null,
        NoneObj: <fgui.GObject>null,
    };

    protected extendsCfg = [
        { ResName: "InterceptItem", ExtendsClass: EscortInterceptItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(InterceptRecording, Language.Escort.Title4))
        this.viewNode.BtnRefresh.onClick(this.OnClickRefresh, this)
        this.AddSmartDataCare(this.data.FlushData, this.OnInterceptChange.bind(this), "flush_intercept")
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.INTERCEPT_LIST_INFO_REQ)
    }
    OnClickRefresh() {
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.INTERCEPT_LIST_INFO_REQ)
    }
    OnInterceptChange() {
        console.log("FlushInterceptInfo");

        this.FlushInterceptInfo()
    }
    FlushInterceptInfo() {

        if (this.data.InterceptData != null) {
            this.viewNode.List.SetData(this.data.InterceptData.list)
            this.viewNode.NoneObj.visible = (this.data.InterceptData.list.length == 0)
        } else {
            this.viewNode.NoneObj.visible = true
        }
        UH.SetText(this.viewNode.Count, Format(Language.Escort.ShengYu1, this.data.GetInterceptTime() - this.data.RoleData.interceptCount, this.data.GetInterceptTime()))
    }
    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        this.FlushInterceptInfo()
    }

    CloseCallBack() {
        GuideCtrl.Inst().ForceStop()
    }
}

export class EscortInterceptItem extends BaseItemGB {
    escort_data = EscortData.Inst()
    guide_tag = ""
    protected viewNode = {
        Name: <fgui.GTextField>null,
        BtnFight: <fgui.GButton>null,
        Head: <AvatarCell>null,
        List: <fgui.GList>null,
        CapItem: <MainCapItem>null,
        Level: <fgui.GTextField>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    SetData(data: PB_SCEscortInterceptData) {
        this._data = data;
        if (data.roleInfo == null || data.ship == null) {
            console.log("数据个人信息为空");
            return
        }
        UH.SetText(this.viewNode.Name, DataHelper.BytesToString(data.roleInfo.name))
        this.viewNode.CapItem.SetData(data.roleInfo.cap)
        this.viewNode.BtnFight.onClick(this.OnClickIntercept, this)
        let rewards = [];
        let rewad_list = this.escort_data.GetBoatData(data.ship.ship).intercept_reward
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        this.viewNode.List.SetData(rewards)
        if (this.node.getSiblingIndex() == 0) {
            this.guide_tag = GuideCtrl.Inst().AddGuideUi("InterceptFirstBtn", this.viewNode.BtnFight)
        }
        UH.SetText(this.viewNode.Level, Format(Language.Common.LevelShow, data.roleInfo.level))
        this.viewNode.Head.SetData(new AvatarData(undefined, undefined, data.roleInfo.headChar))
    }
    onDestroy() {
        GuideCtrl.Inst().ClearGuideUi(this.guide_tag)
    }
    OnClickIntercept() {
        //console.log("点击拦截");
        EscortCtrl.Inst().SendEcsortReq(ESCORT_RET_TYPE.TARGET_INTERCEPT, this._data.ship.shipKey)
    }
}