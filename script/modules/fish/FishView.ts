import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { MonthlyCardView } from "modules/MonthlyCard/MonthlyCardView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR, QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { ICON_TYPE, ItemColor } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { Currency } from "modules/extends/Currency";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { FishBoxInfoView } from "modules/item_info/FishBoxInfoView";
import { MainFlyIcon } from "modules/main/MainBottom";
import { RoleData } from "modules/role/RoleData";
import { SPINE_ANI_SLOT, SPINE_ANI_STATE } from "modules/scene_obj_spine/ObjSpineConfig";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { MysteryShopView } from "modules/shop/mystery_shop/MysteryShopView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { FishAttrView } from "./FishAttrView";
import { FishConfig } from "./FishConfig";
import { FishData } from "./FishData";
import { FishHandbookView } from "./FishHandbookView";
import { FishMapView } from "./FishMapView";
import { FishOrderView } from "./FishOrderView";
import { FishSettingView } from "./FishSettingView";
import { FishToolUpView } from "./FishToolUpView";


@BaseView.registView
export class FishView extends BaseView {
    guide_tag: string[] = []
    private timer_handle: any = null;
    private DragShowAnim: fgui.Transition;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Fish",
        ViewName: "FishView",
        LayerType: ViewLayer.Buttom,
    };

    protected viewNode = {
        BtnReturn: <fgui.GButton>null,
        BtnBox: <fgui.GButton>null,
        BtnHandbook: <fgui.GButton>null,
        BtnShop: <fgui.GButton>null,
        BtnMap: <fgui.GButton>null,
        BtnCard: <fgui.GButton>null,
        BtnSetting: <fgui.GButton>null,
        BtnStart: <fgui.GButton>null,
        BtnInfo: <fgui.GButton>null,

        BtnOrder: <FishViewOrderButton>null,
        BgSp: <EGLoader>null,
        BgSpF: <EGLoader>null,
        UIModelShow: <UIModelShow>null,

        Currency1: <Currency>null,
        Currency2: <Currency>null,
        Currency3: <Currency>null,

        TimeShow: <TimeMeter>null,
        GpAnim: <fgui.GGroup>null,

        ToolList: <fgui.GList>null,
        UIEffectShow1: <UIEffectShow>null,
        UIEffectShow2: <UIEffectShow>null,
        CellShow: <ItemCell>null,

        RedPointShowCollect: <RedPoint>null,
        RedPointShowBox: <RedPoint>null,
        RedPointShowMap: <RedPoint>null,

        GpBoxTime: <fgui.GGroup>null,
        BoxTimeShow: <TimeMeter>null,
    };

    protected extendsCfg = [
        { ResName: "ButtonOrder", ExtendsClass: FishViewOrderButton },
        { ResName: "ItemOrder", ExtendsClass: FishViewOrderItem },
        { ResName: "ItemTool", ExtendsClass: FishViewToolItem },
    ];

    DoOpenWaitHandle() {
        let waitHandle = this.createWaitHandle("loadBG")
        this.AddWaitHandle(waitHandle);
        this.FlushWaBaoMapInfo(waitHandle)
    }

    InitData() {
        this.viewNode.BtnReturn.onClick(this.OnClickReturn, this);
        this.viewNode.BtnBox.onClick(this.OnClickBox, this);
        this.viewNode.BtnHandbook.onClick(this.OnClickHandbook, this);
        this.viewNode.BtnShop.onClick(this.OnClickShop, this);
        this.viewNode.BtnMap.onClick(this.OnClickMap, this);
        this.viewNode.BtnSetting.onClick(this.OnClickSetting, this);
        this.viewNode.BtnCard.onClick(this.OnClickCard, this);
        this.viewNode.BtnOrder.onClick(this.OnClickOrder, this);
        this.viewNode.BtnStart.onClick(this.OnClickStart, this);
        this.viewNode.BtnInfo.onClick(this.OnClickInfo, this);
        this.viewNode.ToolList.on(fgui.Event.CLICK_ITEM, this.OnClickToolItem, this);

        let appear = RoleData.Inst().GetAppearanceRes(true)
        appear.surfaceMount = 0
        appear.surfaceWeapon = -1
        appear.surfaceAngel = -1
        this.viewNode.UIModelShow.setPath(ResPath.ActorRole(10001), appear);
        this.viewNode.UIModelShow.setSkin2(SPINE_ANI_SLOT.WEAPON, ResPath.UIEffect(4169022))
        this.viewNode.Currency1.SetCurrencyId(FishData.Inst().CfgOtherTiLiItem(), true);
        this.viewNode.Currency2.SetCurrencyId(FishData.Inst().CfgOtherBoxUpItem());
        this.viewNode.Currency3.SetCurrencyId(FishData.Inst().CfgOtherUpItemId(), true);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoInfo.bind(this), "WaBaoInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoTaskInfo.bind(this), "WaBaoTaskInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoToolInfo.bind(this), "WaBaoToolInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoMapInfo.bind(this), "WaBaoMapInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoCollectionBookInfo.bind(this), "WaBaoCollectionBookInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoCollectionBookInfo.bind(this), "WaBaoBookListInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoState.bind(this), "WaBaoState");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoEffect.bind(this), "WaBaoEffect");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoSellEffect.bind(this), "WaBaoSellEffect");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushWaBaoToolInfo.bind(this), "OtherChange");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushWaBaoCollectionBookInfo.bind(this), "OtherChange");

        this.DragShowAnim = this.view.getTransition("DragShow");

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("FishStartBtn", this.viewNode.BtnStart))
    }

    InitUI() {
        this.FlushWaBaoInfo()
        this.FlushWaBaoTaskInfo()
        this.FlushWaBaoToolInfo()
        this.FlushWaBaoCollectionBookInfo()
        this.viewNode.GpAnim.visible = 0 == FishData.Inst().ResultData.WaBaoState
    }

    CloseCallBack() {
        this.viewNode.TimeShow.CloseCountDownTime()
        this.viewNode.BoxTimeShow.CloseCountDownTime()

        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
        Timer.Inst().CancelTimer(this.timer_handle)
        GuideCtrl.Inst().ForceStop()

        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.fish);

    }

    FlushWaBaoInfo() {
        this.FlushTiLiTimeShow();
        this.FlushBoxTimeShow();
    }

    FlushWaBaoTaskInfo() {
        this.viewNode.BtnOrder.SetData(FishData.Inst().GetWaBaoTaskListShow())
    }

    FlushWaBaoToolInfo() {
        // this.viewNode.ToolList.SetData(FishData.Inst().GetWaBaoToolsShow(), this.OnClickToolItem.bind(this))
        this.viewNode.ToolList.SetData(FishData.Inst().GetWaBaoToolsShow())
    }

    FlushWaBaoMapInfo(waitHandle?: any) {
        let map_res = FishData.Inst().GetWaBaoMapInfoCurMapResource();
        UH.SpriteName(this.viewNode.BgSpF, "Fish", `BeiJing${map_res}`);
        this.viewNode.BgSp.SetIcon(`loader/fish/BeiJing${map_res}`, () => {
            if (undefined != waitHandle) {
                AudioManager.Inst().PlayBg(AudioTag.WaBaoBg);
                waitHandle.complete = true;
            }
            // this.viewNode.BgSp.width = 1125 * (fgui.GRoot.inst.height / 1500);
        })
        this.viewNode.RedPointShowMap.SetNum(1 == FishData.Inst().GetWabaoMapRedPoint() ? 1 : 0)
    }

    FlushWaBaoCollectionBookInfo() {
        this.viewNode.RedPointShowCollect.SetNum((1 == FishData.Inst().GetWabaoCollectUpRedPoint() || 1 == FishData.Inst().GetWabaoCollectionBookActiveRedPoint()) ? 1 : 0)
        this.viewNode.RedPointShowBox.SetNum(1 == FishData.Inst().GetWabaoBoxUpRedPoint() ? 1 : 0)
    }
    FlushWaBaoState() {
        if (FishData.Inst().ResultData.WaBaoState > 0) {
            this.viewNode.UIModelShow.setAniName(SPINE_ANI_STATE.ATTACK, false)
            Timer.Inst().CancelTimer(this.timer_handle)
            this.timer_handle = Timer.Inst().AddRunTimer(() => {
                AudioManager.Inst().Play(AudioTag.WaBaoHuiChuTou);
                this.viewNode.UIEffectShow1.PlayEff(4169018)
                this.viewNode.UIEffectShow1.PlayEff(4164028)
            }, 0.5, 1, false);
        } else {
            this.viewNode.UIEffectShow1.StopEff(4169018)
        }
        this.viewNode.GpAnim.visible = false
    }

    FlushWaBaoEffect() {
        let eff = FishData.Inst().ResultData.WaBaoEffect
        if (eff.color > 0) {
            let eff1 = eff.color > ItemColor.Blue ? 4169019 : 4169020
            let eff2 = GetCfgValue(FishConfig.WaBaoEff3, eff.color)
            this.viewNode.UIEffectShow1.PlayEff(eff1)
            this.viewNode.UIEffectShow1.PlayEff(eff2)
            this.viewNode.UIEffectShow2.PlayEff(GetCfgValue(FishConfig.WaBaoEff1, eff.color))
            this.viewNode.UIEffectShow2.PlayEff(GetCfgValue(FishConfig.WaBaoEff2, eff.color))
            this.viewNode.CellShow.SetData(Item.Create(eff))
            this.DragShowAnim.play(() => {
                this.viewNode.UIEffectShow2.StopEff(GetCfgValue(FishConfig.WaBaoEff1, eff.color))
                this.viewNode.UIEffectShow2.StopEff(GetCfgValue(FishConfig.WaBaoEff2, eff.color))
                this.viewNode.UIEffectShow1.StopEff(eff1)
                this.viewNode.UIEffectShow1.StopEff(eff2)
            });
        }
    }

    private _arr_coin: MainFlyIcon[] = [];
    FlushWaBaoSellEffect() {
        let eff = FishData.Inst().ResultData.WaBaoSellEffect
        if (eff.itemId > 0) {
            let price = Item.GetSfbPrice(eff.itemId)
            let d = Math.floor(price / 5)//
            d = d == 0 ? 1 : d
            let num = d
            for (let index = 1; index < 6; index++) {
                if (price > 0) {
                    let flyIcon = this._arr_coin[index];
                    if (!flyIcon) {
                        flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                        flyIcon.scaleX = 1.5
                        flyIcon.scaleY = 1.5
                        this.addChild(flyIcon)
                    }
                    if (price - d < 0) {
                        flyIcon.PlayTween(1, price, 430, 1350, "KaoGuYinBi")
                    } else {
                        flyIcon.PlayTween(1, +d, 430, 1350, "KaoGuYinBi")
                    }
                    price = price - d
                }
            }
        }
    }

    FlushTiLiTimeShow() {
        this.viewNode.TimeShow.CloseCountDownTime()
        if (FishData.Inst().GetWaBaoInfoTiLiTime() > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(FishData.Inst().GetWaBaoInfoTiLiTime(), TimeFormatType.TYPE_TIME_0)
            this.viewNode.TimeShow.SetCallBack(this.FlushTiLiTimeShow.bind(this))
        }
        else {
            this.viewNode.TimeShow.SetTime("")
        }
    }

    FlushBoxTimeShow() {
        this.viewNode.BoxTimeShow.CloseCountDownTime()
        let info = FishData.Inst().ResultData.WaBaoInfo
        let is_uping = TimeCtrl.Inst().ServerTime < info.collectionLevelUpTime
        this.viewNode.GpBoxTime.visible = is_uping
        if (is_uping) {
            this.viewNode.BoxTimeShow.StampTime(info.collectionLevelUpTime, TimeFormatType.TYPE_TIME_0)
            this.viewNode.BoxTimeShow.SetCallBack(this.FlushBoxTimeShow.bind(this))
        }
        else {
            this.viewNode.BoxTimeShow.SetTime("")
        }
    }


    OnClickReturn() {
        AudioManager.Inst().PlayBg(AudioTag.ZhuJieMian);
        ViewManager.Inst().CloseView(FishView);
    }

    OnClickBox() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(FishBoxInfoView);
    }

    OnClickHandbook() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(FishHandbookView);
    }

    OnClickShop() {
        ViewManager.Inst().OpenView(MysteryShopView);
    }

    OnClickSetting() {
        ViewManager.Inst().OpenView(FishSettingView);
    }

    OnClickCard() {
        MonthlyCardView.CurSelCardIndex = 1
        // ServerActivityData.Inst().SetQuickOpen("MonthlyCardView")
        // ViewManager.Inst().OpenView(ServerActivityView)
        ViewManager.Inst().OpenViewByKey(Mod.ServerActivity.MonthlyCard)
    }

    OnClickMap() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(FishMapView);
    }

    OnClickOrder() {
        ViewManager.Inst().OpenView(FishOrderView);
    }

    OnClickInfo() {
        ViewManager.Inst().OpenView(FishAttrView, {
            attrList: FishData.Inst().GetEquipAttrListShow(),
        })
    }

    OnClickStart() {
        FishData.Inst().WaBaoStart();
    }

    OnClickToolItem(item: FishViewToolItem) {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let data = item.GetData();
        FishData.Inst().FishViewInfo.itemSeq = data.item_seq
        ViewManager.Inst().OpenView(FishToolUpView);
    }
}

