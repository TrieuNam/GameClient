import { CfgAngelData, CfgAngelRes } from "config/CfgAngel";
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { COLORS } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { Currency2 } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { AngelCtrl, AngelReqType } from "./AngelCtrl";
import { AngelData, AttChangeData } from "./AngelData";
import { Mod } from "modules/common/ModuleDefine";


export class HuanHuaComp extends BaseItem {
    private angel_data: AngelData;
    private select_index: number;
    private lack_item_id: number;
    private language = Language.Angel;
    private res_list: CfgAngelRes[];
    private select_seq: number;

    protected viewNode = {
        ListRes: <fgui.GList>null,
        TxtLevel: <fgui.GTextField>null,
        ListAtt: <fgui.GList>null,
        BtnHuanHua: <fgui.GButton>null,
        TxtName: <fgui.GTextField>null,
        ItemCost: <ItemCell>null,
        TxtCost: <fgui.GTextField>null,
        BtnUp: <CommonButtonBuy>null,
        ImgMax: <fgui.GImage>null,
        GpUp: <fgui.GGroup>null,
        Icon: <fgui.GLoader>null,
        BtnYiHuanHua: <fgui.GButton>null,
        EffectShow: <UIEffectShow>null,
        // RedPoint: <RedPoint>null,
        CurrencyShow: <Currency2>null,
        BtnClothShop: <fgui.GButton>null,
    }

    InitData() {
        this.angel_data = AngelData.Inst();
        this.viewNode.ListAtt.setVirtual();
        this.viewNode.ListRes.setVirtual();
        this.viewNode.BtnHuanHua.onClick(this.onHuanHua.bind(this));
        this.viewNode.BtnYiHuanHua.onClick(this.onCancelHuanHua.bind(this));
        this.viewNode.BtnUp.onClick(this.onUp.bind(this));
        this.viewNode.BtnClothShop.onClick(this.OnClickClothShop.bind(this));

        this.viewNode.ListRes.on(fgui.Event.CLICK_ITEM, this.onClickRes, this);
        this.res_list = AngelData.Inst().GetResList();
        this.select_seq = this.angel_data.result_info.angel_info.useAppearance;
        this.select_index = 0;
        for (let i = 0; i < this.res_list.length; i++) {
            if (this.res_list[i].angle_skin_seq == this.select_seq) {
                this.select_index = i;
                break;
            }
        }
        this.viewNode.ListRes.SetData(AngelData.Inst().GetResList());
        this.viewNode.ListRes.selectedIndex = this.select_index;
        this.select_seq = this.res_list[this.select_index].angle_skin_seq;
        this.FlushAngelInfo();
    }

    OnClickClothShop() {
        ViewManager.Inst().OpenViewByKey(Mod.ClothShopView.AngelShop)
    }

    private level: number;
    public FlushData() {
        let level = this.angel_data.GetResLevel(this.select_seq);
        if (this.angel_data.result_info) {
            if (this.level == undefined) {
                this.level = level;
            }
            if (this.level != level) {
                let tag = this.level == 0 ? AudioTag.JiHuo : AudioTag.ShengJi;
                AudioManager.Inst().Play(tag);
                this.level = level;
                this.viewNode.EffectShow.PlayEff(4164014);
            }
        }
        this.viewNode.ListRes.SetData(AngelData.Inst().GetResList());
        this.viewNode.ListAtt.SetData(this.angel_data.GetNextAppearanceAtt(this.select_seq));
        UH.SetText(this.viewNode.TxtLevel, level == 0 ? Language.Common.unActive : (TextHelper.NumToWrord(level) + this.language.jie));
        if (this.angel_data.IsResMax(this.select_seq)) {
            this.viewNode.ImgMax.visible = true;
            this.viewNode.GpUp.visible = false;
        } else {
            let item_data = this.angel_data.GetResUpCost(this.select_seq);
            this.viewNode.ImgMax.visible = false;
            this.viewNode.GpUp.visible = true;
            let num = Item.GetNum(item_data.itemId);
            let txt_color;
            let stroke_color;
            if (num >= item_data.num) {
                txt_color = COLORS.Green1;
                stroke_color = COLORS.Green2;
                this.lack_item_id = 0;
            }
            else {
                txt_color = COLORS.Red1;
                stroke_color = COLORS.Red2;
                this.lack_item_id = item_data.itemId;
            }
            this.viewNode.TxtCost.color = txt_color;
            this.viewNode.TxtCost.strokeColor = stroke_color;
            let show_currency = 0 == level && num < item_data.num
            let jihuo = CfgAngelData.angel_res[this.select_seq].jihuo[0];
            UH.SetText(this.viewNode.TxtCost, num + "/" + item_data.num);
            UH.SetText(this.viewNode.BtnUp.getTextField(), level == 0 ? Language.Common.active : Language.Common.up_level);
            this.viewNode.ItemCost.SetData(Item.Create(item_data));
            this.viewNode.BtnUp.ShowRedPoint(AngelData.Inst().GetAngelResUpRed(this.select_seq) == 1);

            this.viewNode.CurrencyShow.SetCurrencyId(jihuo.item_id, jihuo.num)
            this.viewNode.ItemCost.visible = !show_currency
            this.viewNode.TxtCost.visible = !show_currency
            this.viewNode.CurrencyShow.visible = show_currency
            this.viewNode.BtnUp.x = show_currency ? 270 : 435
        }

        this.viewNode.BtnYiHuanHua.visible = AngelData.Inst().result_info.angel_info.useAppearance == this.select_seq;
        this.viewNode.BtnHuanHua.visible = !this.viewNode.BtnYiHuanHua.visible;
    }

