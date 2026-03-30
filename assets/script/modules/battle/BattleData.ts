import { Vec2, TextAsset } from "cc";
import { CfgItem } from "config/CfgCommon";
import { CfgDundriesData } from "config/CfgDundries";
import { CfgPassiveSkill, CfgPassiveSkillData, CfgSpecialEffects } from "config/CfgPassiveSkill";
import { Debugger, LogError } from "core/Debugger";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ResManager } from "manager/ResManager";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { AngelData } from "modules/Angel/AngelData";
import { BATTLE_STATE_DATA } from "modules/common/CommonEnum";
import { FashionData } from "modules/fashion/FashionData";
import { FunOpen } from "modules/guide/FunOpen";
import { MonsterData } from "modules/monster/MonsterData";
import { MountData } from "modules/mount/MountData";
import { PetData } from "modules/Pet/PetData";
import { PetClothData } from "modules/PetCloth/PetClothData";
import { BattleScene } from "modules/scene/BattleScene";
import { SpineObjDirX, SPINE_ANI_STATE } from "modules/scene_obj_spine/ObjSpineConfig";
import { role_prefab, SceneObjSpine, SceneObjFightSpine } from "modules/scene_obj_spine/SceneObjSpine";
import { SceneObjVoFightSpine, SceneObjVoBaseSpine } from "modules/scene_obj_spine/SceneObjVoSpine";
import { HTTP } from "../../helpers/HttpHelper";
import { BattleBeh } from "./BattleBeh";
import { ENUM_BATTLE, BATTLE_STATE, ENUM_BATTLE_EVENT, ENUM_BATTLE_CHARACTER, ENUM_BATTLE_EVENT_ATTACK, TYPE_BATTLE_INFO, BATTLE_INFO } from "./BattleConf";
import { BattleCtrl } from "./BattleCtrl";

export class BattleNotice {
    @smartdata
    val_loadEnd: boolean;
}


export class BattleData extends DataBase {
    constructor() {
        super();
        this.battleNotice = CreateSMD(BattleNotice)
    }
    public battleNotice: BattleNotice;
    public cu_type: ENUM_BATTLE = undefined;
    /**
     *  2        5
     *     0  3
     *  1        4
     */
    private readonly _BattlePos: Vec2[] = [
        new Vec2(-170, -220),   //0
        new Vec2(-280, -390),   //1
        new Vec2(-280, -60),   //2

        new Vec2(170, -220),    //3
        new Vec2(280, -390),    //4
        new Vec2(280, -60),    //5
    ]
    private readonly pos_index: number[] = [
        4, 8, 0, 6, 10, 2,
    ]
    private _list_rep: { [key: number]: BattleReportData } = {}
    private state: BATTLE_STATE = BATTLE_STATE.END;

    public GetLoseList() {
        let list = [];
        for (let i = 0; i < CfgDundriesData.lose.length; i++) {
            let mod_key = CfgDundriesData.lose[i].mod_key;
            if (CfgDundriesData.lose[i].act_type) {
                if (!ActivityRandData.Inst().IsACtOpen(CfgDundriesData.lose[i].act_type) ||
                    !ActivityRandData.Inst().GetRegisterOpen(mod_key)) {
                    continue;
                }
            }
            if (!mod_key || FunOpen.Inst().GetFunIsOpen(mod_key).is_open) {
                list.push(CfgDundriesData.lose[i]);
            }
        }
        return list;
    }

    public get cu_battle_data() {
        return this._list_rep[this.cu_type];
    }

    public check(type: ENUM_BATTLE) {
        let t = this;
        if (t.state != BATTLE_STATE.END) {
            type && LogError(type + " is playing");
            return true
        }
        return false
    }

    public checkLoad(type: ENUM_BATTLE) {
        let t = this;
        if (t.state == BATTLE_STATE.LOAD) {
            type && LogError(type + " is Load");
            return true
        }
        return false
    }

