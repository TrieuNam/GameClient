import { CfgAngelRes } from "config/CfgAngel";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGL } from "modules/common/BaseItem";
import { COLORS } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { ItemCell, ItemCellAngel } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { AngelCtrl, AngelReqType } from "./AngelCtrl";
import { AngelData, AngelRetType, AttChangeData } from "./AngelData";
import { HolAttireUpView } from "./HolAttireUpView";


export class AngelUpComp extends BaseItem {
    private angel_data: AngelData;
    private is_jinjie = false;
    private has_cost = false;
    private res_cfg: CfgAngelRes;

    protected viewNode: any = {
        TxtName: <fgui.GTextField>null,
        TxtLevel: <fgui.GTextField>null,
        ListAtt: <fgui.GList>null,
        TxtUpStep: <fgui.GTextField>null,
        ListPro: <fgui.GList>null,
        ItemCost: <ItemCell>null,
        TxtCost: <fgui.GTextField>null,
        BtnAttr: <fgui.GButton>null,
        BtnUp: <fgui.GButton>null,
        HolAttire0: <AngelHolAttireItem>null,
        HolAttire1: <AngelHolAttireItem>null,
        HolAttire2: <AngelHolAttireItem>null,
        HolAttire3: <AngelHolAttireItem>null,
        GpUp: <fgui.GGroup>null,
        ImgMax: <fgui.GImage>null,
        TxtTitle: <fgui.GTextField>null,
        Icon: <fgui.GImage>null,
        TxtCostName: <fgui.GTextField>null,
        EffectShow: <UIEffectShow>null,
        RedPoint: <RedPoint>null,
        BaoJiComp: <BaoJiComp>null,
        Block: <fgui.GGraph>null,
    }

    InitData() {
        this.angel_data = AngelData.Inst();
        this.viewNode.ListAtt.setVirtual();
        this.viewNode.BtnUp.onClick(this.sendUp.bind(this));
        this.viewNode.BtnAttr.onClick(this.OpenAttr.bind(this));
        this.viewNode.HolAttire0.onClick(this.openHolAttireUp.bind(this, 0));
        this.viewNode.HolAttire1.onClick(this.openHolAttireUp.bind(this, 1));
        this.viewNode.HolAttire2.onClick(this.openHolAttireUp.bind(this, 2));
        this.viewNode.HolAttire3.onClick(this.openHolAttireUp.bind(this, 3));

        GuideCtrl.Inst().AddGuideUi("BtnAngelUp", this.viewNode.BtnUp);

        this.SetAngelSHow();
    }

    private SetAngelSHow() {
        UH.SetText(this.viewNode.TxtName, this.angel_data.GetAngelName());
        let res_cfg = this.angel_data.GetAngelResCfg();
        if (res_cfg && res_cfg != this.res_cfg) {
            this.res_cfg = res_cfg;
            UH.SetIcon(this.viewNode.Icon, res_cfg.fazhen_show, ICON_TYPE.FaZhen);
        }
    }

    private baoji_level: number = 0;//暴击目标等级
    public FlushBaoJi() {
        this.baoji_level = this.angel_data.result_info.angel_info.angelLevel + AngelData.Inst().baoji;
        this.viewNode.BaoJiComp.SetBaoJiNum(AngelData.Inst().baoji, this.PlayBaoJiCall.bind(this));
    }

