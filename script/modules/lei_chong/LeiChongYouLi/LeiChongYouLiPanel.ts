import * as fgui from "fairygui-cc";
import { UH } from "../../../helpers/UIHelper";
import { LeiChongYouLiCtrl, LeiChongYouLiData, LeiChong_OP_TYPE } from "./LeiChongYouLiCtrl";
import { RechargeData } from "modules/recharge/RechargeData";
import { ViewManager } from "manager/ViewManager";
import { Mod } from "modules/common/ModuleDefine";
import { Item } from "modules/bag/ItemData";
import { CfgLeiChong, CfgLeiChongReward } from "config/CfgLeiChong";
import { BaseItem } from "modules/common/BaseItem";
import { TextHelper } from "../../../helpers/TextHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RedPoint } from "modules/extends/RedPoint";
import { Timer } from "modules/time/Timer";
import { ItemCell } from "modules/extends/ItemCell";
import { Language } from "modules/common/Language";
import { game, Game } from "cc";
import { CfgItem } from "config/CfgCommon";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { LeiChongBasePanel } from "../LeiChongBasePanel";
export class LeiChongYouLiPanel extends LeiChongBasePanel {
    handle: any = null;
    private show_data: any[];
    private list_scrollPane: fgui.ScrollPane;
    private show_items: CfgItem[];

    protected viewNode = {
        ProGress: <fgui.GProgressBar>null,
        TxtNext: <fgui.GTextField>null,
        GpNext: <fgui.GGroup>null,
        ListReward: <fgui.GList>null,
        BtnChongZhi: <fgui.GButton>null,
        List: <fgui.GList>null,
    }

    InitData() {
        this.viewNode.List.setVirtual();
        this.AddSmartDataCare(LeiChongYouLiData.Inst().ResultData, this.FlushData.bind(this), "info");
        this.AddSmartDataCare(RechargeData.Inst().ResultData, this.FlushData.bind(this), "is_change");
        this.viewNode.BtnChongZhi.onClick(this.onBtnClick.bind(this));
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
        this.FlushData();
    }

    private FlushData() {
        if (LeiChongYouLiData.Inst().IsLeiChongActShow()){
            let leichong_data = LeiChongYouLiData.Inst().GetLeiChongData();
            this.viewNode.List.SetData(leichong_data.list);
            this.viewNode.ProGress.max = leichong_data.next_target;
            this.viewNode.ProGress.value = leichong_data.cur_value;
            let money = Math.ceil((leichong_data.next_target - leichong_data.cur_value));
            UH.SetText(this.viewNode.TxtNext, TextHelper.Format(Language.LeiChong.NextTip, money));
            this.viewNode.TxtNext.visible = this.viewNode.GpNext.visible = money != 0;
        }
    }

    InitUI() {
        this.show_items = CfgLeiChong.item_show[0].reward_id;
        this.show_data = Item.DefaultCreateListItem(this.show_items);
        this.viewNode.ListReward.setVirtualAndLoop();
        this.viewNode.ListReward.itemRenderer = <fgui.ListItemRenderer>this.renderListItem.bind(this);
        this.viewNode.ListReward.numItems = this.show_items.length;
        // this.viewNode.ListReward.SetData(this.show_data);
        // this.onGameShow();
    }

    protected onGameHide(): void {
        Timer.Inst().CancelTimer(this.handle);
    }

    OnShow() {
        this.onGameShow();
    }

    OnHide() {
        this.onGameHide();
    }

    protected onGameShow(): void {
        Timer.Inst().CancelTimer(this.handle);
        if (this.show_items.length > 4) {
            this.list_scrollPane = this.viewNode.ListReward.scrollPane;
            this.list_scrollPane.scrollStep = 116;
            this.handle = Timer.Inst().AddRunTimer(this.FlushRewardShow.bind(this), 3)
        }
    }

    private renderListItem(index: number, item: ItemCell) {
        let self = this;
        item.SetData(self.show_data[index]);
    }


    private FlushRewardShow() {
        if (this.list_scrollPane)
            this.list_scrollPane.scrollRight(1, true);
    }

    private onBtnClick() {
        ViewManager.Inst().OpenViewByKey(Mod.Shop.DiamondShop);
    }

    protected onDestroy(): void {
        super.onDestroy();
        Timer.Inst().CancelTimer(this.handle);
        game.off(Game.EVENT_HIDE, this.onGameHide, this);
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
        this.list_scrollPane = null;
        this.handle = null;
    }
}

export class LeiChongCell extends BaseItem {
    protected viewNode = {
        ImgFetched: <fgui.GImage>null,
        TxtDesc: <fgui.GRichTextField>null,
        ListReward: <fgui.GList>null,
        BtnFetch: <CommonButtonBuy>null,
        RedPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.ListReward.setVirtual();
        this.viewNode.BtnFetch.onClick(this.onBtnClick.bind(this));
    }
    public SetData(data: { cfg: CfgLeiChongReward, flag: number, achieve: boolean }) {
        this._data = data;
        if (data.flag == 1) {
            this.viewNode.ImgFetched.visible = true;
            this.viewNode.BtnFetch.visible = false;
            this.grayed = true;
        } else {
            this.viewNode.ImgFetched.visible = false;
            this.viewNode.BtnFetch.visible = true;
            this.grayed = false;
        }
        UH.SetText(this.viewNode.TxtDesc, data.cfg.diamond / 10);
        let eff = data.achieve && data.flag != 1 ? 4164011 : -1;
        this.viewNode.ListReward.SetData(Item.DefaultCreateListItem(data.cfg.reward_item, { is_gray: this.grayed, is_click: true, is_num: true, eff: eff }));
        this.viewNode.BtnFetch.SetTitle(data.achieve ? Language.ActCommon.LingQu : Language.ActCommon.WeiDaCheng);
        this.viewNode.RedPoint.SetNum(data.achieve && data.flag != 1 ? 1 : 0);
    }

    private onBtnClick() {
        if (this._data) {
            if (this._data.achieve) {
                LeiChongYouLiCtrl.Inst().SendReq(LeiChong_OP_TYPE.FETCH, this._data.cfg.seq)
            } else {
                PublicPopupCtrl.Inst().Center(Language.LeiChong.WeiDaCheng);
            }
        }
    }
}