    public load(proto_battle: PB_SCBattleReport, url: string, is_locla = false) {
        let t = this;
        let type = proto_battle.battleModeType;
        if (t.state != BATTLE_STATE.END) {
            LogError(type + " is playing");
            return
        }
        t.cu_type = type;
        let data_rep = t._list_rep[type];
        if (!data_rep) {
            data_rep = t._list_rep[type] = new BattleReportData(type, proto_battle, url);
        } else {
            if (data_rep.state != BATTLE_STATE.END) {
                LogError(type + " is playing");
                return;
            }
            data_rep.reInit(type, proto_battle, url);
        }
        data_rep.state = BATTLE_STATE.LOAD;
        t.state = BATTLE_STATE.LOAD;
        console.log("战报地址", url);
        if (is_locla) {
            ResManager.Inst().Load<TextAsset>(url, (error, data: TextAsset) => {
                if (data) {
                    t.Analysis(type, data.text);
                }
            })
        } else
            HTTP.GetString(url, (statusCode: number, resp: string, respText: string) => {
                if (statusCode !== 200 || !respText || respText == "") {
                    LogError(type + " req fail");
                    data_rep.state = BATTLE_STATE.END;
                    t.state = BATTLE_STATE.END;
                    BattleCtrl.Inst().onLoadError(type);
                    return;
                }
                data_rep.state = BATTLE_STATE.LOAD;
                t.Analysis(type, respText);
            })
    }

