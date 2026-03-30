import { CfgFunOpen } from "config/CfgFunOpen";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { FishData } from "modules/fish/FishData";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TERRITORY_REQ, TerritoryData } from "./TerritoryData";
import { TerritoryGift } from "./TerritoryGift";
import { TerritoryInfoView } from "./TerritoryInfoView";
import { TerritoryItemInfo } from "./TerritoryItemInfo";
import { TerritoryLog } from "./TerritoryLog";
import { TerritorySnatch } from "./TerritorySnatch";
import { TimeHelper } from "../../helpers/TimeHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { TerritoryRefreshView } from "./TerritoryRefreshView";
@BaseView.registView
export class TerritoryView extends BaseView {
    data = TerritoryData.Inst()
    role_id: number = 0
    guide_tag: string[] = []
    private cache_timer: number
    protected viewRegcfg = {
        UIPackName: "Territory",
        ViewName: "TerritoryView",
        LayerType: ViewLayer.Buttom,
    };
    protected viewNode: any = {
        BtnClose: <fgui.GButton>null,
        Level: <fgui.GTextField>null,
        BotNum: <fgui.GTextField>null,
        BotFree: <fgui.GTextField>null,
        BtnTerr: <fgui.GImage>null,
        BtnLog: <fgui.GButton>null,
        BtnHome: <fgui.GButton>null,
        BtnFish: <fgui.GButton>null,
        BtnSnatch: <fgui.GButton>null,
        Item1: <TerritoryItem>null,
        Item2: <TerritoryItem>null,
        Item3: <TerritoryItem>null,
        Item4: <TerritoryItem>null,
        Item5: <TerritoryItem>null,
        Item6: <TerritoryItem>null,
        LockDesc: <fgui.GTextField>null,
        KaoGuRed: <RedPoint>null,
        TerrRed: <RedPoint>null,
        n22: <fgui.GObject>null,
        n21: <fgui.GObject>null,
        redPoint: <RedPoint>null,
        BtnGift: <fgui.GButton>null,
        RedPointGift: <RedPoint>null,
        timer: <TimeMeter>null,
        BtnRefresh: <fgui.GButton>null,
    }
    protected extendsCfg = [
        { ResName: "TerritoryItem", ExtendsClass: TerritoryItem },
    ];
    //是不是新打开界面
    private isNewOpen = 0;
    InitData(param: any): void {
        TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.FETCH_REWARD)
        this.role_id = RoleData.Inst().GetRoleId()
        this.viewNode.BtnClose.onClick(this.OnClickClose, this)
        this.viewNode.BtnTerr.onClick(this.OnClickTerritory, this)
        this.viewNode.BtnLog.onClick(this.OnClickLog, this)
        this.viewNode.BtnHome.onClick(this.OnClickGoHome, this)
        this.viewNode.BtnFish.onClick(this.OnClickToFish, this)
        this.viewNode.BtnSnatch.onClick(this.OnClickSnatch, this)
        this.viewNode.BtnGift.onClick(this.OnClickGift, this)
        this.viewNode.BtnRefresh.onClick(this.OnClickRefresh, this)
        TerritoryCtrl.Inst().SendTerritoryInfo(this.role_id)
        TerritoryCtrl.Inst().SendTerritoryNeighbour()
        // this.viewNode.Item1.onClick(this.onClickItem.bind(this, 1))
        // this.viewNode.Item2.onClick(this.onClickItem.bind(this, 2))
        // this.viewNode.Item3.onClick(this.onClickItem.bind(this, 3))
        // this.viewNode.Item4.onClick(this.onClickItem.bind(this, 4))
        // this.viewNode.Item5.onClick(this.onClickItem.bind(this, 5))
        // this.viewNode.Item6.onClick(this.onClickItem.bind(this, 6))
        this.AddSmartDataCare(this.data.FlushData, this.OnTerritoryInfoChange.bind(this), "flush_info")
        this.AddSmartDataCare(this.data.FlushData, this.OnTerritoryGiftChange.bind(this), "flush_gift")
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.OnRoleLevelChange.bind(this), "roleLevel")
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushKaoGuRedPoint.bind(this), "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo")
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemChange.bind(this), "OtherChange")
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TerritoryBtnSnatch", this.viewNode.BtnSnatch));
        this.isNewOpen = 1;

        TerritoryData.Inst().ClearFirstRemind();
        this.OnTerritoryGiftChange()
    }
    OnClickGift() {
        if (this.data.GetGiftShow()) {
            ViewManager.Inst().OpenView(TerritoryGift)
        } else {
            PublicPopupCtrl.Inst().Center(Language.Territory.ActNoOpen)
        }
    }
    OnClickRefresh() {
        ViewManager.Inst().OpenView(TerritoryRefreshView)
    }

    private FlushFlushTime() {
        let time = this.cache_timer;
        // this.viewNode.timer.visible = time > 0
        // this.viewNode.BtnGift.visible = time > 0
        if (time > TimeCtrl.Inst().ServerTime) {
            this.viewNode.timer.SetOutline(true, COLORSTR.Red2)
            this.viewNode.timer.StampTime(time, TimeFormatType.TYPE_TIME_0);
            this.viewNode.timer.SetCallBack(this.OnTerritoryGiftChange.bind(this));
        } else {
            this.viewNode.timer.SetTime("");
        }
    }

    FlushItemChange() {
        //console.error("工具人 红点GetBotRedPoint", this.data.GetBotRedPoint());

        this.viewNode.TerrRed.SetNum(this.data.GetBotRedPoint())
    }
    FlushKaoGuRedPoint() {
        let res = FunOpen.Inst().GetFunIsOpen(Mod.Fish.View)
        if (res.is_open) {
            this.viewNode.KaoGuRed.SetNum(FishData.Inst().GetWabaoRedPoint())
        } else {
            this.viewNode.KaoGuRed.SetNum(0)
        }
    }
    OnRoleLevelChange() {
        let config = CfgFunOpen.funopen.find(cfg => cfg.client_id == Mod.Fish.View)
        if (config) {
            UH.SetText(this.viewNode.LockDesc, Format(Language.Territory.LockDesc, config.level))
        }
        let res = FunOpen.Inst().GetFunIsOpen(Mod.Fish.View)
        this.viewNode.BtnFish.grayed = !res.is_open
        if (res.is_open) {
            UH.SetText(this.viewNode.LockDesc, "")
        }
    }
    onClickItem(index: any) {
        let info = this.data.my_territory
        let data = info.itemList[index - 1]
        ViewManager.Inst().OpenView(TerritoryItemInfo, data)
    }
    OnTerritoryGiftChange() {
        this.cache_timer = TerritoryData.Inst().getGiftEndTime()

        let isGift = (this.data.show_mine && this.data.GetGiftShow() != null && this.cache_timer > 0)
        this.viewNode.BtnGift.visible = isGift;
        this.viewNode.timer.visible = isGift;
        this.viewNode.RedPointGift.SetNum(this.data.GetGiftShowRedPoint() && this.cache_timer > 0)

        this.FlushFlushTime()
    }
    OnTerritoryInfoChange() {
        //TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.Log);
        this.viewNode.redPoint.SetNum(TerritoryData.Inst().GetAddLogRedPoint());
        let isGift = (this.data.show_mine && this.data.GetGiftShow() != null && this.cache_timer > 0)
        this.viewNode.BtnGift.visible = isGift;
        this.viewNode.timer.visible = isGift;
        if (this.data.show_mine) {
            this.viewNode.BtnHome.visible = false
            let info = this.data.my_territory
            this.viewNode.n21.visible = this.viewNode.n22.visible = true;
            if (info) {
                //UH.SetText(this.viewNode.Level, info.territoryLevel)
                UH.SetText(this.viewNode.BotNum, Format(Language.Territory.BotNum, info.botNum - info.botRunNum))
                UH.SetText(this.viewNode.BotFree, Format(Language.Territory.BotFree, info.botRunNum))
                //console.log("自己领地变化");
                this.viewNode.Item1.SetData(info.itemList[0])
                this.viewNode.Item2.SetData(info.itemList[1])
                this.viewNode.Item3.SetData(info.itemList[2])
                this.viewNode.Item4.SetData(info.itemList[3])
                this.viewNode.Item5.SetData(info.itemList[4])
                this.viewNode.Item6.SetData(info.itemList[5])
                //指引到空的item 就指向下一个,全都是空则指向抢夺 
                if (this.isNewOpen) {
                    let tempItem;
                    for (let i = 1; i <= 6; i++) {
                        if (info.itemList[i - 1].seq > 0) {
                            tempItem = this.viewNode["Item" + i];
                            if (i >= 2) {
                                break;
                            }
                        }
                    }
                    this.isNewOpen = 0;
                    if (tempItem) {
                        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TerritoryGather", tempItem.getBOX()));
                    } else {
                        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TerritoryGather", this.viewNode.BtnSnatch));
                    }

                }
            }

        } else {
            this.viewNode.n21.visible = this.viewNode.n22.visible = false;
            this.viewNode.BtnHome.visible = true
            //播放一个切换动画
            let info = this.data.other_territory
            if (info) {
                //UH.SetText(this.viewNode.Level, info.territoryLevel)
                UH.SetText(this.viewNode.BotNum, "")
                UH.SetText(this.viewNode.BotFree, "")
                //console.log("他人领地变化");
                this.viewNode.Item1.SetData(info.itemList[0])
                this.viewNode.Item2.SetData(info.itemList[1])
                this.viewNode.Item3.SetData(info.itemList[2])
                this.viewNode.Item4.SetData(info.itemList[3])
                this.viewNode.Item5.SetData(info.itemList[4])
                this.viewNode.Item6.SetData(info.itemList[5])

            }

        }
    }

    InitUI(): void {
        let tag = GuideCtrl.Inst().AddGuideUi("FishTerrBtn", this.viewNode.BtnFish);
        this.guide_tag.push(tag)
        tag = GuideCtrl.Inst().AddGuideUi("TerritoryBtn", this.viewNode.BtnTerr);
        this.guide_tag.push(tag)

        // if(this.data.my_territory.itemList[2]){
        //     this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TerritoryGather", this.viewNode.Item3));
        // }else if(this.data.my_territory.itemList[3]){
        //     this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TerritoryGather", this.viewNode.Item4));
        // }

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.OnRoleLevelChange()
        this.FlushKaoGuRedPoint()
        this.FlushItemChange()


    }

    CloseCallBack(): void {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = null
        let info = this.data.my_territory;
        if (info && info.itemList) {  //当自己有正在采集的资源时，请求被抢夺通知
            for (let item of info.itemList) {
                if (item.endTime > 0) {
                    ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.territoryBerobbed);
                    break;
                }
            }
        }
        if (this.data.bot_list) {    //当自己有在抢夺别人的资源时，请求抢夺被防御通知
            let roleId = RoleData.Inst().GetRoleId();
            for (let botItem of this.data.bot_list) {
                let roleInfo = botItem.defenderInfo;
                if (IsEmpty(roleInfo) || roleInfo.roleId != roleId) {
                    ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.territoryRobBedef);
                }
            }
        }
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(TerritoryView)
    }
    OnClickTerritory() {
        if (this.data.show_mine) {
            //console.log("领地界面");
            TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.BOT_STATUS)
            ViewManager.Inst().OpenView(TerritoryInfoView)
        }

    }
    OnClickToFish() {
        //洞穴节目的
        //console.log("洞穴");
        // ViewManager.Inst().CloseView(TerritoryView)
        ViewManager.Inst().OpenViewByKey(Mod.Fish.View)
        //TerritoryCtrl.Inst().SendFetchItem(RoleData.Inst().GetRoleId(), 0, 1)
    }
    OnClickGoHome() {
        //请求自身信息并做切换
        //console.log("回家");
        //ViewManager.Inst().OpenView(TerritoryItemInfo)
        TerritoryCtrl.Inst().SendTerritoryInfo(this.role_id)
    }
    OnClickSnatch() {
        //打开抢夺界面
        TerritoryCtrl.Inst().SendTerritoryNeighbour()
        ViewManager.Inst().OpenView(TerritorySnatch)
    }
    OnClickLog() {
        //日志界面
        //console.log("开日志");
        TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.Log);
        ViewManager.Inst().OpenView(TerritoryLog)
    }
    //只有大于对方的工具人数量才会拖动  
}

