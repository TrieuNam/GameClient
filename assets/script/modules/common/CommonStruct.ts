import { CreateSMD, smartdata } from "data/SmartData";
import { msgEvent, msgType, } from "./CommonEnum";

export class TYPE_APPEARANCE {
    /**武器 */
    @smartdata
    surfaceWeapon: number;
    /**盾牌 */
    @smartdata
    surfaceShield: number;
    /**头盔 */
    @smartdata
    surfaceHead: number;
    /**坐骑 */
    @smartdata
    surfaceMount: number;
    /**盔甲 */
    @smartdata
    surfaceBody: number;
    /**法阵 */
    @smartdata
    surfaceAngel: number;
};
export class CommonStruct {

    //统一角色基本信息
    static RoleInfoParam = function (t: any) {
        return {
            roleId: t.roleId ?? 0,
            name: t.name ?? "",
            level: t.level ?? 0,
            cap: t.cap ?? 0,
            headPicId: t.headPicId ?? 0,
            titleId: t.titleId ?? 0,
            guildName: t.guildName ?? "",
            headChar: t.headChar ?? "",
        }
    }

    //统一外观
    static AppearanceParam = function (t?: any, out?: TYPE_APPEARANCE): TYPE_APPEARANCE {
        if (!out) {
            out = CreateSMD(TYPE_APPEARANCE)
        }
        if (t) {
            out.surfaceWeapon = t.surfaceWeapon ?? 0;   //武器
            out.surfaceShield = t.surfaceShield ?? 0;   //盾牌
            out.surfaceHead = t.surfaceHead ?? 0;      //头盔
            out.surfaceMount = t.surfaceMount ?? 0;     //坐骑
            out.surfaceBody = t.surfaceBody ?? 0;       //盔甲
            out.surfaceAngel = t.surfaceAngel ?? -1;       //法阵
        }
        return out;
    }
}