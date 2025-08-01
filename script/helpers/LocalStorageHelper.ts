import { KeyFunction } from "modules/common/CommonType";
import { RoleData } from "modules/role/RoleData";

export let LocalStorageHelper: KeyFunction = {};
LocalStorageHelper.PrefsInt = function (key: string, value: number) {
    if (value)
        localStorage.setItem(key , value + "");
    else
        return +localStorage.getItem(key);
}

LocalStorageHelper.PrefsString = function (key: string, value: string) {
    if (value)
        localStorage.setItem(key, value);
    else
        return +localStorage.getItem(key);
}

LocalStorageHelper.ActivityIsRemind = function (act_type:number) {
    return RoleData.Inst(). GetRoleId()+ "_ActivityInfo_IsRemind_"+act_type;
}

LocalStorageHelper.EscortGhostIsRemind = function () {
    return RoleData.Inst().GetRoleId() + "_EscortGhost_IsRemind_";
}

LocalStorageHelper.AutoBoxOpenTip = function () {
    return RoleData.Inst().GetRoleId() + "_AutoBoxOpen_IsRemind_";
}

/**竞技场刷新时间 */
LocalStorageHelper.ArenaCd= function () {
    return RoleData.Inst().GetRoleId() + "_ArenaCd_IsRemind_";
}