    public Analysis(type: number, rep: string) {
        let t = this;
        let data_rep = t._list_rep[type];
        let arr_rep = rep.split("\n");
        let num_round = 1;
        // 当前执行动作者
        let target_event: BattleAttackerEventData;
        let la_target_event: BattleAttackerEventData;
        let round_event: BattleEventRoundData
        let list_reward: { [key: number]: CfgItem } = {};
        let d_round: BattleEventRoundData;
        let event_attack_trice = 0;
        for (let index = 0; index < arr_rep.length; index++) {
            const s_rep = arr_rep[index]
            let d_event = BattleEventData.creat(BattleEventData, index, s_rep)
            if (target_event == undefined) {
                target_event = BattleEventData.creat(BattleAttackerEventData, index, s_rep)
            }

            let vo: SceneObjVoFightSpine;
            switch (d_event.type) {
                case ENUM_BATTLE_EVENT.ROUND_BEGIN:
                    round_event = BattleEventRoundData.creat(d_event.p1, BattleEventData.creat(BattleAttackerEventData, index, s_rep), BattleEventData.creat(BattleAttackerEventData, index, "8 0 0 0 0 0"));
                    data_rep.data_round[d_event.p1] = round_event
                    num_round = d_event.p1;
                    target_event = round_event.data_event_begin;
                    d_round = round_event;
                    data_rep.total_round += 1;
                    break;
                case ENUM_BATTLE_EVENT.CHARACTER_INFO:
                    vo = data_rep.data_obj_vo[d_event.p1];
                    if (!vo) {
                        data_rep.count_role += 1;
                        let id_prefab = role_prefab;
                        let type = ENUM_BATTLE_CHARACTER.ROLE;
                        if (d_event.p2 == ENUM_BATTLE_CHARACTER.MONSTER) {
                            id_prefab = MonsterData.Inst().CfgMonster(d_event.p3).res_id + "";
                            type = ENUM_BATTLE_CHARACTER.MONSTER
                        } if (d_event.p2 == ENUM_BATTLE_CHARACTER.PET) {
                            id_prefab = PetData.Inst().GetPetCfg(d_event.p3).pet_res + "";
                            type = ENUM_BATTLE_CHARACTER.PET
                        }
                        vo = SceneObjVoBaseSpine.CreateById(SceneObjVoFightSpine, d_event.p3, id_prefab, type, this._BattlePos[d_event.p1], d_event.p1 >= BATTLE_STATE_DATA.SIDEROLE && SpineObjDirX.RIGHT || BATTLE_STATE_DATA.SIDEROLE && SpineObjDirX.LEFT);
                        let result = BattleResultData.Create(d_event.p3)
                        data_rep.data_obj_vo[d_event.p1] = vo;
                        data_rep.data_result[d_event.p1] = result;
                    }
                    vo.drawer.anim.ani_time_scale = 2;
                    vo.index = d_event.p1;
                    vo.index_show = t.pos_index[d_event.p1];
                    break;
                case ENUM_BATTLE_EVENT.SKILL:
                    event_attack_trice += 1;
                    let skill_event = BattleEventData.creat(BattleAttackerEventData, index, s_rep, data_rep.data_obj_vo[d_event.p1]);
                    if (target_event && event_attack_trice >= 2) {
                        if (target_event.p1 != d_event.p1) {
                            //反击
                            skill_event.event_attack = ENUM_BATTLE_EVENT_ATTACK.FANJI;
                        } else {
                            //连击
                            skill_event.event_attack = ENUM_BATTLE_EVENT_ATTACK.LIANJI;
                        }
                    }
                    d_round.Add(skill_event);
                    target_event = skill_event;
                    break;
                case ENUM_BATTLE_EVENT.PASSIVE:
                    if (d_event.p3 == 1) {
                        target_event && (la_target_event = target_event)
                        let skill: CfgPassiveSkill;
                        CfgPassiveSkillData.passive_cfg.forEach(element => {
                            if (element.skill_id == d_event.p2) {
                                skill = element;
                            }
                        });

                        if (skill) {
                            let skille2 = BattleEventData.creat(BattleAttackerEventData, index, s_rep, data_rep.data_obj_vo[d_event.p1])
                            if ((skill.att_type == 2 || skill.att_type == 91 || skill.att_type == 58) && d_event.p3 == 1) {
                                //复活
                                skille2.type = ENUM_BATTLE_EVENT.EVENT_ALIVE;
                            }
                            let effect = CfgPassiveSkillData.special_effects[d_event.p2];
                            if (effect) {
                                skille2.skill_effect = effect
                            }
                            skille2.skill_passive = skill;
                            d_round.Add(skille2);
                            target_event = skille2;
                        }
                    } else {
                        if (target_event.dealyTime
                            && target_event.even_data[ENUM_BATTLE_EVENT.INJURED] && target_event.even_data[ENUM_BATTLE_EVENT.INJURED].length
                            && target_event.even_data[ENUM_BATTLE_EVENT.EVENT_ALIVE] && target_event.even_data[ENUM_BATTLE_EVENT.EVENT_ALIVE].length == 0) {
                            target_event.dealyTime = 0;
                        }
                        target_event = la_target_event;
                        la_target_event = undefined;
                    }
                    break;
                case ENUM_BATTLE_EVENT.INJURED:
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    d_event.event_attack = target_event.event_attack
                    let in_data = data_rep.data_result[d_event.p4];
                    in_data.CountDamage(d_event.p2);
                    if (!target_event.target && d_event.p2 <= 0) {
                        target_event.target = d_event;
                    }
                    break;
                case ENUM_BATTLE_EVENT.ADD_SHIELD:
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    break;
                case ENUM_BATTLE_EVENT.HP_CHANGE:
                    if (!target_event.target && target_event.type == ENUM_BATTLE_EVENT.PASSIVE) {
                        target_event.target = d_event;
                        target_event.dealyTime = 0.5;
                    }
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    break;
                case ENUM_BATTLE_EVENT.ROUND_END:
                    target_event = round_event.data_event_end
                    break;
                case ENUM_BATTLE_EVENT.FIGHT_OVER:
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    data_rep.data_end = target_event;
                    break;
                case ENUM_BATTLE_EVENT.REWARD:
                    if (list_reward[d_event.p1]) {
                        list_reward[d_event.p1].num += d_event.p2;
                    } else {
                        list_reward[d_event.p1] = new CfgItem(d_event.p1, d_event.p2);
                    }
                    break;
                case ENUM_BATTLE_EVENT.ADD_BUFF:
                    if (target_event.type == ENUM_BATTLE_EVENT.ADD_BUFF) {
                        d_round.Add(target_event);
                    }
                    if (!target_event.target && target_event.type == ENUM_BATTLE_EVENT.PASSIVE) {
                        target_event.target = d_event;
                    }
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    break;
                case ENUM_BATTLE_EVENT.IMMUNE_DAMAGE:
                    target_event.AddBattleEvent(d_event, data_rep.data_obj_vo[d_event.p1]);
                    if (!target_event.target && d_event.p2 <= 0) {
                        target_event.target = d_event;
                    }
                    break;
                case ENUM_BATTLE_EVENT.ROLE_APPEARANCE_1:
                    let vo_appea1 = data_rep.data_obj_vo[d_event.p1];
                    if (d_event.p2 > 0) {
                        vo_appea1.drawer.Appearance.surfaceWeapon = FashionData.Inst().GetCFGFashionClothesId(d_event.p2).res_id;
                    }
                    if (d_event.p3 > 0) {
                        vo_appea1.drawer.Appearance.surfaceShield = FashionData.Inst().GetCFGFashionClothesId(d_event.p3).res_id;
                    }
                    if (d_event.p5 > 0) {
                        vo_appea1.drawer.Appearance.surfaceHead = FashionData.Inst().GetCFGFashionClothesId(d_event.p5).res_id;
                    }
                    if (d_event.p4 > 0) {
                        vo_appea1.drawer.Appearance.surfaceBody = FashionData.Inst().GetCFGFashionClothesId(d_event.p4).res_id;
                    }
                    break;
                case ENUM_BATTLE_EVENT.ROLE_APPEARANCE_2:
                    let vo_appea2 = data_rep.data_obj_vo[d_event.p1];
                    if (d_event.p2 >= 0) {
                        vo_appea2.drawer.Appearance.surfaceMount = MountData.Inst().GetCfgMountApp(d_event.p2);
                    }
                    if (d_event.p3 >= 0) {
                        vo_appea2.drawer.Appearance.surfaceAngel = AngelData.Inst().GetCfgRes(d_event.p3).angle_res_id;
                    }
                    break;

                case ENUM_BATTLE_EVENT.EVENT_ATTACK:
                    if (d_event.p2 == 0) {
                        event_attack_trice = 0;
                        let skill_event = BattleEventData.creat(BattleAttackerEventData, index, s_rep, data_rep.data_obj_vo[d_event.p1]);
                        d_round.Add(skill_event);
                        // target_event = skill_event;
                        target_event = undefined;
                    }
                    break;
                case ENUM_BATTLE_EVENT.EVENT_PET_CLOTH:
                    vo = data_rep.data_obj_vo[d_event.p1]
                    if (vo) {
                        let close = PetClothData.Inst().GetPetSkillDataById(d_event.p2)
                        if (close) {
                            vo.drawer.id_arm = close.res_id + ""
                        }
                    }
                    break;
                case ENUM_BATTLE_EVENT.EVENT_PASSIVE_EFFECT:
                    skill_event = BattleEventData.creat(BattleAttackerEventData, index, s_rep, data_rep.data_obj_vo[d_event.p1]);
                    d_round.Add(skill_event);
                    // target_event = skill_event;
                    break;
            }
        }
        data_rep.setReward(list_reward);
        this.Load(type);
        LogError("Log info:", data_rep);
    }

