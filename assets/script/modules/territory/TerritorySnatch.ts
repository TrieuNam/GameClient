import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TerritoryData, TERRITORY_REQ } from "./TerritoryData";
@BaseView.registView
export class TerritorySnatch extends BaseView {


    data = TerritoryData.Inst()
    protected viewRegcfg = {
        UIPackName: "TerritorySnatch",
        ViewName: "TerritorySnatch",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnFlush: <fgui.GButton>null,
        List1: <fgui.GList>null,
        List2: <fgui.GList>null,
        Timer: <TimeMeter>null,
        None2: <fgui.GLabel>null,
        None1: <fgui.GLabel>null,
        List3: <fgui.GList>null
    }

    protected extendsCfg = [
        { ResName: "SnatchItem", ExtendsClass: TerritorySnatchItem },
        { ResName: "SnatchItem2", ExtendsClass: TerritorySnatchItem2 },
        { ResName: "SnatchRewardItem", ExtendsClass: TerritorySnatchRewardItem },
    ];

    InitData(param: any): void {
        this.viewNode.List1.scrollItemToViewOnClick = false
        this.viewNode.List2.scrollItemToViewOnClick = false
        this.viewNode.List3.scrollItemToViewOnClick = false
        this.viewNode.Board.SetData(new BoardData(TerritorySnatch))
        this.viewNode.BtnFlush.onClick(this.OnClickFlush, this)
        this.viewNode.Timer.SetCallBack(this.FlushSnatchList.bind(this))
        this.AddSmartDataCare(this.data.FlushData, this.FlushSnatchList.bind(this), "flush_snatch")
        GuideCtrl.Inst().AddGuideUi("TerritoryBtnFlush", this.viewNode.BtnFlush)
    }

    FlushSnatchList() {
        let list1 = this.data.neighbour_list
        //this.viewNode.List1.SetData(list1)
        let list2 = this.data.enemy_list
        //console.log("------掠夺仇人列表----------", list2);
        //this.viewNode.List2.SetData(list2)    
        if (list1 == null) { return }
        if (list2 == null) { return }
        let list3 = []
        let temp = { index: 0, list: list1, height: 156 * list1.length }
        list3.push(temp)
        temp = { index: 1, list: list2, height: 156 * list2.length }
        list3.push(temp)
        this.viewNode.List3.SetData(list3)
        //this.viewNode.None2.visible = (list2.length == 0)
        //this.viewNode.None1.visible = (list1.length == 0)
        if (this.data.neighbour_time != null) {
            //this.data.neighbour_time//上次刷新的时间
            let offset = this.data.GetOtherCfg().other_territory_refresh * 60
            let can_time = this.data.neighbour_time + offset
            if (can_time <= TimeCtrl.Inst().ServerTime) {
                this.viewNode.BtnFlush.grayed = false
                this.viewNode.Timer.SetTime("")
            } else {
                this.viewNode.Timer.StampTime(can_time, TimeFormatType.TYPE_TIME_6, Language.Territory.FlushTime, "")
                this.viewNode.BtnFlush.grayed = true
            }
        } else {
            this.viewNode.BtnFlush.grayed = false
            this.viewNode.Timer.SetTime("")
        }
    }

    InitUI(): void {

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.FlushSnatchList()
    }

    CloseCallBack(): void {
        GuideCtrl.Inst().ClearGuideUi("TerritoryBtnFlush");
    }

    WindowSizeChange() {

    }
    OnClickFlush() {
        if (this.viewNode.BtnFlush.grayed == true) {
            return
        }
        TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.REFRESH_NEIGHBOUR)
    }
}
export class TerritorySnatchItem2 extends BaseItem {
    protected viewNode = {
        List: <fgui.GList>null,
        Desc: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
        NoneLabel: <fgui.GLabel>null
    };
    IconName = ["WeiZhiTuBiao", "ChouRenTuBiao"]
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.viewNode.NoneLabel.visible = data.list.length == 0
        this.viewNode.NoneLabel.title = Language.Territory.TitleList2[data.index]
        this.viewNode.List.SetData(data.list)
        UH.SetText(this.viewNode.Desc, Language.Territory.NameList2[data.index])
        UH.SpriteName(this.viewNode.Icon, "TerritorySnatch", this.IconName[data.index])
        let h = 70 + data.height
        h = h < 530 ? 530 : h
        this.height = h
        //最小530
        //这里还要显示xx无
    }
    public GetData() {
        return this._data;
    }
}
export class TerritorySnatchItem extends BaseItem {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Head: <AvatarCell>null,
        BtnGo: <fgui.GButton>null,
        List: <fgui.GList>null,
    };
    protected _data: IPB_SCTerritoryNeighbourRole = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGo.onClick(this.OnClicGo, this)
    }
    public SetData(data: IPB_SCTerritoryNeighbourRole) {
        this._data = data;
        UH.SetText(this.viewNode.Name, DataHelper.BytesToString(data.roleInfo.name))
        this.viewNode.Head.SetData(new AvatarData(data.roleInfo.headPicId, data.roleInfo.level, data.roleInfo.headChar))
        this.viewNode.List.SetData(data.itemSeq)
    }
    public GetData() {
        return this._data;
    }
    OnClicGo() {
        TerritoryCtrl.Inst().SendTerritoryInfo(this._data.roleInfo.roleId)
        ViewManager.Inst().CloseView(TerritorySnatch)
    }
}
class TerritorySnatchRewardItem extends BaseItem {
    territory_data = TerritoryData.Inst()
    protected viewNode = {
        Level: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this._data = data;
        let config = this.territory_data.GetItemCfg(data)
        if (config) {
            UH.SetText(this.viewNode.Level, Format(Language.Territory.Level2, config.item_level))
            //UH.SetIcon(this.viewNode.Icon, Item.GetIconId(config.item_id), ICON_TYPE.ITEM)
            UH.SetIcon(this.viewNode.Icon, config.icon, ICON_TYPE.ITEM)
        }
    }
    public GetData() {
        return this._data;
    }

}