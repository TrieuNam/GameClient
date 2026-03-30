import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FriendsRankView } from "modules/friends_rank/FriendsRankView";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { GuildCtrl } from "modules/guild/GuildCtrl";
import { GuildData } from "modules/guild/GuildData";
import { GuildJoinView } from "modules/guild/GuildJoinView";
import { GuildView } from "modules/guild/GuildView";
import { ItemRecycling } from "modules/item_recycling/ItemRecycling";
import { KnightCardView } from "modules/knight_card/KnightCardView";
import { ManualView } from "modules/Manual/ManualView";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { ShopView } from "modules/shop/ShopView";
import { Timer } from "modules/time/Timer";
import { UH } from "../../helpers/UIHelper";
import { RedPoint } from '../extends/RedPoint';


@BaseView.registView
export class MainOtherView extends BaseView {
    private timer_close: any = null;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MainOther",
        ViewName: "MainOtherView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        // BtnClose: <fgui.GButton>null,
        List: <fgui.GList>null,
        RedPoint: <RedPoint>null,
    }

    protected extendsCfg = [
        { ResName: "MainOtherCell", ExtendsClass: MainOtherCell },
    ];

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    InitData() {
        let self = this;
        //self.viewNode.List.itemRenderer = self.renderListItem.bind(self);
        //self.viewNode.List.numItems = main_other_data.length;
        // self.viewNode.BtnClose.onClick(self.OnClose.bind(self));
        let data: any = []
        main_other_data.forEach(element => {
            let is_open = FunOpen.Inst().GetFunIsOpen(element.mod_key).is_open;
            if (is_open) {
                data.push(element)
            }
        });
        self.viewNode.List.on(fgui.Event.CLICK_ITEM, self.onClickItem, self)
        self.viewNode.List.SetData(data)
    }

    InitUI() {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(Mod.Other));
    }

    private renderListItem(index: number, item: MainOtherCell) {
        item.SetData(main_other_data[index]);
    }

    private OnClose() {
        ViewManager.Inst().CloseView(MainOtherView)
    }

    private onClickItem(item: MainOtherCell) {
        this.OnClose();
        if (item.main_data.click_func) {
            item.main_data.click_func()
            return
        }
        if (item.main_data.mod_key) {
            ViewManager.Inst().OpenViewByKey(item.main_data.mod_key);
            return;
        }
        if (item.main_data.view) {
            ViewManager.Inst().OpenView(item.main_data.view);
        }
    }

    closeView() {
        if (this.timer_close) {
            return
        }
        for (let element of this.viewNode.List._children) {
            let item = <MainOtherCell>element;
            item.CloseShow && item.CloseShow();
        }
        this.timer_close = Timer.Inst().AddRunTimer(() => {
            super.closeView()
        }, 0.05 * main_other_data.length, 1, false);
    }
    CloseCallBack() {
        Timer.Inst().CancelTimer(this.timer_close)
    }

}