    Load(type: number) {
        let t = this;
        let rep = t._list_rep[type]
        if (!rep) {
            return;
        }
        rep.count_role_load = 0;
        let list_role = rep.data_obj_vo;
        BattleCtrl.Inst().Load();
        for (const key in list_role) {
            const role = list_role[key];
            SceneObjSpine.Create(SceneObjFightSpine, role, undefined, () => {
                this.onLoad();
            })
        }
    }

    private onLoad() {
        let t = this;
        let rep = t._list_rep[this.cu_type];
        if (!rep) {
            return;
        }
        rep.count_role_load += 1;
        if (rep.count_role_load == rep.count_role) {
            BattleCtrl.Inst().OnLoad();
        }
    }

    Approach() {
        let t = this;
        let rep = t._list_rep[this.cu_type]
        if (!rep) {
            return;
        }
        let list_role = rep.data_obj_vo;
        rep.count_on_pos = 0;
        for (const key in list_role) {
            const role = list_role[key];
            role.node.setNode(BattleScene.Inst().SceneMain, role.index_show);
            role.node.Approach(() => {
                rep.count_on_pos += 1;
                if (rep.count_on_pos == rep.count_role) {
                    BattleCtrl.Inst().OnPos()
                }
            });
        }
    }

    onStart() {
        let t = this;
        let rep = t._list_rep[this.cu_type]
        if (!rep) {
            return;
        }
        rep.state = BATTLE_STATE.PLAY;
        t.state = BATTLE_STATE.PLAY;
        BattleBeh.Inst().onStart(rep)
        BattleCtrl.Inst().onStart()
    }

