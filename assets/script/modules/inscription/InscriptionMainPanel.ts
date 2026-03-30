import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { BoxDrawView } from "modules/BoxDraw/BoxDrawView";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { Item } from "modules/bag/ItemData";
import { BasePanel } from "modules/common/BasePanel";
import { AdType, ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CommonBoard5Tab } from "modules/common_board/CommonBoard5";
import { HelpView } from "modules/common_help/CommonHelpView";
import { RedPoint } from "modules/extends/RedPoint";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from '../../helpers/TextHelper';
import { UH } from "../../helpers/UIHelper";
import { InscriptionQuaBgName } from "./InscriptionConfig";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";
import { InscriptionSelectView } from "./InscriptionSelectView";
import { InscriptionTowerView } from "./InscriptionTowerView";
import { InscriptionView } from "./InscriptionView";

export class InscriptionMainPanel extends BasePanel {
    private level_mark = -1

    protected viewNode: { [key: string]: any } = {
        // Board: <CommonBoardCC>null,
        BtnAtlas: <fgui.GButton>null,
        BtnAttrShow: <fgui.GButton>null,
        BtnResolve: <fgui.GButton>null,
        BtnLevelUp: <fgui.GButton>null,
        BtnExChange: <fgui.GButton>null,

        StuffItem: <fgui.GLoader>null,
        StuffNum: <fgui.GLabel>null,
        StuffBg: <fgui.GImage>null,

        Equiped: <InscriptionEquip>null,
        Detail: <InscriptionDetail>null,
        RedPoint: <RedPoint>null,
        TurntableRedPoint: <RedPoint>null,
        ExchangeRedPoint: <RedPoint>null,
        ResolveRedPoint: <RedPoint>null,
        BtnTurntable: <fgui.GButton>null,

        // cc_bgshow: <CoreCrisisBgShow>null,
        // cc_nameshow: <CoreCrisisNameShow>null,
        // BtnTips: <fgui.GButton>null,
        // BtnClose: <fgui.GButton>null,
    }
    protected extendsCfg = [
        { ResName: "InscriptionAttrItem", ExtendsClass: InscriptionAttrItem },
        { ResName: "InscriptionDetail", ExtendsClass: InscriptionDetail },
        { ResName: "InscriptionEquip", ExtendsClass: InscriptionEquip },
        { ResName: "InscriptionEquipShow", ExtendsClass: InscriptionEquipShow },
        { ResName: "InscriptionSkillItem", ExtendsClass: InscriptionSkillItem },
        { ResName: "InscriptionNeoAttrItem", ExtendsClass: InscriptionNeoAttrItem },
        { ResName: "InscriptionNeoSkillItem", ExtendsClass: InscriptionNeoSkillItem },
    ]
    InitPanelData() {
        // this.viewNode.Board.SetData(new BoardData(InscriptionMainView, Language.Inscription.MainTitle, 20))
        // this.viewNode.Board.SetCoreMark(CoreCrisisType.Inscription)
        // this.viewNode.cc_bgshow.SetData({ core_mark: CoreCrisisType.Inscription })
        // this.viewNode.cc_nameshow.SetData({ core_mark: CoreCrisisType.Inscription })

        // this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        this.viewNode.BtnAtlas.onClick(this.OnClickAtlas.bind(this));
        this.viewNode.BtnAttrShow.onClick(this.OnClickAttrShow.bind(this));
        this.viewNode.BtnResolve.onClick(this.OnClickResolve.bind(this));
        this.viewNode.BtnLevelUp.onClick(this.OnClickLevelUp.bind(this));
        this.viewNode.BtnExChange.onClick(this.OnClickExChange.bind(this));
        this.viewNode.BtnTurntable.onClick(this.OnClickTurntable.bind(this));
        // this.viewNode.BtnTips.onClick(this.OnClickTips.bind(this));

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoEquiped.bind(this), "flushneed");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "flushneed");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "mainoper");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "turntable_num_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.ShowEquipEff.bind(this), "mainExEff");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.flushInfoDetail.bind(this), "need_flush");
        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.flushInfoDetail.bind(this));

        this.flushInfoEquiped()
        this.flushInfoDetail()
    }
    CloseCallBack() {

    }

    private ShowEquipEff() {
        // LogError("show!")
        if (InscriptionData.Inst().flush_info.mainExEff == 0) {
            // LogError("?return ???")
            return
        }

        this.viewNode.Equiped.ShowEffect()
    }

    private flushInfoEquiped() {
        this.viewNode.Equiped.flushPanelInfo()

    }

    private flushInfoDetail() {

        this.viewNode.Detail.flushPanelInfo()
        let param = InscriptionData.Inst().GetMainDetail()

        let cur_num = param.cur_num //Item.GetNum(param.stuff);
        this.viewNode.StuffItem.visible = (param.id > 0)
        this.viewNode.StuffNum.visible = (param.id > 0)
        this.viewNode.StuffBg.visible = (param.id > 0)

        if (param.stuff > 0) { UH.SetIcon(this.viewNode.StuffItem, Item.GetIconId(param.stuff), ICON_TYPE.ITEM) }
        UH.SetText(this.viewNode.StuffNum, DataHelper.ConverMoney(cur_num) + "/" + param.need)

        this.viewNode.BtnLevelUp.grayed = cur_num < param.need || param.is_empty || param.is_max
        this.viewNode.BtnLevelUp.title = param.is_max ? Language.Inscription.BtnUpMax : Language.Inscription.BtnUp
        this.viewNode.RedPoint.SetNum(InscriptionData.Inst().GetLevelRed(param.index, param.id, param.level))
        this.viewNode.ResolveRedPoint.SetNum(0)//InscriptionData.Inst().GetResolveRed())

        this.viewNode.BtnExChange.title = param.is_empty ? Language.Inscription.BtnEquip : Language.Inscription.BtnExchange
        this.viewNode.ExchangeRedPoint.SetNum(InscriptionData.Inst().GetExchangeRed())

        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let show_ad = (RoleData.Inst().GetRoleLevel() >= +co.level && (!info || ((co.ad_param > info.todayCount) && TimeCtrl.Inst().ServerTime > info.nextFetchTime)))
        this.viewNode.TurntableRedPoint.SetNum(show_ad ? 1 : 0);
        if (this.level_mark > -1 && param.level > this.level_mark) {
            this.viewNode.Detail.ShowEff()
            this.level_mark = -1
        }

        // this.viewNode.Board.FlushCore()
        // this.viewNode.cc_bgshow.FlushCore()
    }
    private CloseView() {
        ViewManager.Inst().CloseView(InscriptionView)
    }

    private OnClickTips() {
        ViewManager.Inst().OpenView(HelpView, 20);
    }

    private OnClickAtlas() {
        // ViewManager.Inst().OpenView(InscriptionAtlasView);
    }

    private OnClickAttrShow() {
        let attrs = InscriptionData.Inst().GetTotalInscriptionAttr()
        if (attrs.length == 0) {
            PublicPopupCtrl.Inst().Center(Language.Inscription.BtnEmptyAttr)
            return
        }

        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: attrs
        })
    }

    private OnClickResolve() {
        // ViewManager.Inst().OpenView(InscriptionResolveView);
    }

    private OnClickTurntable() {
        ViewManager.Inst().OpenView(BoxDrawView, {
            ad_type: AdType.inscription_tower_draw, price: [InscriptionData.Inst().CfgTowerPricePrice1(), InscriptionData.Inst().CfgTowerPricePrice2()], draw_func: (index: number) => {
                InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.RUNE_BOX, index);
            }, rate_func: (index: number) => {
                return InscriptionData.Inst().GetBoxDrawRateShow(index)
            }
        })
    }

    OnClickListItem(item: CommonBoard5Tab) {
        if (item._data.index == 3) {
            ViewManager.Inst().OpenView(BoxDrawView, {
                ad_type: AdType.inscription_tower_draw, price: [InscriptionData.Inst().CfgTowerPricePrice1(), InscriptionData.Inst().CfgTowerPricePrice2()], draw_func: (index: number) => {
                    InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.RUNE_BOX, index);
                }, rate_func: (index: number) => {
                    return InscriptionData.Inst().GetBoxDrawRateShow(index)
                }
            })
        }

    }


    private OnClickLevelUp() {
        let param = InscriptionData.Inst().GetMainDetail()
        let cur_num = param.cur_num

        if (param.is_empty) {
            PublicPopupCtrl.Inst().Center(Language.Inscription.NeedEquiped)
            return
        }

        let check_level = param.level + 1
        if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Inscription, check_level)) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips, Language.CoreCrisis.CoreName[CoreCrisisType.Inscription]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.Inscription })
            return
        }

        if (param.need > cur_num) {
            let show_call = Item.Create({ item_id: param.stuff, num: param.need - cur_num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            PublicPopupCtrl.Inst().Center(Language.Inscription.UpGradeLack)
            return
        }

        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.UPRUNE, InscriptionData.Inst().GetBagPosFromOper(), 0, [], [])

        for (let i = 0; i < param.attr_list.length; i++) {
            let att_type = param.attr_list[i].att_type;
            let att_add = param.attr_list[i].next_value - param.attr_list[i].att_value
            if (!param.attr_list[i].is_max) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${"+"}${AttrHelper.Percent(att_type, att_add)}`, 1)
            }
        }

        this.level_mark = param.level
    }

    private OnClickExChange() {
        let param = InscriptionData.Inst().GetMainEquipList()
        let pos = InscriptionData.Inst().GetOperPos()
        let data = param.list[pos]
        if (data) {
            if (!data.is_lock) {
                let str_show = TextHelper.Format(Language.Inscription.UnLockPopTips, data.lock_level)
                PublicPopupCtrl.Inst().Center(str_show)
                return
            }
        }
        ViewManager.Inst().OpenView(InscriptionSelectView);
    }
}

export class InscriptionDetail extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        // item_cell: <ItemCell>null,

        // level: <fgui.GLabel>null,
        // name: <fgui.GLabel>null,
        attr_empty: <fgui.GLabel>null,
        attr_1: <InscriptionNeoAttrItem>null,
        // attr_2: <InscriptionAttrItem>null,
        // skill_show: <InscriptionSkillItem>null,
        cur_show: <fgui.GLabel>null,
        nomal_show: <fgui.GGroup>null,
        empty_show: <fgui.GGroup>null,
        // nomal_bg: <fgui.GImage>null,
        // sp_bg: <fgui.GImage>null,
        EffShow: <UIEffectShow>null,
        skill_neo_show: <InscriptionNeoSkillItem>null,
        // item_level: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public flushPanelInfo() {
        let param = InscriptionData.Inst().GetMainDetail()
        this.viewNode.attr_empty.visible = param.is_empty
        // this.viewNode.item_cell.visible = !param.is_empty
        this.viewNode.attr_1.visible = !param.is_empty
        // this.viewNode.attr_2.visible = !param.is_empty
        // this.viewNode.level.visible = !param.is_empty
        // this.viewNode.name.visible = !param.is_empty

        this.viewNode.nomal_show.visible = !param.is_empty
        this.viewNode.empty_show.visible = param.is_empty

        if (!param.is_empty) {
            // let item_call = Item.Create({ item_id: param.id },
            //     { is_num: false })
            // this.viewNode.item_cell.SetData(item_call)

            // UH.SetText(this.viewNode.level, Language.GemAtelier.LvShow + param.level);
            // UH.SetText(this.viewNode.name, param.name)
            // UH.SetText(this.viewNode.item_level, Language.GemAtelier.LvShow + param.level);

            // this.viewNode.sp_bg.visible = param.is_ts
            // this.viewNode.nomal_bg.visible = !param.is_ts

            if (param.is_ts) {
                UH.SetText(this.viewNode.cur_show, Language.Inscription.DetailCurShow[1])
                this.viewNode.attr_1.visible = false
                // this.viewNode.attr_2.visible = false
                // this.viewNode.skill_show.visible = true
                // this.viewNode.skill_show.SetData(param.ts_skill)
                this.viewNode.skill_neo_show.visible = true
                this.viewNode.skill_neo_show.SetData(param.ts_skill)
            }
            else {
                UH.SetText(this.viewNode.cur_show, Language.Inscription.DetailCurShow[0])
                // this.viewNode.skill_show.visible = false
                this.viewNode.skill_neo_show.visible = false
                this.viewNode.attr_1.visible = param.attr_list[0] != null
                this.viewNode.attr_1.SetData(param.attr_list[0])
                // this.viewNode.attr_2.visible = param.attr_list[1] != null
                // this.viewNode.attr_2.SetData(param.attr_list[1])
            }


        }
    }

    public ShowEff() {
        this.viewNode.EffShow.PlayEff(4164074);
    }

    onDestroy() {

    }
}

export class InscriptionEquipShow extends fgui.GButton {
    private viewNode: { [key: string]: any } = {
        lock_bg: <fgui.GGroup>null,
        nomal_bg: <fgui.GGroup>null,
        RedPoint: <RedPoint>null,
        // ItemCell: <ItemCell>null,
        EffectShow: <UIEffectShow>null,
        item_level: <fgui.GLabel>null,
        sp: <fgui.GImage>null,
        nomal: <fgui.GImage>null,
        ItemIcon: <fgui.GLoader>null,
        ItemQua: <fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        this.viewNode.lock_bg.visible = !data.is_lock
        this.viewNode.nomal_bg.visible = data.is_lock
        // this.viewNode.ItemCell.visible = data.id > 0

        // let item_call = Item.Create({ item_id: data.id },
        //     { is_num: false, is_click: false })
        // this.viewNode.ItemCell.SetData(item_call)


        let num = InscriptionData.Inst().GetLevelRed(data.index, data.id, data.level) + InscriptionData.Inst().GetExColorRed(data.index) + InscriptionData.Inst().GetEmptyRed(data.index)
        this.viewNode.RedPoint.SetNum(num)

        UH.SetText(this.viewNode.item_level, data.id > 0 ? (Language.GemAtelier.LvShow + data.level) : "");

        this.viewNode.sp.visible = data.index >= 18
        this.viewNode.nomal.visible = data.index < 18
        this.viewNode.ItemQua.visible = this.viewNode.ItemIcon.visible = data.id > 0
        if (data.id > 0) {
            UH.SetIcon(this.viewNode.ItemIcon, Item.GetIconId(data.id), ICON_TYPE.ITEM);
            UH.SpriteName(this.viewNode.ItemQua, "InscriptionMain", InscriptionQuaBgName["qua_" + Item.GetColor(data.id)])
        }
    }

    public GetTips() {
        let str_show = TextHelper.Format(Language.Inscription.UnLockPopTips, this.data.lock_level)
        return str_show
    }

    public TryPressGoTo() {
        ViewManager.Inst().OpenView(InscriptionTowerView);
        ViewManager.Inst().CloseView(InscriptionView);
    }

    public ShowEffectItem() {
        // LogError("?ASf ")
        this.viewNode.EffectShow.PlayEff(this.data.index < 18 ? 4164076 : 4164075);

        InscriptionData.Inst().CancelMarkShowEff()
    }
}

export class InscriptionEquip extends fgui.GComponent {
    private Controller: fgui.Controller
    private CacheLock = -1
    private viewNode: { [key: string]: any } = {
        item_0: <InscriptionEquipShow>null,
        item_1: <InscriptionEquipShow>null,
        item_2: <InscriptionEquipShow>null,
        item_3: <InscriptionEquipShow>null,
        item_4: <InscriptionEquipShow>null,
        item_5: <InscriptionEquipShow>null,
        item_6: <InscriptionEquipShow>null,
        item_7: <InscriptionEquipShow>null,
        item_8: <InscriptionEquipShow>null,
        item_9: <InscriptionEquipShow>null,
        item_10: <InscriptionEquipShow>null,
        item_11: <InscriptionEquipShow>null,
        item_12: <InscriptionEquipShow>null,
        item_13: <InscriptionEquipShow>null,
        item_14: <InscriptionEquipShow>null,
        item_15: <InscriptionEquipShow>null,
        item_16: <InscriptionEquipShow>null,
        item_17: <InscriptionEquipShow>null,
        core_item_0: <InscriptionEquipShow>null,
        core_item_1: <InscriptionEquipShow>null,

        LockTips: <fgui.GGroup>null,
        GoTips: <fgui.GLabel>null,
        GoStr: <fgui.GLabel>null,
        GoBtn: <fgui.GGraph>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.GoBtn.onClick(this.OnClickGoBtn.bind(this))

        for (let i = 0; i < 18; i++) {
            this.viewNode["item_" + i].onClick(this.OnClickItem.bind(this, this.viewNode["item_" + i]))
            // this.viewNode.item_0.onClick(this.OnClickItem.bind(this))
        }

        for (let i = 0; i < 2; i++) {
            this.viewNode["core_item_" + i].onClick(this.OnClickCoreItem.bind(this, this.viewNode["core_item_" + i]))
        }

        // 启动时先归0
        InscriptionData.Inst().SetOperPos(0)
        this.Controller = this.getController("selected");
        this.Controller.selectedIndex = 0
        // this.Controller.onChanged(this.OnSelectChange.bind(this));
    }

    private flushPanelInfo() {
        let param = InscriptionData.Inst().GetMainEquipList()
        // 0~9
        for (var index in param.list) {
            let i_index = Number(index)
            if (i_index < 18) {
                this.viewNode["item_" + (index)].SetData(param.list[index])
            }
            else if (i_index < 20) {
                this.viewNode["core_item_" + (i_index - 18)].SetData(param.list[index])
            }
        }
    }

    public ShowEffect() {
        let oper_id = InscriptionData.Inst().GetOperPos()
        if (oper_id < 18) {
            this.viewNode["item_" + oper_id].ShowEffectItem()
        }
        else {
            let t_oper_id = oper_id - 18
            this.viewNode["core_item_" + t_oper_id].ShowEffectItem()
        }

    }

    private OnClickItem(item: InscriptionEquipShow) {
        //item.data
        // LogError("asfd  d ",item)
        let flag = item.data.is_lock
        // this.viewNode.LockTips.visible = !flag
        this.CacheLock = flag ? -1 : item.data.index
        // UH.SetText(this.viewNode.GoTips, item.GetTips())
        // if(flag) {
        InscriptionData.Inst().SetOperPos(item.data.index)

        if (!flag) {
            PublicPopupCtrl.Inst().Center(item.GetTips())
        }
        // }
        // else {
        //     this.Controller.selectedIndex = InscriptionData.Inst().GetOperPos()
        // }
    }

    private OnClickCoreItem(item: InscriptionEquipShow) {
        InscriptionData.Inst().SetOperPos(item.data.index)
        this.viewNode.LockTips.visible = false
    }

    private OnClickGoBtn() {
        if (this.CacheLock == -1) { return }

        if (this.CacheLock < 18) {
            this.viewNode["item_" + this.CacheLock].TryPressGoTo()
        }
        else {
            this.viewNode["core_item_" + (this.CacheLock - 18)].TryPressGoTo()
        }
    }
}

export class InscriptionSkillItem extends fgui.GComponent {
    private viewNode = {
        skill_desc: <fgui.GLabel>null,
        next_desc: <fgui.GLabel>null,
        max_desc: <fgui.GLabel>null,
        arrow: <fgui.GImage>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        this.viewNode.skill_desc.visible = !data.is_max
        this.viewNode.next_desc.visible = !data.is_max
        this.viewNode.max_desc.visible = data.is_max
        this.viewNode.arrow.visible = !data.is_max

        if (data.is_max == false) {
            UH.SetText(this.viewNode.skill_desc, Language.Inscription.SkillStart + data.cur_skill)
            UH.SetText(this.viewNode.next_desc, Language.Inscription.SkillStart + data.next_skill)
        }
        else {
            UH.SetText(this.viewNode.max_desc, Language.Inscription.SkillStart + data.cur_skill)
        }
    }
}

export class InscriptionAttrItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        level_up: <fgui.GGroup>null,
        max_level: <fgui.GGroup>null,

        attr_type: <fgui.GLabel>null,
        attr_value: <fgui.GLabel>null,
        next_value: <fgui.GLabel>null,

        max_attr_type: <fgui.GLabel>null,
        max_attr_value: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        this.viewNode.level_up.visible = !data.is_max
        this.viewNode.max_level.visible = data.is_max

        if (data.is_max == false) {
            UH.SetText(this.viewNode.attr_type, AttrListName[data.att_type]);
            UH.SetText(this.viewNode.attr_value, AttrHelper.Percent(data.att_type, data.att_value));
            UH.SetText(this.viewNode.next_value, AttrHelper.Percent(data.att_type, data.next_value));
        }
        else {
            UH.SetText(this.viewNode.max_attr_type, AttrListName[data.att_type]);
            UH.SetText(this.viewNode.max_attr_value, AttrHelper.Percent(data.att_type, data.att_value));
        }
    }
}

export class InscriptionNeoAttrItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        level_up: <fgui.GGroup>null,
        max_level: <fgui.GGroup>null,

        attr_type: <fgui.GLabel>null,
        attr_value: <fgui.GLabel>null,
        next_value: <fgui.GLabel>null,

        max_attr_type: <fgui.GLabel>null,
        max_attr_value: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        this.viewNode.level_up.visible = !data.is_max
        this.viewNode.max_level.visible = data.is_max

        if (data.is_max == false) {
            UH.SetText(this.viewNode.attr_type, AttrListName[data.att_type] + ":");
            UH.SetText(this.viewNode.attr_value, AttrHelper.Percent(data.att_type, data.att_value));
            UH.SetText(this.viewNode.next_value, AttrHelper.Percent(data.att_type, data.next_value));
        }
        else {
            UH.SetText(this.viewNode.max_attr_type, AttrListName[data.att_type] + ":");
            UH.SetText(this.viewNode.max_attr_value, AttrHelper.Percent(data.att_type, data.att_value));
        }
    }
}

export class InscriptionNeoSkillItem extends fgui.GComponent {
    private viewNode = {
        skill_desc: <fgui.GLabel>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        UH.SetText(this.viewNode.skill_desc, data.cur_skill)
    }
}