    private angel_level: number;
    private angel_order: number;
    public FlushAll() {
        let is_level_change = false;
        if (this.angel_data.result_info) {
            let angel_level = this.angel_data.result_info.angel_info.angelLevel;
            if (angel_level >= this.baoji_level && (!this.angel_level || this.angel_level != angel_level) ||
                this.angel_data.IsMaxLevel()) {
                this.viewNode.Block.visible = false;
            }
            let angel_order = this.angel_data.result_info.angel_info.angelGrade;
            if (!this.angel_level) {
                is_level_change = true;
                this.angel_level = angel_level;
            }
            if (!this.angel_order) {
                this.angel_order = angel_order;
            }
            if (this.angel_level != angel_level || this.angel_order != angel_order) {
                is_level_change = true;
                this.angel_level = angel_level;
                this.angel_order = angel_order;
                this.viewNode.EffectShow.PlayEff(4164059);
                AudioManager.Inst().Play(AudioTag.ShengJi);
            }
        }
        UH.SetText(this.viewNode.TxtLevel, "Lv." + this.angel_data.GetAngelLevel());
        this.viewNode.ListAtt.SetData(this.angel_data.GetNextLvAttList());
        UH.SetText(this.viewNode.TxtUpStep, Language.Common.level + this.angel_data.GetAngelLevel());
        let item_data = this.angel_data.GetAngelUpCostData();
        if (item_data) {
            this.viewNode.GpUp.visible = true;
            this.viewNode.ImgMax.visible = false;
            this.is_jinjie = this.angel_data.GetIsJinJie() != null;
            this.viewNode.BtnUp.title = this.is_jinjie ? Language.Common.up_grade : Language.Common.up_level;
            // UH.SetText(this.viewNode.BtnUp.getTextField(), this.is_jinjie ? Language.Common.up_grade : Language.Common.up_level);
            UH.SetText(this.viewNode.TxtTitle, this.is_jinjie ? Language.Angel.grade_add : Language.Angel.level_add)
            let num = Item.GetNum(item_data.itemId);
            this.has_cost = num >= item_data.num;
            let txt_color;
            let stroke_color;
            if (this.has_cost) {
                txt_color = COLORS.Green1;
                stroke_color = COLORS.Green2;
            }
            else {
                txt_color = COLORS.Red1;
                stroke_color = COLORS.Red2;
            }
            this.viewNode.RedPoint.SetNum(this.has_cost ? 1 : 0);
            this.viewNode.TxtCost.color = txt_color;
            this.viewNode.TxtCost.strokeColor = stroke_color;
            UH.SetText(this.viewNode.TxtCost, num + "/" + item_data.num);
            UH.SetText(this.viewNode.TxtCostName, Item.GetName(item_data.itemId), Item.QuaColor(item_data.itemId));
            this.viewNode.TxtCostName.strokeColor = Item.QuaColorOL(item_data.itemId)
            this.viewNode.ItemCost.SetData(Item.Create(item_data));
            if (is_level_change) {
                // LogError("进度", this.angel_level)
                this.viewNode.ListPro.SetData(this.angel_data.GetAngelUpPro(this.angel_level <= this.baoji_level));
            }
        } else {
            UH.SetText(this.viewNode.TxtTitle, Language.Angel.level_add)
            this.viewNode.GpUp.visible = false;
            this.viewNode.ImgMax.visible = true;
        }
        this.FlushEquip();
        this.SetAngelSHow();
    }

    private PlayBaoJiCall() {
        let data = new PB_SCAngelOpRet();
        data.retType = AngelRetType.LEVEL;
        data.param1 = this.angel_data.result_info.angel_info.angelLevel + 1;
        this.angel_data.setAngelOpRet(data);
    }

    private FlushEquip() {
        let equip_data = this.angel_data.result_info.angel_info.angelEquipId;
        for (let i = 0; i < equip_data.length; i++) {
            let id = equip_data[i];
            if (id) {
                let data: any = { item_data: this.angel_data.GetEquipCellData(i), red: this.angel_data.GetAngelEquipUpRed(i) };
                (<AngelHolAttireItem>this.viewNode["HolAttire" + i]).SetData(data);
            } else
                (<AngelHolAttireItem>this.viewNode["HolAttire" + i]).SetData(null);
        }
    }

    public sendUp() {
        if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Angel, this.angel_data.GetAngelNextLevel())) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips, Language.CoreCrisis.CoreName[CoreCrisisType.Angel]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.Angel })
            return
        }
        if (!this.has_cost) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this.angel_data.GetAngelUpCostData().itemId);
            return;
        }
        this.viewNode.Block.visible = true;
        if (this.is_jinjie) {
            AngelCtrl.Inst().SendAngelReq(AngelReqType.GRADE_UP);
        } else {
            AngelCtrl.Inst().SendAngelReq(AngelReqType.LEVEL_UP);
        }
    }

    private OpenAttr() {
        ViewManager.Inst().OpenView(RoleAttrView, { attrList: AngelData.Inst().GetAllAttr2() });
    }

    private openHolAttireUp(pos: number) {
        if (this.angel_data.IsEquip(pos)) {
            ViewManager.Inst().OpenView(HolAttireUpView, pos)
        } else {
            PublicPopupCtrl.Inst().Center(Language.Angel.tip)
        }
    }

    protected onDestroy(): void {
        GuideCtrl.Inst().ClearGuideUi("BtnAngelUp");
    }
}