export class TerritoryItem extends BaseItem {
    territory_data = TerritoryData.Inst()
    protected viewNode = {
        ItemLevel: <fgui.GTextField>null,
        Def: <fgui.GGroup>null,
        Atk: <fgui.GGroup>null,
        Timer: <TimeMeter>null,
        PosChange: <fgui.GGroup>null,
        HeadDef: <AvatarCell>null,
        HeadAtk: <AvatarCell>null,
        DefNum: <fgui.GTextField>null,
        AtkNum: <fgui.GTextField>null,
        BtnBox: <fgui.GButton>null,
        Icon: <fgui.GLoader>null,
    };
    protected _data: IPB_SCTerritoryItemNode = null;
    offset = 0;
    tweener: fgui.GTweener | null = null
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Timer.SetCallBack(this.TimeEndCallback.bind(this))
        this.viewNode.BtnBox.onClick(this.OnClickBox, this)
    }
    TimeEndCallback() {
        //console.log("时间结束");
        TerritoryCtrl.Inst().SendFetchReward();
        setTimeout(() => {
            if (this.tweener) {
                this.tweener.kill();
                this.tweener = null
            }
            TerritoryCtrl.Inst().SendTerritoryInfo2();
        }, 100);

    }
    OnClickBox() {
        ViewManager.Inst().OpenView(TerritoryItemInfo, this._data)
    }
    public getBOX() {
        return this.viewNode.BtnBox;
    }
    public getDataSeq() {
        return this._data.seq;
    }
    public SetData(data: IPB_SCTerritoryItemNode) {
        this._data = data;
        if (this.tweener) {
            this.tweener.kill();
            this.tweener = null
        }
        if (data.seq == 0) {
            this.visible = false
            //刷新中 可尝试领取奖励
            TerritoryCtrl.Inst().SendFetchReward()
            this.viewNode.Timer.StampTime(data.refreshTime)
        } else {
            this.offset = 806 / this.territory_data.GetOtherCfg().grid_max
            this.visible = true
            let config = this.territory_data.GetItemCfg(data.seq)
            let pos = ((this.territory_data.GetOtherCfg().grid_max - data.pos) * this.offset + (170 - 403))
            //console.log("index:", data.index, "当前pos:", data.pos,"算得初始位置：", pos);
            this.viewNode.PosChange.y = pos//这里还要加上起始坐标
            UH.SetText(this.viewNode.ItemLevel, Format(Language.Territory.Level2, config.item_level))
            if (data.endTime > 0 && (data.defenderNum != 0 || data.attackerNum != 0)) {
                //console.log("服务端计算的时间：", data.endTime - TimeCtrl.Inst().ServerTime);
                this.viewNode.Timer.StampTime(data.endTime, null, null, "")
                //满足这个条件后开始移动
                let a = this.viewNode.PosChange.y
                let b = 0
                let d = data.endTime - TimeCtrl.Inst().ServerTime
                if (data.attackerNum > data.defenderNum) {
                    b = (170 - 403)
                } else {
                    b = (170 + 403)
                }
                // console.log("当前位置:", a, "结束位置:", b, "需要时间:", d);
                this.tweener = fgui.GTween.to(a, b, d)
                    .setEase(fgui.EaseType.Linear)
                    .onUpdate((tweener: fgui.GTweener) => {
                        if (this.node && this.node.isValid) {
                            this.viewNode.PosChange.y = tweener.value.x
                        }
                    })
            } else {
                this.viewNode.Timer.SetTime("")
            }
        }
        let config = this.territory_data.GetItemCfg(data.seq)
        if (config) {
            // UH.SetIcon(this.viewNode.Icon, Item.GetIconId(config.item_id), ICON_TYPE.ITEM)
            UH.SetIcon(this.viewNode.Icon, config.icon, ICON_TYPE.ITEM)

        }
        UH.SetText(this.viewNode.DefNum, data.defenderNum)
        UH.SetText(this.viewNode.AtkNum, data.attackerNum)
        if (data.defenderNum != 0) {
            this.viewNode.Def.visible = true
            //这里要根据当前领地是否是自己的来显示
            let info
            if (this.territory_data.show_mine) {
                info = this.territory_data.my_territory
            } else {
                info = this.territory_data.other_territory
            }
            this.viewNode.HeadDef.SetData(new AvatarData(info.roleInfo.headPicId, info.roleInfo.level, info.roleInfo.headChar))
        } else {
            this.viewNode.Def.visible = false
        }
        if (data.attackerNum != 0) {
            this.viewNode.Atk.visible = true
            this.viewNode.HeadAtk.SetData(new AvatarData(data.attackerInfo.headPicId, data.attackerInfo.level, data.attackerInfo.headChar))
        } else {
            this.viewNode.Atk.visible = false
        }
    }
    //影响动效
    /* onEnable() {
        super.onEnable();
        //this.viewNode.PosChange.y = 170+230
        //console.log("name", this.name, "y", this.y);
        //this.y = this.y + 403
        //pos = 5000 y = 170 +- 403
        //0.0806 一格走这么多坐标
        // -163 = 0
        // 240 = 5000
        // 643 = 10000
    } */
}   