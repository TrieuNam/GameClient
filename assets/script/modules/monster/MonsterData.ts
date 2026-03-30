import { GetCfgValue } from "config/CfgCommon";
import { CfgMonsterData, _CfgMonsterData } from "config/CfgMonster";
import { CfgMonsterGroupData } from "config/CfgMonsterGroup";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { BATTLE_ATTR_CFG } from "modules/common/CommonEnum";
import { DataHelper } from "../../helpers/DataHelper";


export class MonsterData extends DataBase{
    public CfgMonsterGroup(monster_group_id: number) {
        return CfgMonsterGroupData[monster_group_id]
    }

    public CfgMonster(monster_id: number) :_CfgMonsterData {
        return CfgMonsterData[monster_id]
    }

    public CfgMonsterByMonsterGroupId(monster_group_id: number) {
        let cfg = this.CfgMonsterGroup(monster_group_id);
        if (cfg) {
            return this.CfgMonster(cfg.monster_id_0)
        }
    }

    public CfgMonsterAttrsByMonsterGroupId(monster_group_id: number) {
        let attrs :any[] = []
        let cfg = this.CfgMonsterByMonsterGroupId(monster_group_id);
        for (const k in BATTLE_ATTR_CFG) {
            let attrType = BATTLE_ATTR_CFG[k]
            let attrValue = GetCfgValue(cfg, k);
            attrs.push({attrType:attrType, attrValue:attrValue})
        }
        return attrs
    }

    public CfgMonsterNameByMonsterGroupId(monster_group_id: number) {
        let cfg = this.CfgMonsterByMonsterGroupId(monster_group_id);
        return cfg ? cfg.name : "";
    }

    public CfgMonsterResIdByMonsterGroupId(monster_group_id: number) {
        let cfg = this.CfgMonsterByMonsterGroupId(monster_group_id);
        return cfg ? cfg.res_id : 0;
    }
}