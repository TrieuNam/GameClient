import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/pet_cloth_auto";

export function _CreateCfgPetClothData(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetClothData = <_CfgPetClothData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgPetClothData);
        func(err == null);
    })
}
class CfgPetClothUp {
    id: number;
    petcloth_order: number;
    need_petcloth: number;
    petcloth_count: number;
    skill_level: number;
}
export class CfgPetSkillLevel {
    id: number;
    name: string;
    skill_name: string;
    skill_txt: string;
    skill_type: number;
    skill_id_type: number | string; //skill_type 为1 填的是技能id，2,3,4则是参数
    cloth_skill_level: number;
    skill_icon: number;
    skill_color: number;
}
export class CfgAllPetCloth {
    id: number;
    name: string;
    icon_id: number;
    res_id: number;
    color: number;
    jihuo: CfgItem[];
}
export class CfgPetClothEffect {
    id: number;
    name: string;
    skill_name: string;
    skill_type: number;
    /**宠物皮肤技能id */
    skill_id_type: number;
    /**1为实体特效，2为ui特效 */
    skill_effect_type: number;
    /**1-3是对自身 4是对敌人*/
    skill_effect_id1: number;
    skill_effect_id2: number;
    skill_effect_id3: number;
    skill_effect_id4: number;
    skill_effect_id5: number;

}
export class CfgBossClothEffet {
    id: number;
    name: string;
    skill_name: string;
    skill_type: number;
    /**宠物皮肤技能id */
    skill_id_type: number;
    /**1为实体特效，2为ui特效 */
    skill_effect_type: number;
    /**1-3是对自身 4是对敌人*/
    skill_effect_id1: number;
    skill_effect_id2: number;
    skill_effect_id3: number;
    skill_effect_id4: number;
    skill_effect_id5: number;
}
class _CfgPetClothData {
    /**宠物皮肤进阶 */
    pet_cloth_up: CfgPetClothUp[];
    /**宠物皮肤技能等级 */
    pet_skill_level: CfgPetSkillLevel[];
    /**宠物皮肤表 */
    all_pet_cloth: CfgAllPetCloth[];
    /**宠物皮肤技能表 */
    pet_cloth_effect: CfgPetClothEffect[];
    /**boss宠物技能表 */
    boss_cloth_effect: CfgBossClothEffet[];
}



export let CfgPetClothData: _CfgPetClothData = null;