class MainOtherCell extends BaseItem {
    TwShow: fgui.GTweener = null;
    AnimSpeed: number = 0.05
    protected viewNode = {
        Bg: <fgui.GLoader>null,
        Title: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
        RedPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    main_data: MainOtherData;
    public SetData(data: MainOtherData) {
        this._data = data;

        this.x = 291
        if (this.TwShow) {
            this.TwShow.kill();
            this.TwShow = null
        }
        this.TwShow = fgui.GTween.delayedCall(this.AnimSpeed * data.index)._to(291, 0, this.AnimSpeed)
            .setEase(fgui.EaseType.Linear)
            .onUpdate((tweener: fgui.GTweener) => {
                this.x = tweener.value.x
            })

        UH.SpriteName(this.viewNode.Icon, "MainOther", data.icon);
        UH.SpriteName(this.viewNode.Bg, "MainOther", data.bg);
        UH.SetText(this.viewNode.Title, data.title);
        this.main_data = data;
        if (data.mod_key == Mod.MysteryShopView.View) {
            GuideCtrl.Inst().AddGuideUi("BtnMysteryShop", this);
        }
        this.InitGuide();
        if (data.mod_key) {
            let is_open = FunOpen.Inst().GetFunIsOpen(data.mod_key).is_open;
            this.grayed = !is_open;
            if (!is_open) {
                FunOpen.Inst().RgCheckFunc(data.mod_key, this.OnFunOpenChange.bind(this))
            }

            // 简单的红点
            let r_num = RemindCtrl.Inst().GetRemindNum(data.mod_key);
            let g_num = RemindCtrl.Inst().GetGroupNum(data.mod_key);
            let num = (r_num + g_num) > 0 ? 1 : 0
            this.viewNode.RedPoint.SetNum(num);
        }
    }

    OnFunOpenChange(key: number | string, is_open: boolean) {
        this.grayed = !is_open
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key)
        }
    }

    protected onDestroy() {
        if (this._data && this._data.mod_key == Mod.MysteryShopView.View)
            GuideCtrl.Inst().ClearGuideUi("BtnMysteryShop");
        if (this._data && this._data.mod_key) {
            FunOpen.Inst().ClearRgFunc(this._data.mod_key);
        }
        if (this._data && this._data.mod_key == Mod.LoopMine.View) { GuideCtrl.Inst().ClearGuideUi("MainOtherLoopMine"); }
        if (this.TwShow) {
            this.TwShow.kill();
            this.TwShow = null
        }
    }

    public InitGuide() {
        if (this._data.mod_key == Mod.LoopMine.View) {
            GuideCtrl.Inst().AddGuideUi("MainOtherLoopMine", this);
        }
    }

    public CloseShow() {
        this.TwShow = fgui.GTween.delayedCall(this.AnimSpeed * this._data.index)._to(0, 291, this.AnimSpeed)
            .setEase(fgui.EaseType.Linear)
            .onUpdate((tweener: fgui.GTweener) => {
                this.x = tweener.value.x
            })
    }
}

class MainOtherData {
    index: number;
    bg: string;
    title: string;
    view: any;
    icon: string;
    mod_key?: number;
    click_func?: Function
}

let main_other_data: MainOtherData[] = [
    { index: 0, bg: 'HongDi', title: Language.MainOther.shop, view: ShopView, icon: "JiShi", mod_key: Mod.Shop.View },
    { index: 1, bg: 'HuangDi', title: Language.MainOther.manual, view: ManualView, icon: "ShouCe", mod_key: Mod.Other.Manual },
    // { index: 2, bg: 'LanDi', title: Language.LoopMine.MainTitle, view: LoopMineView, icon: "DuoBao", mod_key: Mod.LoopMine.View },
    // { bg: 'LvDi', title: Language.MainOther.mystery_shop, view: MysteryShopView, icon: "ShenMiShangDian", mod_key: Mod.MysteryShopView.View },
    {
        index: 2, bg: 'LvDi', title: Language.MainOther.guild, view: GuildView, icon: "QiShiTuan", mod_key: Mod.Guild.Main, click_func: () => {
            if (GuildData.Inst().IsInGuild()) {
                ViewManager.Inst().OpenView(GuildView)
            } else {
                GuildCtrl.Inst().SendGuildReqGuildList()
                ViewManager.Inst().OpenView(GuildJoinView)
            }
        }
    },
    { index: 3, bg: 'HongDi', title: Language.MainOther.knight_card, view: KnightCardView, icon: "QiShiZhiZheng", mod_key: Mod.KnightCard.Main },
    { index: 4, bg: 'ZiDi', title: Language.MainOther.friend_rank, view: FriendsRankView, icon: "HaoYou", mod_key: Mod.FriendsRank.Main },
    { index: 5, bg: 'ZiDi2', title: Language.MainOther.item_recycling, view: ItemRecycling, icon: "WuPinHuiShou", mod_key: Mod.ItemRecycling.Main },
    // { bg: '', title: "公会", view_name: "", mod_key: 0 },
]