    onEnd() {
        this.state = BATTLE_STATE.END;
    }
}

/**
 * 战斗回合数据
 */
export class BattleEventRoundData implements IPoolObject {
    private _data_event_begin: BattleAttackerEventData;
    public get data_event_begin(): BattleAttackerEventData {
        return this._data_event_begin;
    }
    private _data_event: BattleAttackerEventData[] = [];
    public get data_event(): BattleAttackerEventData[] {
        return this._data_event;
    }
    private _data_event_end: BattleAttackerEventData;
    public get data_event_end(): BattleAttackerEventData {
        return this._data_event_end;
    }
    private _index: number;
    public get index(): number {
        return this._index;
    }

    reInit(index: number, att_begin: BattleAttackerEventData, att_end: BattleAttackerEventData): void {
        this._data_event_begin = att_begin
        this._data_event_end = att_end
        this._index = index;
    }

    onPoolReset(): void {
        ObjectPool.Push(this._data_event_begin);
        for (let index = 0; index < this._data_event.length; index++) {
            const element = this._data_event[index];
            ObjectPool.Push(element);
        }
        ObjectPool.Push(this._data_event_end);
        this._data_event_begin = undefined;
        this._data_event.length = 0;
        this._data_event_end = undefined;
    }

    public static creat(index: number, att_begin: BattleAttackerEventData, att_end: BattleAttackerEventData) {
        return ObjectPool.Get(BattleEventRoundData, index, att_begin, att_end);
    }

    constructor(index: number, att_begin: BattleAttackerEventData, att_end: BattleAttackerEventData) {
        this.reInit(index, att_begin, att_end)
    }

    Add(event: BattleAttackerEventData) {
        this._data_event.push(event);
    }
}

/**
 * 战斗执行动作数据
 */
export class BattleEventData implements IPoolObject {
    reInit(index: number, rep: string, vo?: SceneObjVoFightSpine): void {
        let t = this;
        t._param = rep.split(" ").map(Number);
        t.index = index;
        t.vo = vo;
    }

    onPoolReset(): void {
        let t = this;
        t._param = undefined;
        t.vo = undefined;
        t.isOn = undefined;
        t.event_attack = ENUM_BATTLE_EVENT_ATTACK.NORMAL;
        t.index = undefined;
        t.skill_effect = undefined;
        t.skill_passive = undefined;
    }
    private _param: number[];
    public index: number = undefined;
    public vo: SceneObjVoFightSpine;
    public skill_effect: CfgSpecialEffects;
    public skill_passive: CfgPassiveSkill;

    get type(): ENUM_BATTLE_EVENT { return this._param[0]; }
    set type(t) { this._param[0] = t }
    /**回合数 、位置 、结果、物品id、buff类型、 */
    get p1(): number { return this._param[1]; }
    /**类型 、技能id 、伤害、护盾值、血量、数量、buff参数、幻化武器、坐骑id、开始结束 */
    get p2(): number { return this._param[2]; }
    /**id 、被动开始结束、是否爆击、来源位置、最大血量、获得失去buff、幻化盾牌*/
    get p3(): number { return this._param[3]; }
    /**来源位置、护盾、幻化装甲*/
    get p4(): number { return this._param[4]; }
    /**位置、幻化头盔*/
    get p5(): number { return this._param[5]; }
    event_attack: ENUM_BATTLE_EVENT_ATTACK = ENUM_BATTLE_EVENT_ATTACK.NORMAL;
    /**是否完成事件 */
    isOn: boolean;
    public static creat<T extends BattleEventData>(obj: new (index: number, rep: string, vo?: SceneObjVoFightSpine) => T, index: number, rep: string, vo?: SceneObjVoFightSpine) {
        return ObjectPool.Get(obj, index, rep, vo);
    }
    public constructor(index: number, rep: string, vo?: SceneObjVoFightSpine) {
        this.reInit(index, rep, vo);
    }
}

