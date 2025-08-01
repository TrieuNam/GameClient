import { CfgScoreFund, CfgScoreFundPhase, CfgScoreFundReward } from "config/CfgScoreFund";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { COLORS } from "modules/common/ColorEnum";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { RoleData } from "modules/role/RoleData";
import { UH } from "../../helpers/UIHelper";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { Language } from 'modules/common/Language';


import { ScoreFundData, ScoreFundRewardData, ScoreFundCtrl, ScoreFund_OP_TYPE } from "./ScoreFundCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { BoxFundRewardView } from "modules/boxfund/BoxFundRewardView";
import { TextHelper } from "../../helpers/TextHelper";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { LogError } from "core/Debugger";


export class ScoreFundView extends BaseItem {
    private select_btn_index = 0;
    protected handleCollector: HandleCollector;

    protected viewNode = {
        List: <fgui.GList>null,
        BtnBuy: <fgui.GButton>null,
        BtnReward: <fgui.GButton>null,
        FundBtnBg: <fgui.GImage>null,
        BtnList: <fgui.GList>null,
    };

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.List.setVirtual();
        this.AddSmartDataCare(ScoreFundData.Inst().ResultData, this.FlushAll.bind(this), "info");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushAll.bind(this), "roleLevel");
        this.viewNode.BtnList.on(fgui.Event.CLICK_ITEM, this.changeBtn, this);
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this)); 
        this.viewNode.BtnReward.onClick(this.OnClickOpenRewardView.bind(this)); 
        this.FlushAll();
        this.viewNode.FundBtnBg.width = CfgScoreFund.phase_configure.length * 166 + 8;
    }

    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    public FlushAll() {
        this.viewNode.BtnList.SetData(CfgScoreFund.phase_configure);
        this.viewNode.BtnList.selectedIndex = this.select_btn_index;
        this.FlushData();
    }

    public FlushData() {
        let phase = CfgScoreFund.phase_configure[this.select_btn_index].phase;
        this.viewNode.List.SetData(ScoreFundData.Inst().GetListByPhase(phase));
        let cfg: CfgScoreFundPhase = CfgScoreFund.phase_configure[this.select_btn_index];
        if (!ScoreFundData.Inst().IsBuy(cfg.phase)) {
            this.viewNode.BtnBuy.visible = true;
            this.viewNode.BtnBuy.title = cfg.buy_money / 10 +"" ;
        } else {
            this.viewNode.BtnBuy.visible = false;// = Language.ActCommon.YiGouMai;
        }
    }

    private changeBtn(item: ButtonFund) {
        let data: CfgScoreFundPhase = item.GetData();
        if (RoleData.Inst().GetRoleLevel() >= data.show_level) {
            this.select_btn_index = this.viewNode.BtnList.selectedIndex;
            this.FlushData();
        } else {
            this.viewNode.BtnList.selectedIndex = this.select_btn_index;
            PublicPopupCtrl.Inst().Center(Language.FunOpen.LevelTip)
        }
    }

    private onBuy() {
        let cfg: CfgScoreFundPhase = CfgScoreFund.phase_configure[this.select_btn_index];
        if (!ScoreFundData.Inst().IsBuy(cfg.phase)) {
            let money = cfg.buy_money;
            let order = Order_Data.initOrder(cfg.phase, ACTIVITY_TYPE.ScoreFund, money/10, money, Language.ScoreFund.ScoreFund, 0);
            OrderCtrl.generateOrder(order);
        }
    }
    private OnClickOpenRewardView() {
        let param = {
            type: 3,
            pause: CfgScoreFund.phase_configure[this.select_btn_index].phase
        }
        ViewManager.Inst().OpenView(BoxFundRewardView, param);
    }
}

export class ScoreFundItem extends BaseItem {
    protected viewNode = {
        Title: <fgui.GTextField>null,
        CommonReward: <ScoreFundRewardItem>null,
        List: <fgui.GList>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.CommonReward.onClick(this.OnClickCommon.bind(this));
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.OnClickSenior, this);
    }

    public SetData(data: { common_data: ScoreFundRewardData, senior_data: ScoreFundRewardData[], title: string, cfg: CfgScoreFundReward }) {
        this._data = data;
        UH.SetText(this.viewNode.Title, data.title);
        this.viewNode.CommonReward.SetData(data.common_data);
        this.viewNode.List.SetData(data.senior_data);
    }

    private OnClickCommon() {
        if (this._data) {
            let common_data: ScoreFundRewardData = this._data.common_data;
            if (common_data.red == 1) {
                AudioManager.Inst().Play(AudioTag.TongYongClick);
                ScoreFundCtrl.Inst().SendReq(ScoreFund_OP_TYPE.FETCH, this._data.cfg.seq);
            }
        }
    }

    private OnClickSenior(item: ScoreFundRewardItem) {
        if (this._data) {
            let data: ScoreFundRewardData = item.GetData();
            let is_buy = ScoreFundData.Inst().IsBuy(this._data.cfg.phase);
            if (is_buy && !data.is_fetch) {
                AudioManager.Inst().Play(AudioTag.TongYongClick);
                ScoreFundCtrl.Inst().SendReq(ScoreFund_OP_TYPE.FETCH, this._data.cfg.seq);
            } else if (this._data.common_data.is_fetch && !is_buy) {
                let cfg: CfgScoreFundReward = this._data.cfg;
                let money = CfgScoreFund.phase_configure[cfg.phase - 1].buy_money;
                let order = Order_Data.initOrder(cfg.phase, ACTIVITY_TYPE.ScoreFund, money/10, money, Language.ScoreFund.ScoreFund, 0);
                OrderCtrl.generateOrder(order);
            }
        }
    }
}

export class ScoreFundRewardItem extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        ImgMengBan: <fgui.GImage>null,
        ImgFetch: <fgui.GImage>null,
        ImgLock: <fgui.GImage>null,
        redPoint: <RedPoint>null,
        EffectShow: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: ScoreFundRewardData) {
        this._data = data;
        this.viewNode.Cell.SetData(Item.Create(data.item, { is_click: data.is_click, is_num: true }));
        this.viewNode.ImgMengBan.visible = data.is_fetch || data.is_lock;
        this.viewNode.ImgFetch.visible = data.is_fetch;
        this.viewNode.ImgLock.visible = data.is_lock;
        this.viewNode.redPoint.SetNum(data.red);
        this.viewNode.EffectShow.StopAllEff();
        if (data.red) {
            this.viewNode.EffectShow.PlayEff(4164011);
        }
    }
}

export class ButtonFund extends BaseItemGB {
    protected viewNode = {
        SelectTitle: <fgui.GTextField>null,
        ImgLock: <fgui.GImage>null,
        title: <fgui.GTextField>null,
        redPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: CfgScoreFundPhase) {
        this._data = data;
        UH.SetText(this.viewNode.SelectTitle, data.seg_name);
        UH.SetText(this.viewNode.title, data.seg_name);
        this.viewNode.ImgLock.visible = RoleData.Inst().GetRoleLevel() < data.show_level;
        this.viewNode.title.color = this.viewNode.ImgLock.visible ? COLORS.Gray2 : COLORS.Yellow1;
        this.viewNode.redPoint.SetNum(ScoreFundData.Inst().GetRedByPhase(data));
    }
}



