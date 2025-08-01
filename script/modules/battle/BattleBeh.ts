import { Node } from "cc";
import { Singleton } from "core/Singleton";
import { smartdata, CreateSMD, SmartDatRouter, SMDTriggerNotify } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { FightAccountFailView } from "modules/common_account/FightAccountFailView";
import { FightAccountWinView } from "modules/common_account/FightAccountWinView";
import { SPINE_ANI_STATE, SPINE_OBJ_STATE } from "modules/scene_obj_spine/ObjSpineConfig";
import { SceneObjFightSpine } from "modules/scene_obj_spine/SceneObjSpine";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { ENUM_BATTLE_EVENT, ENUM_BATTLE_END, ENUM_BATTLE_BUFF, ENUM_BATTLE_EVENT_ATTACK } from "./BattleConf";
import { BattleAttackerEventData, BattleEventData, BattleReportData } from "./BattleData";


interface Battle_Beh {
    onStart(att_event: BattleAttackerEventData, ...param: any[]): void | boolean;
    onEnd(): void;
}

export class BattleBehData {
    @smartdata
    public round: number;
    @smartdata
    public val_hp: number;
    @smartdata
    public val_passive: number;
    @smartdata
    public val_skill_name: string = "";

    public hp_list: BattleEventData[] = [];
    public passive_list: string[][] = [[], [], [], [], [], []];
    @smartdata
    public val_load_end: boolean;
}

export class BattleBeh extends Singleton {
    public static list_battle_beh: { [key: number]: Battle_Beh } = {}

    static reg(key: ENUM_BATTLE_EVENT, func: Battle_Beh) {
        this.list_battle_beh[key] = func;
    }

    private _data: BattleBehData;
    public get data(): BattleBehData {
        return this._data;
    }

    constructor() {
        super();
        this._data = CreateSMD(BattleBehData);
    }

    initBeh() {
        BattleBeh.reg(ENUM_BATTLE_EVENT.ROUND_BEGIN, new Battle_Beh_BEGIN())
        BattleBeh.reg(ENUM_BATTLE_EVENT.SKILL, new Battle_Beh_Skill())
        BattleBeh.reg(ENUM_BATTLE_EVENT.PASSIVE, new Battle_Beh_Passive())
        BattleBeh.reg(ENUM_BATTLE_EVENT.INJURED, new Battle_Beh_Injured())
        BattleBeh.reg(ENUM_BATTLE_EVENT.HP_CHANGE, new Battle_Beh_HP_CHANGE())
        BattleBeh.reg(ENUM_BATTLE_EVENT.ROUND_END, new Battle_Beh_ROUND_END())
        BattleBeh.reg(ENUM_BATTLE_EVENT.FIGHT_OVER, new Battle_Beh_FIGHT_OVER())
        BattleBeh.reg(ENUM_BATTLE_EVENT.ADD_BUFF, new Battle_Beh_FIGHT_BUFF())
        BattleBeh.reg(ENUM_BATTLE_EVENT.EVENT_ALIVE, new Battle_Beh_FIGHT_EVENT_ALIVE())
        BattleBeh.reg(ENUM_BATTLE_EVENT.EVENT_ATTACK, new Battle_Beh_FIGHT_EVENT_ATTACK())
        BattleBeh.reg(ENUM_BATTLE_EVENT.EVENT_PASSIVE_EFFECT, new Battle_Beh_FIGHT_EVENT_EFFECT())
    }

