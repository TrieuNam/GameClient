import { CfgPetData, CfgPetTreasure } from "config/CfgPet";
import { ViewManager } from "manager/ViewManager";
import { BoxDrawData } from "modules/BoxDraw/BoxDrawData";
import { BaseView, ViewLayer, ViewMask, boardCfg, viewRegcfg } from "modules/common/BaseView";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonButton } from "modules/extends/CommonButton";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RoleData } from "modules/role/RoleData";
import { PetAdvencePanel } from "./PetAdvencePanel";
import { PET_OP_TYPE, PetCtrl } from "./PetCtrl";
import { PetData } from "./PetData";
import { PetLevelUpPanel } from "./PetLevelUpPanel";
import { PetPanel } from "./PetPanel";
import { PetSkillPanel } from "./PetSkillPanel";

@BaseView.registView
export class PetView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Pet",
        ViewName: "PetView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        BtnBox: <CommonButton>null,
    }

    protected extendsCfg = [
        { ResName: "BtnPetBox", ExtendsClass: CommonButton },
    ];

    InitData() {
        this.viewNode.BtnBox.onClick(() => {
            // ViewManager.Inst().OpenView(PetBoxView)
            ViewManager.Inst().OpenViewByKey(Mod.Pet.PetBox, {
                ad_type: AdType.pet_draw, price: [CfgPetData.other[0].price1, CfgPetData.other[0].price2], draw_func: (index: number) => {
                    PetCtrl.Inst().SendPetReq(PET_OP_TYPE.TREASURE, index);
                }, rate_func: (index: number) => {
                    let data: CfgPetTreasure[] = []
                    let level = RoleData.Inst().GetRoleLevel()
                    CfgPetData.pet_treasure.forEach(element => {
                        if (level >= element.level_min && level <= element.level_max
                            && index == element.type && element.rate > 0) {
                            data.push(element)
                        }
                    });
                    data.sort((a: any, b: any) => { return a.sort - b.sort })
                    return data
                }
            })
        });
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetBoxRed.bind(this), "flush_ad_red");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.OnFunOpenChange.bind(this), "roleLevel")
        this.FlushPetBoxRed();
    }

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: PetPanel, viewName: "PetPanel", titleName: Language.Pet.PetInfo, modKey: Mod.Pet.PetInfo, helpTips: 12 },
            { panel: PetLevelUpPanel, viewName: "PetLevelUpPanel", titleName: Language.Pet.PetLevelUp, modKey: Mod.Pet.PetLevelUp, guide: "PetLevelUp", helpTips: 13 },
            { panel: PetAdvencePanel, viewName: "PetAdvencePanel", titleName: Language.Pet.PetAdvence, modKey: Mod.Pet.PetAdvence, guide: "PetAdvence", helpTips: 14 },
            { panel: PetSkillPanel, viewName: "PetSkillPanel", titleName: Language.Pet.PetSkill, modKey: Mod.Pet.PetSkill, guide: "PetSkill", helpTips: 15 },
        ]
    };
    CloseCallBack() {
        GuideCtrl.Inst().ForceStop()
    }

    private FlushPetBoxRed() {
        this.viewNode.BtnBox.ShowRedPoint(BoxDrawData.Inst().GetPetBoxRed() == 1);
    }

    InitUI() {
        this.OnFunOpenChange()
    }

    OnFunOpenChange() {
        this.viewNode.BtnBox.visible = FunOpen.Inst().GetFunIsOpen(Mod.Pet.PetBox).is_open;
    }

}

