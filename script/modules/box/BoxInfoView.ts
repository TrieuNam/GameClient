import { Color } from "cc";
import { CfgBoxRandomColor } from "config/CfgBox";
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { CommonButton, CommonButtonHelp } from "modules/extends/CommonButton";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { GuildConfig } from "modules/guild/GuildConfig";
import { GuildCtrl } from "modules/guild/GuildCtrl";
import { GuildData } from "modules/guild/GuildData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { BoxCtrl, BoxReqType } from "./BoxCtrl";
import { BoxData } from "./BoxData";

@BaseView.registView
export class BoxInfoView extends BaseView {
    private timer_handle_ad: any = null;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxInfo",
        ViewName: "BoxInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        TxtCurrNum: <fgui.GRichTextField>null,
        TxtUpTitle: <fgui.GTextField>null,
        CurLvBgLoder: <fgui.GLoader>null,
        ImgCurLvAttBg: <fgui.GImage>null,
        GpCurrLevel: <fgui.GGroup>null,
        CurrLv: <fgui.GTextField>null,
        GpNextLevel: <fgui.GGroup>null,
        NextLv: <fgui.GTextField>null,
        GpUp: <fgui.GGroup>null,
        // BtnBuy: <CommonButtonBuy>null,
        TxtCost: <fgui.GTextField>null,
        BtnUp: <CommonButtonBuy>null,
        TxtTime: <fgui.GTextField>null,
        GpUping: <fgui.GGroup>null,
        BtnReduceTime: <CommonButton>null,
        BtnSpeedUp: <CommonButtonBuy>null,
        BtnHelp: <CommonButtonHelp>null,
        timer: <TimeMeter>null,
        ImgMax: <fgui.GImage>null,
        ListCur: <fgui.GList>null,
        ListNext: <fgui.GList>null,
        EffectShow: <UIEffectShow>null,
        ProBar: <fgui.GProgressBar>null,
        ListReward: <fgui.GList>null,
        GpCost: <fgui.GGroup>null,
        TxtTip: <fgui.GTextField>null,
    };

    protected extendsCfg = [
        { ResName: "BoxUpRewardCell", ExtendsClass: BoxUpRewardCell },
        { ResName: "BoxCurColorCell", ExtendsClass: BoxCurColorCell },
        { ResName: "BoxNextColorCell", ExtendsClass: BoxCurColorCell },
        { ResName: "ButtonBuy", ExtendsClass: CommonButtonBuy },
    ];

    private box_data: BoxData;
    // private list_data: { is_buy: number, width: number }[];
    private language = Language.Box;
    private curr_id: number;
    InitData() {
        let self = this;
        UH.SetText(self.viewNode.TxtTip, Language.Box.Tip10);
        self.box_data = BoxData.Inst();
        self.AddSmartDataCare(self.box_data.GetboxResultData(), self.FlushBoxData.bind(self), "box_level_data");

        self.AddSmartDataCare(RoleData.Inst().AdFlush, self.FlushAdShow.bind(self));
        self.curr_id = BoxData.Inst().GetBoxSpeedItemId();
        self.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCur.bind(this), "OtherChange");
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.setData.bind(this), "ReportListFlush");


        GuideCtrl.Inst().AddGuideUi("BtnBoxBuy", this.viewNode.BtnUp);//需要测指引流程！！！！！！！！！！！
        GuideCtrl.Inst().AddGuideUi("BtnBoxLevelUp", this.viewNode.BtnUp);

        GuildCtrl.Inst().SendGuildReqReportList()
    }

    InitUI() {
        let self = this;
        self.viewNode.Board.SetData(new BoardData(BoxInfoView, null, 1));
        // self.viewNode.ListPro.itemRenderer = self.renderListItem.bind(self);
        // self.viewNode.ListPro.setVirtual();
        // self.viewNode.BtnBuy.onClick(self.OnBuy.bind(self))
        self.viewNode.BtnUp.onClick(self.OnUp.bind(self))
        self.viewNode.BtnSpeedUp.onClick(self.OnSpeedUp.bind(self))
        self.viewNode.BtnReduceTime.onClick(self.OnClickAd.bind(self))
        self.viewNode.BtnHelp.onClick(self.OnClickHelp.bind(self))
        self.viewNode.timer.SetOutline(true, COLORSTR.Yellow2, 2)
        self.FlushBoxData();
        self.FlushCur();
        self.FlushAdShow();

        self.viewNode.BtnHelp.visible = FunOpen.Inst().GetFunIsOpen(Mod.Guild.Main).is_open
    }

    private FlushDailyAdShow() {
        let data_ad = RoleData.Inst().AdInfo;
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        let box_ad = data_ad.get(AdType.box_speed_up)
        this.viewNode.BtnReduceTime.visible = true;
        this.viewNode.BtnReduceTime.ShowRedPoint(BoxData.Inst().GetAdRed() == 1);
        if (!box_ad) {
            return
        }
        if (+co.ad_param - box_ad.todayCount <= 0) {
            this.viewNode.BtnReduceTime.visible = false;
            return
        }
        let time = box_ad.nextFetchTime - TimeCtrl.Inst().ServerTime
        this.viewNode.BtnReduceTime.grayed = time > 0;
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.box_speed_up)

        let is_grey = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount)));
        this.viewNode.BtnReduceTime.grayed = is_grey;
        this.viewNode.BtnReduceTime.ShowRedPoint(!is_grey);

        Timer.Inst().CancelTimer(this.timer_handle_ad)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_ad = Timer.Inst().AddCountDownCT(() => {
                let ft = TimeHelper.FormatDHMS(info.nextFetchTime - TimeCtrl.Inst().ServerTime);
                this.viewNode.BtnReduceTime.title = TextHelper.SizeStr(TextHelper.Format(Language.UiTimeMeter.TimeStr1, ft.hour, ft.minute, ft.second), 28)
            }, this.FlushAdShow.bind(this), info.nextFetchTime, 1)
        } else {
            this.viewNode.BtnReduceTime.title = Language.Box.BtnReduceTime
        }
    }

    private OnClickAd() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.box_speed_up)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                return
            }
        }
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.box_speed_up, TextHelper.Format(Language.adv.speed, co.ad_award[0].num * 5));
    }

    OnClickHelp() {
        GuildCtrl.Inst().SendGuildReqHelp(0)
    }

    private FlushCur() {
        let num = BagData.Inst().getItemNum(this.curr_id);
        UH.SetText(this.viewNode.TxtCurrNum, num);
        this.FlushCostColor();
    }

    private FlushCostColor() {
        if (this.cur_cfg) {
            let num = BagData.Inst().getItemNum(40000);
            let stroke_color = num >= this.cur_cfg.price ? new Color(9, 47, 0) : new Color(79, 4, 0);
            let color = num >= this.cur_cfg.price ? new Color(69, 190, 41) : new Color(255, 58, 58);
            this.viewNode.TxtCost.strokeColor = stroke_color;
            this.viewNode.TxtCost.color = color;
        }
    }

    private FlushBoxData() {
        let box_level_data = this.box_data.GetBoxInfo();
        if (box_level_data) {
            if (!this.cur_lv)
                this.cur_lv = box_level_data.boxLevel;
            // if( box_level_data.boxLevel!=this.cur_lv){//升级
            //     this.viewNode.EffectShow.PlayEff(4164013,()=>{
            //         this.cur_lv=box_level_data.boxLevel;
            //         this.setData()
            //     })
            // }else{
            //     this.setData();
            // }
            if (box_level_data.boxLevel != this.cur_lv) {
                this.cur_lv = box_level_data.boxLevel;
                this.viewNode.EffectShow.PlayEff(4164013);
                AudioManager.Inst().Play(AudioTag.ShengJi);
            }
            this.setData();
        }
    }

    private cur_cfg: CfgBoxRandomColor;
    private cur_lv: number;//当前等级
    private setData() {
        let self = this;
        let box_level_data = self.box_data.GetBoxInfo();
        if (box_level_data) {
            let cur_cfg = self.cur_cfg = BoxData.Inst().GetBoxRandomColorCfg();
            UH.SetText(self.viewNode.CurrLv, self.language.cur_lv + box_level_data.boxLevel);
            this.viewNode.ListCur.SetData(BoxData.Inst().GetBoxRandomColorList(cur_cfg));
            // this.viewNode.BtnBuy.ShowRedPoint(this.box_data.GetBoxBuyRed() == 1);
            this.viewNode.BtnUp.ShowRedPoint(this.box_data.GetBoxUpRed() == 1 || this.box_data.GetBoxBuyRed() == 1);
            this.viewNode.BtnSpeedUp.ShowRedPoint(this.box_data.GetBoxSpeedRed() == 1);
            if (BoxData.Inst().isBoxMaxLevel()) {//满级
                UH.SetText(self.viewNode.TxtUpTitle, self.language.box_up)
                self.viewNode.GpUp.visible = self.viewNode.GpUping.visible = self.viewNode.GpNextLevel.visible = false;
                self.viewNode.ImgMax.visible = true;
                UH.SpriteName(this.viewNode.CurLvBgLoder, "BoxInfo", "JinJieDi5");
                self.viewNode.ImgCurLvAttBg.width = 564;
                self.viewNode.GpCurrLevel.x = 221;
                self.viewNode.CurLvBgLoder.width = 591;
            } else {
                UH.SpriteName(this.viewNode.CurLvBgLoder, "BoxInfo", "JinJieDi1");
                self.viewNode.ImgCurLvAttBg.width = 351;
                self.viewNode.GpCurrLevel.x = 111;
                self.viewNode.CurLvBgLoder.width = 381;
                self.viewNode.ImgMax.visible = false;
                let next_lv = box_level_data.boxLevel + 1;
                let next_cfg = BoxData.Inst().GetBoxRandomColorCfg(next_lv);
                UH.SetText(self.viewNode.NextLv, self.language.next_lv + next_lv);
                this.viewNode.ListNext.SetData(BoxData.Inst().GetBoxRandomColorList(next_cfg))
                let time = box_level_data.timestamp - TimeCtrl.Inst().ServerTime;
                if (time > 0) {
                    self.viewNode.GpUp.visible = false;
                    self.viewNode.GpUping.visible = true;
                    this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_0);
                    UH.SetText(self.viewNode.TxtUpTitle, self.language.box_uping);
                    this.viewNode.BtnReduceTime.ShowRedPoint(BoxData.Inst().GetAdRed() == 1);
                    this.viewNode.BtnHelp.SetData({ type: GuildConfig.HelpType.box, level: box_level_data.boxLevel });
                } else {
                    self.viewNode.GpUp.visible = true;
                    self.viewNode.GpUping.visible = false;
                    let time_t = TimeHelper.FormatDHMS(cur_cfg.up_time_minute * 60);
                    let hour = time_t.day * 24 + time_t.hour;
                    let time = TextHelper.Format(Language.UiTimeMeter.TimeStr1, hour, time_t.minute, time_t.second)
                    UH.SetText(self.viewNode.TxtTime, self.language.time + TextHelper.ColorStr(time, COLORSTR.Green1));
                    UH.SetText(self.viewNode.TxtUpTitle, self.language.box_up)
                    let pro_data = self.box_data.GetBoxUpPro();
                    this.viewNode.ProBar.width = pro_data.max;
                    this.viewNode.ProBar.max = pro_data.max;
                    this.viewNode.ProBar.value = pro_data.val;
                    this.viewNode.ListReward.SetData(BoxData.Inst().GetBoxUpReward())
                    if (BoxData.Inst().IsBoxCanUp()) {
                        this.viewNode.BtnUp.title = Language.Common.up_level;
                        this.viewNode.GpCost.visible = false;
                    } else {
                        this.viewNode.BtnUp.title = Language.Common.buy;
                        this.viewNode.GpCost.visible = true;
                        UH.SetText(self.viewNode.TxtCost, this.cur_cfg.price)
                        this.FlushCostColor();
                    }
                    // if (box_level_data.buyTimes < cur_cfg.up_buy_num) {
                    //     this.viewNode.BtnUp.grayed = true
                    // } else {
                    //     this.viewNode.BtnUp.grayed = false
                    // }
                }
            }
        }
    }

    // private renderListItem(index: number, item: BoxBuyProCell) {
    //     let self = this;
    //     item.SetData(self.list_data[index]);
    // }

    // private OnBuy() {
    //     let self = this;
    //     self.box_data.sendBuy()
    // }

    private OnUp() {
        let self = this;
        if (BoxData.Inst().IsBoxCanUp()) {
            self.box_data.sendUp()
        } else {
            self.box_data.sendBuy()
        }
    }

    private OnSpeedUp() {
        let self = this;
        self.box_data.SpeedUp()
    }
    CloseCallBack() {
        let self = this;
        let box_level_data = self.box_data.GetBoxInfo();
        if (box_level_data) {
            let time = box_level_data.timestamp - TimeCtrl.Inst().ServerTime;
            if (time > 0)
                ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.box)
        }
        GuideCtrl.Inst().ClearGuideUi("BtnBoxBuy");
        GuideCtrl.Inst().ClearGuideUi("BtnBoxLevelUp");
        this.viewNode.timer.CloseCountDownTime();
        GuideCtrl.Inst().ForceStop();
        Timer.Inst().CancelTimer(this.timer_handle_ad)
    }

    private OnReduceTime() {
        let data_ad = RoleData.Inst().AdInfo
        let box_ad = data_ad.get(AdType.box_speed_up)
        if (box_ad) {
            let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
            if (+co.ad_param - box_ad.todayCount <= 0) {
                this.viewNode.BtnReduceTime.visible = false;
                return
            }
            if (box_ad.nextFetchTime != 0) {
                let time = box_ad.nextFetchTime - TimeCtrl.Inst().ServerTime
                if (time > 0) {
                    let fTime = TimeHelper.FormatDHMS(time);
                    let tip = Language.Box.tip9;
                    if (fTime.minute > 0 || fTime.hour > 0) {
                        tip = fTime.minute + Language.Date.minute + tip
                        if (fTime.hour > 0) {
                            tip = fTime.hour + Language.Date.hour + tip
                        }
                        PublicPopupCtrl.Inst().Center(tip);
                    }
                    return
                }
            }
        }
        this.viewNode.BtnReduceTime.grayed = false;
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        // PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.adv.speed, co.ad_award[0].num * 5))
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.box_speed_up, TextHelper.Format(Language.adv.speed, co.ad_award[0].num * 5));
    }
}

class BoxUpRewardCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Block: <fgui.GGraph>null,
        ObjFetched: <fgui.GGroup>null,
        redPoint: <RedPoint>null,
        Pro: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.GetReward.bind(this));
    }
    public SetData(data: { item: CfgItem, is_fetch: number, can_fetch: boolean, seq: number }) {
        this._data = data;
        this.viewNode.Cell.SetData(Item.Create(data.item, { is_num: true }));
        this.viewNode.Block.visible = data.can_fetch;
        this.viewNode.ObjFetched.visible = data.is_fetch == 1;
        this.viewNode.redPoint.SetNum(data.can_fetch ? 1 : 0);
        UH.SpriteName(this.viewNode.Pro, "BoxInfo", (data.is_fetch == 1 || data.can_fetch) ? "FenGeFuGaoLiang" : "FenGeFu")
    }
    public GetReward() {
        if (this._data) {
            if (this._data.can_fetch) {
                BoxCtrl.Inst().SendBoxReq(BoxReqType.FETCH_LEVEL_REWARD, this._data.seq);
            }
        }
    }
}

class BoxCurColorCell extends fgui.GLabel {
    private viewNode = {
        TxtNum: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(num: number) {
        UH.SetText(this.viewNode.TxtNum, (num / 100) + "%");
    }
}