    private _data_rep: BattleReportData
    onStart(data: BattleReportData) {
        if (BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.ROUND_BEGIN] == undefined) {
            this.initBeh();
        }
        this._data_rep = data;
        this.onEventRound();
    }
    onEventRound() {
        let data_rep = this._data_rep;
        if (!data_rep.isEnd) {
            let cu_round = data_rep.nextCurRoundData();
            // LogError(cu_round)
            if (cu_round) {
                //回合开始
                let beh = BattleBeh.list_battle_beh[cu_round.data_event_begin.type];
                beh && beh.onStart(cu_round.data_event_begin);
                this._data.round = cu_round.data_event_begin.p1;
            }
        }
    }
    onEventNext(time: number = 0): void {
        if (time > 0) {
            Timer.Inst().AddRunTimer(() => {
                this.onEventNext();
            }, time, 1, false);
            return
        }
        let data_rep = this._data_rep;
        if (!data_rep.isEnd) {
            this._data.hp_list.length = 0;
            for (let index = 0; index < this._data.passive_list.length; index++) {
                this._data.passive_list[index] && (this._data.passive_list[index].length = 0);
            }
            let cu_data = data_rep.nextCurEventData();
            if (cu_data) {
                //回合内处理
                let beh = BattleBeh.list_battle_beh[cu_data.type];
                // LogError(cu_data)
                beh && beh.onStart(cu_data);
            } else {
                //回合结束
                let cu_round = data_rep.getCurRoundData();
                if (cu_round) {
                    // LogError("end", cu_round.data_event_end,)
                    let beh = BattleBeh.list_battle_beh[cu_round.data_event_end.type];
                    beh && beh.onStart(cu_round.data_event_end, data_rep);
                }
            }
        }
    }

    onEnd(type?: number): void {
        this._data.round = 1;
        this._data.val_skill_name = "";
        this._passiveEffect = {};
    }

    onSkip(isOpen = true, isClean = false) {
        let rep = this._data_rep
        if (rep) {
            rep.onSkip();
            isClean && rep.Clean();
            isOpen && BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.FIGHT_OVER].onStart(rep.data_end, rep, true);
        }
    }

    private _passiveEffect: { [key: number]: { [key: number]: { [key: number]: string[] } } } = {}
    public addPassiveEffect(at_event: BattleEventData, event: BattleEventData, sObj: SceneObjFightSpine, effect_id: string, node?: Node, isLoad = false, res: string = undefined, target: Node = undefined) {
        sObj.playEffect(effect_id, node, isLoad, res, target);
        let at_passive = this._passiveEffect[at_event.p1];
        if (!at_passive) {
            at_passive = this._passiveEffect[at_event.p1] = {};
        }
        let passiveId = at_event.p2;
        let passive = at_passive[passiveId];
        if (!passive) {
            passive = at_passive[passiveId] = {}
        }
        if (!passive[event.p1]) {
            passive[event.p1] = [];
        }
        passive[event.p1].push(effect_id);
    }
    public stopPassiveEffect(at_event: BattleEventData) {
        let at_passive = this._passiveEffect[at_event.p1];
        if (at_passive) {
            let passive = at_passive[at_event.p2];
            if (passive) {
                delete at_passive[at_event.p2]
                for (const key in passive) {
                    const element = passive[key];
                    let vo = this._data_rep.data_obj_vo[+key];
                    if (vo) {
                        element.forEach(effect_id => {
                            vo.node.stopEffect(effect_id);
                        });
                    }
                }
            }
        }
    }
}

/** 回合开始 1
 * @param p1 回合数             */
class Battle_Beh_BEGIN implements Battle_Beh {
    onEnd(): void {
        Timer.Inst().AddRunTimer(BattleBeh.Inst().onEventNext.bind(BattleBeh.Inst()), 0.2, 1, false);
    }
    onStart(be_event: BattleAttackerEventData): void {
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(be_event);
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.ADD_BUFF].onStart(be_event);
        this.onEnd();
    }
}

/** 技能 3
 * @param p1 位置 @param p2 技能id */
class Battle_Beh_Skill implements Battle_Beh {
    onEnd(): void {
        this.att_event = null
        BattleBeh.Inst().onEventNext();
    }
    private att_event: BattleAttackerEventData
    onStart(att_event: BattleAttackerEventData): void {
        this.att_event = att_event;
        let attacterVo = att_event.vo;
        let attacterNode = attacterVo.node
        let target = att_event.target;
        if (target) {
            attacterNode.setIndex(target.vo.index_show + 1)
            if (att_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.FANJI || att_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.LIANJI) {
                if (att_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.FANJI) {
                    attacterNode.setIndex(att_event.vo.index_show + 1)
                }
                attacterNode.playEffect("4164016");
                AudioManager.Inst().Play(AudioTag.GongJi);
                attacterNode.playOnce(SPINE_ANI_STATE.ATTACK, (name: string) => {
                    this.onEnd();
                }, () => {
                    this.onAttack()
                });
            } else {
                attacterNode.moveToVo(target.vo, undefined, () => {
                    attacterNode.playEffect("4164016");
                    AudioManager.Inst().Play(AudioTag.GongJi);
                    // att_event.vo.drawer.anim.loopState = SPINE_ANI_STATE.ATTACK;
                    attacterNode.playOnce(SPINE_ANI_STATE.ATTACK, (name: string) => {
                        // Timer.Inst().AddRunTimer(() => {
                        // BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(att_event, true);
                        // attacterNode.setIndex(attacterVo.index_show)
                        // attacterNode.reSetPos(this.onEnd.bind(this));
                        // }, 0.1, 1, false);
                        this.onEnd();
                    }, () => {
                        this.onAttack()
                    });
                });
            }
        } else {
            this.onEnd();
        }
    }
    onAttack() {
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(this.att_event);
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.ADD_BUFF].onStart(this.att_event);
        SmartDatRouter.OnValueChange(BattleBeh.Inst().data, "val_hp");
    }
}