export class AngelAttCell extends fgui.GComponent {
    private viewNode = {
        GpCur: <fgui.GGroup>null,
        GpNext: <fgui.GGroup>null,
        TxtName: <fgui.GTextField>null,
        TxtNum: <fgui.GTextField>null,
        TxtNextNum: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: AttChangeData) {
        UH.SetText(this.viewNode.TxtName, AttrListName[data.type]);
        UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.type, data.cur_num));
        if (data.next_num != 0) {
            UH.SetText(this.viewNode.TxtNextNum, AttrHelper.Percent(data.type, data.next_num));
            this.viewNode.GpNext.visible = true;
            this.viewNode.GpCur.x = 0;
        } else {
            this.viewNode.GpNext.visible = false;
            this.viewNode.GpCur.x = 120;
        }
    }
}

export class AngelProCell extends fgui.GComponent {
    private viewNode = {
        ProLoader: <fgui.GLoader>null,
        Effect: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: { val: number, is_effect: boolean }) {
        if (this.viewNode.ProLoader) {
            UH.SpriteName(this.viewNode.ProLoader, "Angel", data.val ? "JinDuLv" : "JinDuDi");
            this.viewNode.Effect.StopAllEff();
            if (data.is_effect) {
                this.viewNode.Effect.PlayEff(4164112);
            }
        }
    }
}

export class AngelHolAttireItem extends BaseItemGL {
    protected viewNode = {
        Cell: <ItemCellAngel>null,
        RedPoint: <RedPoint>null,
        GpNone: <fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: { item_data: any, red: number }) {
        if (data) {
            this.viewNode.GpNone.visible = false;
            this.viewNode.Cell.SetData(data.item_data, { is_click: false });
            this.viewNode.RedPoint.SetNum(data.red);
        } else {
            this.viewNode.GpNone.visible = true;
            this.viewNode.Cell.SetData(null, { is_click: false })
        }
    }
}

export class BaoJiComp extends BaseItem {
    private BaoJiNum: number = 0;
    private start: fgui.Transition;
    private Bao: fgui.Transition;

    private time_handle: any
    protected viewNode = {
        // GpStart: <fgui.GGroup>null,
        // GpBao: <fgui.GGroup>null,
        // Num: <fgui.GLoader>null,
        EffectStart: <UIEffectShow>null,
        EffectBao: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    bao_eff = [4164113, 4164115, 4164116, 4164117, 4164118]
    public SetBaoJiNum(num: number, call_back: Function) {
        this.visible = true;
        if (this.BaoJiNum == 0) {
            this.viewNode.EffectStart.StopAllEff()
            this.viewNode.EffectStart.visible = true;
            this.viewNode.EffectStart.PlayEff(4164114);
            AudioManager.Inst().Play(AudioTag.JiHuo);
            Timer.Inst().CancelTimer(this.time_handle);
            this.time_handle = Timer.Inst().AddRunTimer(() => {
                this.BaoJiNum += 1;
                this.SetBaoJiNum(num, call_back);
            }, 1.8, 1, false)
        } else {
            this.viewNode.EffectBao.StopAllEff();
            this.viewNode.EffectBao.visible = true;
            let eff_id = this.bao_eff[this.BaoJiNum - 1];
            if (eff_id)
                this.viewNode.EffectBao.PlayEff(eff_id);
            // LogError("爆特效",this.BaoJiNum)
            Timer.Inst().CancelTimer(this.time_handle);
            this.time_handle = Timer.Inst().AddRunTimer(() => {
                call_back(this.BaoJiNum);
                Timer.Inst().CancelTimer(this.time_handle);
                this.time_handle = Timer.Inst().AddRunTimer(() => {
                    if (this.BaoJiNum == num) {
                        this.BaoJiNum = 0;
                        this.visible = false;
                        this.viewNode.EffectStart.visible = false;
                        this.viewNode.EffectBao.visible = false;
                    } else {
                        this.BaoJiNum += 1;
                        this.SetBaoJiNum(num, call_back);
                    }
                }, 0.4, 1, false)
            }, 0.1, 1, false)
        }
    }
}