/**
 * 战斗执行动作数据
 */
export class BattleAttackerEventData extends BattleEventData {
    onPoolReset(): void {
        super.onPoolReset();
        for (const key in this.even_data) {
            if (Object.prototype.hasOwnProperty.call(this.even_data, key)) {
                const aar_event = this.even_data[key];
                for (let index = 0; index < aar_event.length; index++) {
                    const element = aar_event[index];
                    ObjectPool.Push(element);
                }
                delete this.even_data[key];
            }
        }
        this._target = undefined;
        this.target_index = {};
        this.target_index_my = {};
        this.dealyTime = undefined;
    }
    public readonly even_data: { [key: number]: BattleEventData[] };

    private _target: BattleEventData;
    public get target(): BattleEventData {
        return this._target;
    }
    public set target(value: BattleEventData) {
        if (this.p1 != value.p1)
            this._target = value;
    }
    public target_index_my: { [key: string]: BattleEventData } = {}
    public target_index: { [key: string]: BattleEventData } = {}
    public dealyTime: number;
    public constructor(index: number, rep: string, vo?: SceneObjVoFightSpine) {
        super(index, rep, vo)
        this.even_data = {}
        this.vo = vo;
    }

    public AddBattleEvent(event: BattleEventData, target: SceneObjVoFightSpine): BattleEventData {
        let t = this;
        if (!t.even_data[event.type]) {
            t.even_data[event.type] = [];
        }
        event.vo = target
        t.even_data[event.type].push(event);
        if (t.p1 != event.p1) {
            if (t.p1 < 3 && event.p1 < 3 || (t.p1 >= 3 && event.p1 >= 3)) {
                t.target_index_my[event.p1] = event;
            } else {
                t.target_index[event.p1] = event;
            }
        }
        return event
    }
}

export class BattleResultData implements IPoolObject {
    reInit(id: number, damage: number = 0, hps: number = 0): void {
        this._id = id;
        this._damage = damage;
        this._hps = hps;
    }

    onPoolReset(): void {
        let t = this;
        t._id = undefined;
        t._damage = 0;
        t._hps = 0;
    }

    public static Create(id: number, damage: number = 0, hps: number = 0) {
        return ObjectPool.Get(BattleResultData, id, damage, hps);
    }

    private _id: number = undefined;
    /**伤害量 */
    private _damage = 0;
    /**伤害量 */
    public get damage() { return this._damage; }
    /**治疗量 */
    private _hps = 0;
    public get hps() { return this._hps; }
    public set hps(value) { this._hps = value; }

    constructor(id: number, damage: number = 0, hps: number = 0) {
        this.reInit(id, damage, hps);
    }

    CountDamage(num: number) {
        if (num < 0) {
            num = -num
            this._damage += num;
        } else {
            this._hps += num;
        }

    }
}


export class BattleReportData {
    onPoolReset(): void {
        this.Clean();
    }
    public state: BATTLE_STATE = BATTLE_STATE.END;
    private _type: number = undefined;
    public get type(): number {
        return this._type;
    }
    public count_role: number;
    public count_role_load: number;
    public count_on_pos: number;

    public index_round: number;
    public index_play: number;

    private _data_obj_vo: { [key: number]: SceneObjVoFightSpine; } = {};
    /**角色数据 */
    public get data_obj_vo(): { [key: number]: SceneObjVoFightSpine; } { return this._data_obj_vo; }

