
import { CfgItem, GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB, BaseItemGP } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoardCC } from "modules/common_board/CommonBoardCC";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ShenQiInfoView } from "modules/item_info/ShenQiInfoView";
import { MainFlyIcon } from "modules/main/MainBottom";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ShenQiAttrView } from "./ShenQiAttrView";
import { ShenQiConfig } from "./ShenQiConfig";
import { ShenQiCtrl } from "./ShenQiCtrl";
import { ShenQiData } from "./ShenQiData";
import { ShenQiRecordView } from "./ShenQiRecordView";

@BaseView.registView
export class ShenQiView extends BaseView {
    guide_tag: string[] = []
    private drawIndex: number
    private currencyNum1: number
    private currencyNum2: number
    static IsDrawing: boolean = false
    private timer_handle_draw: any = null;
    private draw_co = {
        speed: 5,
        interval: 0.1,
    }

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShenQi",
        ViewName: "ShenQiView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoardCC>null,

        BtnRecord: <fgui.GButton>null,
        BtnDraw: <ShenQiDrawButton>null,
        BtnAttr: <ShenQiAttrButton>null,

        CurrencyIcon1: <fgui.GLoader>null,
        CurrencyIcon2: <fgui.GLoader>null,
        CurrencyNum1: <fgui.GLoader>null,
        CurrencyNum2: <fgui.GLoader>null,

        CostIcon: <fgui.GLoader>null,
        CostIcon2: <fgui.GLoader>null,
        Nums2: <fgui.GTextField>null,
        Nums3: <fgui.GTextField>null,
        Nums6: <fgui.GTextField>null,
        CostNum: <fgui.GTextField>null,
        ShowList: <fgui.GList>null,
        SelShow: <fgui.GImage>null,
        UIEffectShow: <UIEffectShow>null,

        ToggleDraw: <fgui.GButton>null,