/** 被动 4
 * @param p1 位置 @param p2 技能id */
class Battle_Beh_Passive implements Battle_Beh {
    onEnd(time = 0.1): void {
        BattleBeh.Inst().onEventNext(time);
    }

    onStart(att_event: BattleAttackerEventData): void {
        if (att_event.skill_passive) {
            if (BattleBeh.Inst().data.val_skill_name == att_event.skill_passive.skill_name) {
                SMDTriggerNotify(BattleBeh.Inst().data, "val_skill_name")
            } else {
                BattleBeh.Inst().data.val_skill_name = att_event.skill_passive.skill_name;
            }
        }

        if (att_event.skill_effect) {
            let attacterVo = att_event.vo;
            let attacterNode = attacterVo.node

            let effect_id = att_event.skill_effect.skill_effect_id1 + "";
            let arr_effect_id = effect_id.split(",")
            arr_effect_id.forEach(element => {
                let effect_id = +element;
                if (effect_id) {
                    if (+element < 1000) {
                        BattleBeh.Inst().data.passive_list[att_event.p1].push(element);
                    } else {
                        BattleBeh.Inst().addPassiveEffect(att_event, att_event, attacterNode, element, attacterNode.center, true, ResPath.JiNengEffect(element));
                        // attacterNode.playEffect(element, attacterNode.center, true, ResPath.JiNengEffect(element));
                    }
                }
            });


            let effect_id_end = att_event.skill_effect.skill_effect_end
            if (effect_id_end && att_event.target) {
                effect_id_end = effect_id_end + "";
                // BattleBeh.Inst().addPassiveEffect(attacterNode, effect_id_end, attacterNode.center, true, ResPath.JiNengEffect(effect_id_end), att_event.target.vo.node.center);
                attacterNode.playEffect(effect_id_end, attacterNode.center, true, ResPath.JiNengEffect(effect_id_end), att_event.target.vo.node.center);
            }

            let skill_effect_id2 = att_event.skill_effect.skill_effect_id2 + "";
            let arr_skill_effect_id2 = skill_effect_id2.split(",")
            arr_skill_effect_id2.forEach(element => {
                let effect_id = +element;
                if (effect_id) {
                    for (const key in att_event.target_index_my) {
                        const target = att_event.target_index_my[key];
                        if (effect_id < 1000) {
                            BattleBeh.Inst().data.passive_list[target.p1].push(element);
                        } else {
                            BattleBeh.Inst().addPassiveEffect(att_event, target, target.vo.node, element, target.vo.node.center, true, ResPath.JiNengEffect(element));
                            // target.vo.node.playEffect(element, target.vo.node.center, true, ResPath.JiNengEffect(element));
                        }
                    }
                }
            });

            let skill_effect_id3 = att_event.skill_effect.skill_effect_id3 + "";
            let arr_skill_effect_id3 = skill_effect_id3.split(",")
            arr_skill_effect_id3.forEach(element => {
                let effect_id = +element;
                if (effect_id) {
                    for (const key in att_event.target_index) {
                        const target = att_event.target_index[key];
                        if (+element < 1000) {
                            BattleBeh.Inst().data.passive_list[target.p1].push(element);
                        } else {
                            BattleBeh.Inst().addPassiveEffect(att_event, target, target.vo.node, element, target.vo.node.center, true, ResPath.JiNengEffect(element));
                            // target.vo.node.playEffect(element, target.vo.node.center, true, ResPath.JiNengEffect(element));
                        }
                    }
                }
            });

        }
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(att_event);
        // BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.ADD_BUFF].onStart(att_event);
        SmartDatRouter.OnValueChange(BattleBeh.Inst().data, "val_passive");
        this.onEnd(att_event.dealyTime ? att_event.dealyTime : 0.1)
    }
}