    private _data_round: BattleEventRoundData[] = [];
    /**回合数据 */
    public get data_round(): { [key: number]: BattleEventRoundData; } { return this._data_round; }

    private _data_reward: CfgItem[] = [];
    /**战斗奖励数据 */
    public get data_reward(): CfgItem[] { return this._data_reward; }

    private _data_result: { [key: number]: BattleResultData; } = {};
    /**战斗结果数据 伤害量血量*/
    public get data_result(): { [key: number]: BattleResultData; } { return this._data_result; }

    /**战斗结束数据 */
    public data_end: BattleAttackerEventData;

    /**总伤害 */
    public total_damage: number;

    /**总回合数 */
    public total_round: number;

    private _url: string;

    private _isEnd: boolean;
    public get isEnd(): boolean { return this._isEnd; }

    public get url(): string {
        return this._url;
    }
    private _proto_report: PB_SCBattleReport;
    public get proto_report(): PB_SCBattleReport {
        return this._proto_report;
    }

    /**获取战斗基础信息 */
    public get BattleInfo(): TYPE_BATTLE_INFO {
        return BATTLE_INFO[this._proto_report.battleModeType];
    }

    /**是否pvp战斗 */
    public get isPvP(): Boolean | undefined {
        return this.BattleInfo.isPvP;
    }

    constructor(type: number, proto_report: PB_SCBattleReport, url: string) {
        this.reInit(type, proto_report, url);
    }

    reInit(type: number, proto_report: PB_SCBattleReport, url: string): void {
        this._type = type;
        this._proto_report = proto_report;
        this._url = url;

        this.count_role = 0;
        this.count_role_load = 0;
        this.count_on_pos = 0;

        this.index_round = 0;
        this.index_play = -1;
        this._isEnd = false;

        this.total_damage = proto_report.totalDamage;
        this.total_round = 0;
    }

    public setReward(reward: { [key: number]: CfgItem }) {
        if (reward) {
            for (const key in reward) {
                const element = reward[key];
                this.data_reward.push(element);
            }
        }
        if (this.data_reward.length == 0) {
            let rewardList = this._proto_report.rewardList
            for (let index = 0, l = rewardList.length; index < l; index++) {
                const element = rewardList[index];
                this.data_reward.push(new CfgItem(element.itemId, +element.itemNum));
            }
        }
    }
    public nextCurRoundData(): BattleEventRoundData {
        this.index_round += 1;
        this.index_play = -1;
        return this.getCurRoundData();
    }

    public getCurRoundData(): BattleEventRoundData {
        return this._data_round[this.index_round];
    }

    public nextCurEventData(): BattleAttackerEventData {
        this.index_play += 1;
        return this.getCurEventData();
    }

    public getCurEventData(): BattleAttackerEventData {
        let round = this.getCurRoundData()
        return round && round.data_event[this.index_play];
    }

    public onSkip() {
        let t = this;
        t._isEnd = true;
        let role = t._data_obj_vo;
        for (const key in role) {
            const element = role[key];
            if (!element.drawer.isDeath) {
                element.drawer.anim.setComp(undefined, undefined);
                element.drawer.anim.loopState = SPINE_ANI_STATE.IDLE;
                element.node.reSetPos();
            }
        }
    }

    public Clean() {
        let t = this;
        for (let index = 1; index < t._data_round.length; index++) {
            const element = t._data_round[index];
            ObjectPool.Push(element);
        }
        t._data_round.length = 0

        t._data_reward.length = 0;

        for (const key in t._data_result) {
            const element = t._data_result[key];
            ObjectPool.Push(element);
            delete t._data_result[key];
        }

        let role = t._data_obj_vo;
        for (const key in role) {
            const element = role[key];
            element.node.Destory();
            delete role[key];
        }
        t._url = undefined;
        t._proto_report = undefined;

        t.count_role = 0;
        t.count_role_load = 0;
        t.count_on_pos = 0;

        t.index_round = 0;
        t.index_play = -1;

        t.state = BATTLE_STATE.END;
    }
}