    private FlushAngelInfo() {
        let cfg = CfgAngelData.angel_res[this.select_seq];
        UH.SetText(this.viewNode.TxtName, cfg.name);
        if (cfg.angle_res_id) {
            UH.SetIcon(this.viewNode.Icon, cfg.fazhen_show, ICON_TYPE.FaZhen);
        }
    }

    private onClickRes(item: AngelResCell, event: fgui.Event) {
        let index = this.viewNode.ListRes.selectedIndex;
        if (index != this.select_index) {
            this.select_index = this.viewNode.ListRes.selectedIndex;
            this.select_seq = this.res_list[this.select_index].angle_skin_seq;
            this.level = undefined;
            this.FlushData();
            this.FlushAngelInfo();
        }
    }

    private onHuanHua() {
        this.angel_data.sendHuanHua(this.select_seq);
    }

    private onCancelHuanHua() {
        PublicPopupCtrl.Inst().Center(this.language.HuanHuaTip);
        this.angel_data.sendHuanHua(0);
    }

    private onUp() {
        let level = this.angel_data.GetResLevel(this.select_seq);
        let item_data = this.angel_data.GetResUpCost(this.select_seq);
        if (0 == level && Item.GetNum(item_data.itemId) < item_data.num) {
            let co = CfgAngelData.angel_res[this.select_seq];
            let jihuo = co.jihuo[0]
            PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Fashion.ActiveTips, jihuo.num, Item.GetName(jihuo.item_id), co.name), DialogTipsTypes.fashion_active, () => {
                AngelCtrl.Inst().SendAngelReq(AngelReqType.APPEARANCE_LEVEL_UP, this.select_seq, 1);
            }, false, Language.Common.active)
            return
        }
        if (!this.lack_item_id) {
            AngelCtrl.Inst().SendAngelReq(AngelReqType.APPEARANCE_LEVEL_UP, this.select_seq, 0);
        } else {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this.lack_item_id)
        }
    }
}

export class HuanHuaAttCell extends fgui.GComponent {
    private viewNode = {
        GpCur: <fgui.GGroup>null,
        GpNext: <fgui.GGroup>null,
        TxtName: <fgui.GTextField>null,
        TxtNum: <fgui.GTextField>null,
        TxtNextNum: <fgui.GTextField>null,
        TxtNextName: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: AttChangeData) {
        UH.SetText(this.viewNode.TxtName, AttrListName[data.type]);
        UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.type, data.cur_num));
        if (data.next_num != 0) {
            UH.SetText(this.viewNode.TxtNextNum, AttrHelper.Percent(data.type, data.next_num));
            UH.SetText(this.viewNode.TxtNextName, AttrListName[data.type]);
            this.viewNode.GpNext.visible = true;
            this.viewNode.GpCur.x = 0;
        } else {
            this.viewNode.GpNext.visible = false;
            this.viewNode.GpCur.center();
        }
    }
}

export class AngelResCell extends BaseItemGB {
    protected viewNode = {
        Cell: <ItemCell>null,
        ImgLock: <fgui.GImage>null,
        TxtName: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: CfgAngelRes) {
        let is_lock = AngelData.Inst().GetResLevel(data.angle_skin_seq) == 0;
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(data.jihuo_item_id), { is_click: false, is_gray: is_lock, eff: is_lock ? -1 : 0 }));
        this.viewNode.ImgLock.visible = is_lock;
        this.viewNode.TxtName.grayed = is_lock;
        UH.SetText(this.viewNode.TxtName, Item.GetName(data.jihuo_item_id), Item.QuaColor(data.jihuo_item_id));
        this.viewNode.TxtName.strokeColor = Item.QuaColorOL(data.jihuo_item_id);
        this.viewNode.RedPoint.SetNum(AngelData.Inst().GetAngelResUpRed(data.angle_skin_seq));
    }
}