/** 收到伤害 5
 * @param p1 位置 @param p2 伤害 @param p3 是否爆击 @param p4 来源 */
class Battle_Beh_Injured implements Battle_Beh {
    onEnd(): void {

    }
    onStart(be_event: BattleAttackerEventData): void {
        if (be_event.even_data) {
            let event_hps = be_event.even_data[ENUM_BATTLE_EVENT.INJURED];
            if (event_hps) {
                for (let index = 0; index < event_hps.length; index++) {
                    const event = event_hps[index];
                    if (!event.isOn) {
                        event.isOn = true;
                        let target = event.vo.node;
                        if (event.p2 < 0 && event.p1 != be_event.p1) {
                            be_event.vo && be_event.vo.node.playEffect("4164025", target.center);
                            target.playOnce(SPINE_ANI_STATE.HIT);
                            // if (be_event.skill_effect) {
                            //     let effect_id = be_event.skill_effect.skill_effect_id3 + "";
                            //     let arr_effect_id = effect_id.split(",")
                            //     arr_effect_id.forEach(element => {
                            //         let effect_id = +element;
                            //         if (effect_id) {
                            //             if (+element < 1000) {
                            //                 BattleBeh.Inst().data.passive_list[event.p1].push(element);
                            //             } else {
                            //                 target.playEffect(element, target.center, true, ResPath.JiNengEffect(element));
                            //             }
                            //         }
                            //     });
                            // }
                        } else if (event.p2 == 0) {
                            target.moveToSelf(-50, undefined, NaN, () => {
                                target.moveToSelf(0, undefined);
                            });
                        }
                        BattleBeh.Inst().data.hp_list.push(event)
                    }
                }
            }
            BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.HP_CHANGE].onStart(be_event);
        }
    }
}

/** 血量变化 7
 * @param p1 位置 @param p2 血量 @param p3 最大血量 @param p4 护盾 */
class Battle_Beh_HP_CHANGE implements Battle_Beh {
    onEnd(): void {
    }
    onStart(be_event: BattleAttackerEventData): void {
        let event_hps = be_event.even_data[ENUM_BATTLE_EVENT.HP_CHANGE];
        if (event_hps) {
            for (let index = 0; index < event_hps.length; index++) {
                const event = event_hps[index];
                if (!event.isOn) {
                    event.isOn = true;
                    let target = event.vo.node;
                    event.vo.hp = event.p2;
                    event.vo.hp_max = event.p3;
                    event.vo.shield = event.p4;
                    if (event.vo.hp == 0) {
                        event.vo.drawer.isDeath = true;
                        target.playOnce(SPINE_ANI_STATE.DIE);
                        target.stopAllEffect();
                        target.setIndex(event.vo.index_show)
                    }
                }
            }
        }
    }
}

/** 回合结束 8
 * */
class Battle_Beh_ROUND_END implements Battle_Beh {
    onEnd(): void {
        BattleBeh.Inst().onEventRound();
    }
    onStart(be_event: BattleAttackerEventData, rep: BattleReportData): void {
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(be_event);
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.ADD_BUFF].onStart(be_event);
        let is_end = BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.FIGHT_OVER].onStart(be_event, rep);
        if (!is_end) {
            this.onEnd();
        }
    }
}

/** 战斗结束 9
 * */
class Battle_Beh_FIGHT_OVER implements Battle_Beh {
    private be_event: BattleAttackerEventData;
    private rep: BattleReportData;
    onEnd(): void {
        let event_end = this.be_event.even_data[ENUM_BATTLE_EVENT.FIGHT_OVER][0]
        ViewManager.Inst().OpenView(
            event_end.p1 == ENUM_BATTLE_END.WIN ?
                ((this.rep.BattleInfo.resultView && this.rep.BattleInfo.resultView[0]) ? this.rep.BattleInfo.resultView[0] : FightAccountWinView) :
                ((this.rep.BattleInfo.resultView && this.rep.BattleInfo.resultView[1]) ? this.rep.BattleInfo.resultView[1] : FightAccountFailView),
            { rep: this.rep, reward_data: this.rep.data_reward });
        this.be_event = undefined;
        this.rep = undefined;
    }
    onStart(be_event: BattleAttackerEventData, rep: BattleReportData, is_skip?: boolean): boolean {
        this.be_event = be_event;
        this.rep = rep;
        if (be_event.even_data[ENUM_BATTLE_EVENT.FIGHT_OVER]) {
            if (is_skip) {
                this.onEnd();
            } else
                Timer.Inst().AddRunTimer(this.onEnd.bind(this), 1, 1, false);
            return true;
        }
        return false;
    }
}

