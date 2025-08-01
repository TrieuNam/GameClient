import { Color } from "cc";
import { CfgTerritoryData } from "config/CfgTerritory";
import { LogError } from "core/Debugger";
import { FrameTimerHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryBotGet } from "./TerritoryBotGet";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TerritoryData, TERRITORY_REQ } from "./TerritoryData";
import { TerritoryTips } from "./TerritoryTips";
//领地界面
@BaseView.registView
export class TerritoryInfoView extends BaseView {
    data = TerritoryData.Inst()
    state_color = [COLORS.Red7, COLORS.Green4, COLORS.Blue4, COLORS.Gray4]
    use_num = 0
    protected viewRegcfg = {
        UIPackName: "TerritoryInfo",
        ViewName: "TerritoryInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        RewardCount: <fgui.GTextField>null,
        BotState: <fgui.GTextField>null,
        State: <fgui.GTextField>null,
        Speed: <fgui.GTextField>null,
        BotNum: <fgui.GTextField>null,
        Level: <fgui.GTextField>null,
        BtnGet: <fgui.GButton>null,
        CostNum: <fgui.GTextField>null,
        BotNum2: <fgui.GTextField>null,
        NullDesc: <fgui.GTextField>null,
        List: <fgui.GList>null,
        BtnTip: <fgui.GButton>null,
        ItemNum1: <fgui.GTextField>null,
        GetRedPoint: <RedPoint>null,
        CostIcon: <fgui.GImage>null,
    }
    protected extendsCfg = [
        { ResName: "InfoItem", ExtendsClass: TerritoryInfoItem },
    ];
    InitData(param: any): void {
        this.viewNode.List.scrollItemToViewOnClick = false
        this.viewNode.Board.SetData(new BoardData(TerritoryInfoView, Language.Territory.Title1))
        this.viewNode.BtnGet.onClick(this.OnClickGetToolMan, this)
        this.viewNode.BtnTip.onClick(this.OnClickTip, this)
        this.AddSmartDataCare(this.data.FlushData, this.FlushInfo.bind(this), "flush_info")
        this.AddSmartDataCare(this.data.FlushData, this.FlushList.bind(this), "flush_bot")
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemChange.bind(this), "OtherChange")
    }
    FlushItemChange() {
        UH.SetText(this.viewNode.ItemNum1, DataHelper.ConverMoney(Item.GetNum(this.data.GetOtherCfg().meat_id)))
        this.viewNode.GetRedPoint.SetNum(this.data.GetBotRedPoint())
    }
    InitUI(): void {
        GuideCtrl.Inst().AddGuideUi("TerritoryInfoGetBtn", this.viewNode.BtnGet);
    }
    FlushInfo() {
        let info = this.data.my_territory
        if (info == null) {
            return
        }
        UH.SetText(this.viewNode.RewardCount, Format(Language.Territory.CurRewardCount, this.data.my_territory.rewardCount, this.data.GetOtherCfg().max_num))
        let config = this.data.GetEfficiency(info.rewardCount)
        //UH.SetText(this.viewNode.BotState, Format(Language.Territory.BotDesc, Language.Territory.BotState[config.seq - 1], config.efficiency))
        let index = config.seq - 1
        UH.SetText(this.viewNode.State, Format(Language.Territory.StateDesc, Language.Territory.BotState[index]))
        this.viewNode.State.color = this.state_color[index]
        UH.SetText(this.viewNode.Speed, Format(Language.Territory.SpeedDesc, config.efficiency))
        UH.SetText(this.viewNode.BotNum, Format(Language.Territory.BotNum2, info.botNum))
        UH.SetText(this.viewNode.Level, Format(Language.Territory.Level, info.territoryLevel))
        UH.SetText(this.viewNode.BotNum2, Format(Language.Territory.BotNum3, info.botNum - info.botRunNum, info.botNum))
        let buy_cfg = this.data.BuyCfg(info.botBuyCount)
        if (buy_cfg) {
            UH.SetText(this.viewNode.CostNum, buy_cfg.bug_price)
            this.use_num = buy_cfg.bug_price
        } else {
            UH.SetText(this.viewNode.CostNum, Language.Territory.BuyLimit)
            this.viewNode.CostIcon.x = this.viewNode.CostNum.x - (this.viewNode.CostNum.width/2)-50;
            
        }
        UH.SetText(this.viewNode.ItemNum1, DataHelper.ConverMoney(Item.GetNum(this.data.GetOtherCfg().meat_id)))
        //领地事件
        //召回拉货 numer= 0
    }
    FlushList() {
        let list = this.data.bot_list
        if (list && list.length > 0) {
            this.viewNode.NullDesc.visible = false
        } else {
            this.viewNode.NullDesc.visible = true
        }
        this.viewNode.List.SetData(list)
    }
    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.FlushInfo()
        this.FlushList()
        this.FlushItemChange()
    }

    CloseCallBack(): void {
        GuideCtrl.Inst().ClearGuideUi("TerritoryInfoGetBtn");
    }

    WindowSizeChange() {

    }
    OnClickTip() {
        ViewManager.Inst().OpenView(TerritoryTips)
    }
    OnClickUplevel() {

    }
    OnClickGetToolMan() {
        if (this.data.my_territory.botBuyCount >= CfgTerritoryData.buy_monster.length) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BuyLimit)
            return
        }
        if (Item.GetNum(this.data.GetOtherCfg().meat_id) >= this.use_num) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BuySucc)
            TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.BUY)
        } else {
            TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.BUY)
            return
        }
        ViewManager.Inst().OpenView(TerritoryBotGet)
    }
}
class TerritoryInfoItem extends BaseItem {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Level: <fgui.GTextField>null,
        Timer: <TimeMeter>null,
        LeftGroup: <fgui.GGroup>null,
        RightGroup: <fgui.GGroup>null,
        LeftHead: <AvatarCell>null,
        RightHead: <AvatarCell>null,
        LeftNum: <fgui.GTextField>null,
        RightNum: <fgui.GTextField>null,
        BtnReturn: <fgui.GButton>null,
        Icon: <fgui.GLoader>null,
        AtkNone: <fgui.GImage>null,
        DefNone: <fgui.GImage>null,
        GoToGroup: <fgui.GGroup>null,
        BtnGoTo: <fgui.GButton>null,
    };
    protected _data: IPB_SCTerritoryBotNode = null;
    territory_data = TerritoryData.Inst()
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnReturn.onClick(this.OnClickReturn.bind(this))
        this.viewNode.BtnGoTo.onClick(this.OnClickGoTo.bind(this))
    }
    OnClickGoTo() {
        if (this._data) {
            TerritoryCtrl.Inst().SendTerritoryInfo(this._data.defenderInfo.roleId)
            ViewManager.Inst().CloseView(TerritoryInfoView)
        }
    }
    //左防守右攻击
    public SetData(data: IPB_SCTerritoryBotNode) {
        this._data = data;
        let role_id = RoleData.Inst().GetRoleId()
        //console.log("数据", data)
        this.viewNode.GoToGroup.visible = false
        if (data.defenderNum && data.defenderNum > 0) {
            let role_info = data.defenderInfo
            this.viewNode.DefNone.visible = false
            this.viewNode.LeftGroup.visible = true
            if (role_info && role_info.roleId == role_id) {
                UH.SetText(this.viewNode.Name, Language.Territory.NameList[0])
                this.viewNode.LeftGroup.y = 55
            } else {
                //显示前往
                this.viewNode.LeftGroup.y = 27
                this.viewNode.GoToGroup.visible = true
                UH.SetText(this.viewNode.Name, Language.Territory.NameList[1])
            }
            UH.SetText(this.viewNode.LeftNum, data.defenderNum)
            if (role_info) {
                this.viewNode.LeftHead.SetData(new AvatarData(role_info.headPicId, role_info.level, role_info.headChar))
            }
        } else {
            this.viewNode.DefNone.visible = true
            this.viewNode.LeftGroup.visible = false
        }
        if (data.attackerNum && data.attackerNum > 0) {
            let role_info = data.attackerInfo
            this.viewNode.AtkNone.visible = false
            this.viewNode.RightGroup.visible = true
            if (role_info) {
                this.viewNode.RightHead.SetData(new AvatarData(role_info.headPicId, role_info.level, role_info.headChar))
            }
            if (role_info && role_info.roleId == role_id) {
                UH.SetText(this.viewNode.Name, Language.Territory.NameList[1])
            } else {
                UH.SetText(this.viewNode.Name, Language.Territory.NameList[0])
            }
            UH.SetText(this.viewNode.RightNum, data.attackerNum)
        } else {
            this.viewNode.AtkNone.visible = true
            this.viewNode.RightGroup.visible = false
        }
        let config = this.territory_data.GetItemCfg(data.itemSeq)
        if (config) {
            UH.SetText(this.viewNode.Level, Format(Language.Territory.Level2, config.item_level))
            //UH.SetIcon(this.viewNode.Icon, Item.GetIconId(config.item_id), ICON_TYPE.ITEM)
            UH.SetIcon(this.viewNode.Icon, config.icon, ICON_TYPE.ITEM)
        }
        if (data.endTime && data.endTime > 0) {
            this.viewNode.Timer.StampTime(data.endTime, null, null, "")
        } else {
            this.viewNode.Timer.SetTime("")
        }
    }
    OnClickReturn() {
        TerritoryCtrl.Inst().SendFetchItem(this._data.defenderInfo.roleId, this._data.itemIndex, 0)
    }
    public GetData() {
        return this._data;
    }
}