        GpTime: <fgui.GGroup>null,
        TimeShow: <TimeMeter>null,
        RedPointDraw: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: ShenQiShowItem },
        { ResName: "ButtonDraw", ExtendsClass: ShenQiDrawButton },
        { ResName: "ButtonAttr", ExtendsClass: ShenQiAttrButton },
        { ResName: "ProgressQua", ExtendsClass: ShenQiProgressQua },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(ShenQiView, Language.ShenQi.MainName, 26))
        this.viewNode.Board.SetCoreMark(CoreCrisisType.ShenQi)

        this.viewNode.ShowList.on(fgui.Event.CLICK_ITEM, this.OnClickShowItem, this);
        this.viewNode.BtnRecord.onClick(this.OnClickRecord, this);
        this.viewNode.BtnDraw.onClick(this.OnClickDraw, this);
        this.viewNode.BtnAttr.onClick(this.OnClickAttr, this);

        UH.SetIcon(this.viewNode.CurrencyIcon1, Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiEnergyId()), ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.CurrencyIcon2, Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiChip()), ICON_TYPE.ITEM);

        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushInfo.bind(this), "FlushInfo");
        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushDrawInfo.bind(this), "DrawInfo");
        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushInfo.bind(this), "OtherInfo");
        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushOtherInfo.bind(this), "OtherInfo");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.FlushCrisis.bind(this), "need_flush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCurrency.bind(this), "OtherChange");
        // KnightCardCtrl.Inst().SendRandActivityOperaReqInfo();

        this.drawIndex = 0
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("ShenQiDrawBtn", this.viewNode.BtnDraw))
    }

    InitUI() {
        this.FlushShow();
        this.FlushInfo();
        this.FlushOtherInfo();
        this.FlushCurrency();
    }

    CloseCallBack() {
        this.viewNode.TimeShow.CloseCountDownTime()
        Timer.Inst().CancelTimer(this.timer_handle_draw)
        ShenQiView.IsDrawing = false

        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
    }

    public FlushCrisis() {
        this.viewNode.Board.FlushCore()
    }

    FlushShow() {
        UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiEnergyId()), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.Nums2, ShenQiData.Inst().CfgOtherShenQiEnergyByColor(2))
        UH.SetText(this.viewNode.Nums3, ShenQiData.Inst().CfgOtherShenQiEnergyByColor(3))
        UH.SetText(this.viewNode.Nums6, ShenQiData.Inst().CfgOtherShenQiEnergyByColor(6))
        UH.SetIcon(this.viewNode.CostIcon2, Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiEnergyId()), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.CostNum, ShenQiData.Inst().CfgOtherShenQiLotteryCost());
        this.viewNode.BtnAttr.FlushShow();
        this.viewNode.BtnDraw.FlushShow();
    }

    FlushInfo() {
        if (ShenQiView.IsDrawing) {
            return
        }
        let show_list = ShenQiData.Inst().GetShenQiShowList()
        this.viewNode.ShowList.SetData(show_list);

        this.viewNode.BtnAttr.FlushInfo();
    }

    FlushDrawInfo() {
        this.Draw(0)
    }

    FlushOtherInfo() {
        this.viewNode.BtnDraw.FlushInfo();
        this.FlushRedPointDraw()

        let info = ShenQiData.Inst().ResultData.OtherInfo
        this.viewNode.GpTime.visible = info.freeTimes < ShenQiData.Inst().CfgOtherShenQiFreeRaffle();
        this.viewNode.TimeShow.CloseCountDownTime()
        if (TimeCtrl.Inst().tomorrowStarTime > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(TimeCtrl.Inst().tomorrowStarTime, TimeFormatType.TYPE_TIME_0, TextHelper.Format(Language.ShenQi.ShenQiMain.TimeShow, ShenQiData.Inst().CfgOtherShenQiFreeRaffle() - info.freeTimes, "{0}"))
            this.viewNode.TimeShow.SetCallBack(this.FlushOtherInfo.bind(this))
        }
        else {
            this.viewNode.TimeShow.SetTime("")
        }

    }

    FlushCurrency() {
        if (ShenQiView.IsDrawing) {
            return
        }
        let num1 = BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiEnergyId());
        let text1 = DataHelper.ConverMoney(+num1);
        this.currencyNum1 = +num1
        let num2 = BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiChip());
        let text2 = DataHelper.ConverMoney(+num2);
        this.currencyNum2 = +num2
        this.viewNode.CurrencyNum1.text = text1;
        this.viewNode.CurrencyNum2.text = text2;
    }

    Draw(index: number) {
        if (ShenQiData.Inst().ResultData.DrawInfo.cellList[index]) {
            if (index > 0) {
                Timer.Inst().CancelTimer(this.timer_handle_draw)
                this.timer_handle_draw = Timer.Inst().AddCountDownTT(() => { }, () => {
                    this.Drawing(index, ShenQiData.Inst().ResultData.DrawInfo.cellList[index])
                }, 1, this.draw_co.interval, false)
            } else {
                this.Drawing(index, ShenQiData.Inst().ResultData.DrawInfo.cellList[index])
            }
        } else {
            Timer.Inst().CancelTimer(this.timer_handle_draw)
            this.timer_handle_draw = null
            ShenQiView.IsDrawing = false
            this.FlushInfo();
            this.FlushCurrency();

            if (this.viewNode.ToggleDraw.selected) {
                this.timer_handle_draw = Timer.Inst().AddCountDownTT(() => { }, () => {
                    this.OnClickDraw()
                }, 1, this.draw_co.interval, false)
            }
        }
    }

    Drawing(index: number, to_index: number) {
        this.viewNode.SelShow.visible = true
        this.viewNode.UIEffectShow.visible = true
        Timer.Inst().CancelTimer(this.timer_handle_draw)
        this.timer_handle_draw = Timer.Inst().AddRunTimer(() => {
            this.drawIndex++
            this.drawIndex = this.drawIndex > 24 ? 0 : this.drawIndex
            let row = Math.floor(this.drawIndex / 5)
            let col = Math.floor(this.drawIndex % 5)
            this.viewNode.SelShow.x = 144 + (126 + 4) * col
            this.viewNode.SelShow.y = 485 + (126 + 4) * row
            this.viewNode.UIEffectShow.x = 144 + (126 + 4) * col
            this.viewNode.UIEffectShow.y = 485 + (126 + 4) * row

            // this.viewNode.UIEffectShow.x = 144 + (126 + 4) * col
            // this.viewNode.UIEffectShow.y = 485 + (126 + 4) * row
            if (this.drawIndex == to_index) {
                this.viewNode.UIEffectShow.StopEff(4164129)
                this.viewNode.UIEffectShow.PlayEff(4164129)
                this.FlushDrawed(to_index);
                this.FlushCurrencyEff(to_index);
                this.Draw(index + 1)
            }
        }, this.draw_co.interval, -1, false)
    }

    FlushDrawed(index: number) {
        let show_list = ShenQiData.Inst().GetShenQiShowList()
        let co = ShenQiData.Inst().CfgShenQiInfoByCell(index)
        let show_item = <ShenQiShowItem>this.viewNode.ShowList.getChildAt(index)
        show_item.SetData(show_list[index])

        if (1 == co.type) {
            this.viewNode.BtnAttr.AddVal(co.color, 1)
        } else if (3 == co.type) {
            let text2 = DataHelper.ConverMoney(this.currencyNum2 + co.pram);
            this.viewNode.CurrencyNum2.text = text2
        }
        let text1 = DataHelper.ConverMoney(this.currencyNum1 + co.shenqi_energy);
        this.viewNode.CurrencyNum1.text = text1
    }

    private _arr_coin: MainFlyIcon[] = [];
    FlushCurrencyEff(index: number) {
        let co = ShenQiData.Inst().CfgShenQiInfoByCell(index)
        if (co) {
            let value = co.shenqi_energy
            let icon_id = Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiEnergyId())
            let d = Math.floor(value / 5)//
            d = d == 0 ? 1 : d
            for (let index = 1; index < 6; index++) {
                if (value > 0) {
                    let flyIcon = this._arr_coin[index];
                    if (!flyIcon) {
                        flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                        this.addChild(flyIcon)
                    }
                    if (value - d < 0) {
                        flyIcon.PlayTween(1, value, 200, 350, icon_id, true)
                    } else {
                        flyIcon.PlayTween(1, +d, 200, 350, icon_id, true)
                    }
                    value = value - d
                }
            }
            if (3 == co.type) {
                value = co.pram
                icon_id = Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiChip())
                d = Math.floor(value / 5)//
                d = d == 0 ? 1 : d
                for (let index = 1; index < 6; index++) {
                    if (value > 0) {
                        let flyIcon = this._arr_coin[index];
                        if (!flyIcon) {
                            flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                            this.addChild(flyIcon)
                        }
                        if (value - d < 0) {
                            flyIcon.PlayTween(1, value, 200, 350, icon_id, true)
                        } else {
                            flyIcon.PlayTween(1, +d, 200, 350, icon_id, true)
                        }
                        value = value - d
                    }
                }
            }
            AudioManager.Inst().Play(AudioTag.JinBi);
        }
    }

    FlushRedPointDraw() {
        this.viewNode.RedPointDraw.SetNum((ShenQiData.Inst().ResultData.OtherInfo.freeTimes > 0) || (BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiEnergyId()) >= ShenQiData.Inst().CfgOtherShenQiLotteryCost()) ? 1 : 0)
    }

    OnClickRecord() {
        ShenQiCtrl.Inst().SendShenQiReqRecordInfo();
        ViewManager.Inst().OpenView(ShenQiRecordView)
    }

    OnClickDraw() {
        if (ShenQiView.IsDrawing) {
            PublicPopupCtrl.Inst().Center(Language.ShenQi.ShenQiMain.DrawingTips)
            return
        }
        let info = ShenQiData.Inst().ResultData.OtherInfo
        if (0 == info.freeTimes && BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiEnergyId()) >= ShenQiData.Inst().CfgOtherShenQiLotteryCost()) {
            let text1 = DataHelper.ConverMoney(this.currencyNum1 - ShenQiData.Inst().CfgOtherShenQiLotteryCost());
            this.viewNode.CurrencyNum1.text = text1
        }
        ShenQiCtrl.Inst().SendShenQiReqDraw();
    }

    private OnClickShowItem(item: ShenQiShowItem) {
        let data = item.GetData();
        if (1 == data.type) {
            ViewManager.Inst().OpenView(ShenQiInfoView, { id: data.pram })
        } else {
            let icon2Itemid: { [key: number]: number } = {
                [40904]: 40904,
                [40905]: 40905,
                [40906]: 40906,
                [40801]: 40801,
            }
            let itemId = icon2Itemid[data.icon];
            if (!itemId) {
                console.error(`ShenQiView:OnClickShowItem ERROR,icon2ItemId Failed=${data.icon}`);
                itemId = data.icon;
            }
            if (Item.GetConfig(itemId))
                Item.OnItemInfo(Item.Create(new CfgItem(itemId)))
            //     let show_call = Item.Create({ item_id: itemId});
            //     ViewManager.Inst().OpenView(ItemInfoView, show_call);

        }
    }

    OnClickAttr() {
        ViewManager.Inst().OpenView(ShenQiAttrView)
    }

}