/** 获得buff 11
 * @param p1 位置 @param p2 buff类型 @param p3 buff参数 @param p4 0:失去buff 1:获得buff  */
class Battle_Beh_FIGHT_BUFF implements Battle_Beh {

    onEnd(): void {
        BattleBeh.Inst().onEventNext();
    }
    onStart(be_event: BattleAttackerEventData): void {
        let event_hps = be_event.even_data[ENUM_BATTLE_EVENT.ADD_BUFF];
        if (event_hps) {
            for (let index = 0; index < event_hps.length; index++) {
                const event = event_hps[index];
                let target = event.vo
                if (!event.isOn) {
                    event.isOn = true;
                    switch (event.p2) {
                        case ENUM_BATTLE_BUFF.BUFF_TYPE_STUN:
                            if (event.p4 == 1) {
                                if (be_event.vo) {
                                    be_event.event_attack = ENUM_BATTLE_EVENT_ATTACK.THUMP;
                                    BattleBeh.Inst().data.hp_list.push(be_event)
                                }
                                target.node.playEffect("4164017", target.node.top, true);
                            } else {
                                target.node.stopEffect("4164017");
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        if (be_event.type == ENUM_BATTLE_EVENT.ADD_BUFF) {
            this.onEnd();
        }
    }
}

/** 操作开始 15
 * @param p1 位置 @param p2 1：开始 0：结束 */
class Battle_Beh_FIGHT_EVENT_ATTACK implements Battle_Beh {

    onEnd(): void {
        BattleBeh.Inst().onEventNext(0.1);
    }
    onStart(att_event: BattleAttackerEventData): void {
        if (att_event.p2 == 0) {
            let attacterVo = att_event.vo;
            let attacterNode = attacterVo.node
            BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.INJURED].onStart(att_event, true);
            // Timer.Inst().AddRunTimer(() => {
            attacterNode.setIndex(attacterVo.index_show)
            attacterNode.reSetPos(this.onEnd.bind(this));
            // }, 0.1, 1, false);
        }
    }
}

/** 宠物特效结束 17
* @param p1 位置 @param p2 ID @param p3*/
class Battle_Beh_FIGHT_EVENT_EFFECT implements Battle_Beh {

    onEnd(): void {
        BattleBeh.Inst().onEventNext();
    }
    onStart(att_event: BattleAttackerEventData): void {
        if (att_event.p3 == 0) {
            BattleBeh.Inst().stopPassiveEffect(att_event)
        }
        this.onEnd()
    }
}

/** 复活 999
 * @param p1 位置 @param p2 1：开始 0：结束 */
class Battle_Beh_FIGHT_EVENT_ALIVE implements Battle_Beh {

    onEnd(time = 0.1): void {
        // BattleBeh.Inst().onEventNext(time);
    }
    onStart(att_event: BattleAttackerEventData): void {
        // let time = 0.1
        // if (att_event.skill_passive) {
        //     if (BattleBeh.Inst().data.val_skill_name == att_event.skill_passive.skill_name) {
        //         SMDTriggerNotify(BattleBeh.Inst().data, "val_skill_name")
        //     } else {
        //         BattleBeh.Inst().data.val_skill_name = att_event.skill_passive.skill_name;
        //     }
        //     time = att_event.dealyTime
        // }
        let attacterVo = att_event.vo;
        let attacterNode = attacterVo.node
        attacterNode.doAlive()
        BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.PASSIVE].onStart(att_event);
        // BattleBeh.list_battle_beh[ENUM_BATTLE_EVENT.HP_CHANGE].onStart(att_event);
        // this.onEnd(time ? time : 0.1);
    }
}