class FishViewToolItem extends BaseItem {
    protected viewNode = {
        CellShow: <fgui.GList>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data)
        this.viewNode.CellShow.SetData(data);
        this.viewNode.RedPointShow.SetNum(FishData.Inst().GetWabaoToolUpRedPointByItemSeq(data.item_seq))
    }
}


class FishViewOrderButton extends BaseItemGB {
    protected viewNode = {
        OrderList: <fgui.GList>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        this.viewNode.OrderList.SetData(data);
        this.viewNode.RedPointShow.SetNum(FishData.Inst().GetWabaoTaskRedPoint())
    }
}

class FishViewOrderItem extends BaseItemGB {
    protected viewNode = {
        Finish: <fgui.GImage>null,
        NameShow: <fgui.GRichTextField>null,
        ProgressShow: <fgui.GTextField>null,
        icon: <fgui.GLoader>null,
    };

    public SetData(data: any) {
        let co = data.co
        let progress = data.progress
        let flag = data.flag
        this.viewNode.Finish.visible = flag
        let color = QualityColorStr[co.color];
        let color_ol = QualityColorOLStr[co.color];

        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(GetCfgValue(Language.Fish.BoxTypeShows, co.param_0) ?? Item.GetName(co.param_0), color), color_ol, 2))
        // UH.SetText(this.viewNode.NameShow, TextHelper.ColorStr(GetCfgValue(Language.Fish.BoxTypeShows, co.param_0) ?? Item.GetName(co.param_0), GetCfgValue(Language.Fish.BoxTypeShows, co.param_0) ? COLORSTR.Black : COLORSTR.Red5))
        // UH.SetText(this.viewNode.ProgressShow, flag ? "" : TextHelper.Format(Language.Fish.FishMain.OrderProgressShow, progress, co.param_1))
        UH.SetText(this.viewNode.ProgressShow, flag ? "" : TextHelper.Format(Language.Fish.FishMain.OrderProgressShow, TextHelper.ColorStr(progress, progress < co.param_1 ? COLORSTR.Red7 : COLORSTR.Green3), co.param_1))
        UH.SetIcon(this.viewNode.icon, Item.GetIconId(Item.GetIconId(co.task_item[0].item_id)), ICON_TYPE.ITEM);
    }
}