export class ShenQiDrawButton extends BaseItemGB {
    protected viewNode = {
        GpFree: <fgui.GGroup>null,
        GpCost: <fgui.GGroup>null,

        // CostIcon: <fgui.GLoader>null,
        // CostNum: <fgui.GTextField>null,
        FreeNum: <fgui.GTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public FlushShow() {
        // UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(ShenQiData.Inst().CfgOtherShenQiEnergyId()), ICON_TYPE.ITEM);
        // UH.SetText(this.viewNode.CostNum, ShenQiData.Inst().CfgOtherShenQiLotteryCost());
        this.FlushInfo();
    }

    public FlushInfo() {
        let info = ShenQiData.Inst().ResultData.OtherInfo
        this.viewNode.GpFree.visible = info.freeTimes > 0
        this.viewNode.GpCost.visible = 0 == info.freeTimes
        UH.SetText(this.viewNode.FreeNum, TextHelper.Format(Language.ShenQi.ShenQiMain.BtnDrawFree, info.freeTimes))
    }
}

export class ShenQiAttrButton extends BaseItemGB {
    protected viewNode = {
        ProgressQua2: <ShenQiProgressQua>null,
        ProgressQua3: <ShenQiProgressQua>null,
        ProgressQua6: <ShenQiProgressQua>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public FlushShow() {
        this.viewNode.ProgressQua2.FlushShow(2)
        this.viewNode.ProgressQua3.FlushShow(3)
        this.viewNode.ProgressQua6.FlushShow(6)
    }

    public FlushInfo() {
        this.viewNode.ProgressQua2.FlushInfo()
        this.viewNode.ProgressQua3.FlushInfo()
        this.viewNode.ProgressQua6.FlushInfo()
    }

    public AddVal(color: number, val: number) {
        if (2 == color) {
            this.viewNode.ProgressQua2.AddVal(val)
        } else if (3 == color) {
            this.viewNode.ProgressQua3.AddVal(val)
        } else if (6 == color) {
            this.viewNode.ProgressQua6.AddVal(val)
        }
    }
}

export class ShenQiShowItem extends BaseItem {
    protected viewNode = {
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        LevelShow: <fgui.GTextField>null,
        NumShow: <fgui.GTextField>null,
        GpInfo: <fgui.GGroup>null,
        WearingShow: <fgui.GTextField>null,
        RedPointShow: <RedPoint>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public SetData(data: any) {
        super.SetData(data);
        let info = ShenQiData.Inst().GetShenQiInfoById(data.pram)
        let co = ShenQiData.Inst().CfgShenQiInfoByIdLevel(data.pram, info.level + 1)
        let show_wearing = false
        this.viewNode.GpInfo.visible = 1 == data.type || 3 == data.type
        UH.SpriteName(this.viewNode.QuaIcon, "ShenQi", `PinZhiDi${data.color}`)
        UH.SetIcon(this.viewNode.Icon, data.icon, 1 === data.type ? ICON_TYPE.ShenQi : ICON_TYPE.ITEM);
        if (1 == data.type) {
            UH.SetText(this.viewNode.LevelShow, info.level > 0 ? `Lv.${info.level}` : "");
            UH.SetText(this.viewNode.NumShow, co ? `${info.num}/${co ? co.exp : 0}` : Language.ShenQi.ShenQiInfo.Max);
            show_wearing = ShenQiData.Inst().GetShenQiIsWearing(data.pram);
        } else if (3 == data.type) {
            UH.SetText(this.viewNode.LevelShow, data.pram);
            UH.SetText(this.viewNode.NumShow, "");

        }
        this.viewNode.WearingShow.visible = show_wearing

        let rp = 0
        let energy_num = info.level > 0 ? BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiChip()) : 0
        if (1 == data.type) {
            let info = ShenQiData.Inst().GetShenQiInfoById(data.pram)
            let co_next = ShenQiData.Inst().CfgShenQiInfoByIdLevel(data.pram, info.level + 1)
            if (co_next && (energy_num + info.num >= co_next.exp)) {
                rp = 1
            }
        }
        this.viewNode.RedPointShow.SetNum(rp)
    }
}

export class ShenQiProgressQua extends BaseItemGP {
    private showColor: number
    protected viewNode = {
        bg: <fgui.GLoader>null,
        bar: <fgui.GLoader>null,
        ValShow: <fgui.GTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public FlushShow(color: number) {
        this.showColor = color
        UH.SpriteName(this.viewNode.bg, "ShenQi", `JinDuDi${color}`)
        UH.SpriteName(this.viewNode.bar, "ShenQi", `PinZhiDi${color}`)
        this.viewNode.ValShow.strokeColor = GetCfgValue(ShenQiConfig.OutlineColor, color)
    }

    public FlushInfo() {
        let info = ShenQiData.Inst().GetShenQiProgressInfo(this.showColor)
        this.value = info.val
        this.max = info.max
        // UH.SetText(this.viewNode.ValShow, 0 == info.max ? "" : `${info.val}`);
        UH.SetText(this.viewNode.ValShow, `${info.val}`);
    }

    public AddVal(num: number) {
        // let info = ShenQiData.Inst().GetShenQiProgressInfo(this.showColor)
        // this.value = this.value + num
        // this.max = info.max
        // // UH.SetText(this.viewNode.ValShow, 0 == info.max ? "" : `${info.val}`);
        // UH.SetText(this.viewNode.ValShow, `${this.value + num}`);
    }
}