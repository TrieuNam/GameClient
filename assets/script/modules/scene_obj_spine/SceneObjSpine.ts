import { log, Node, UITransform } from "cc";
import { NodePools } from "core/NodePools";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { SmartDatRouter } from "data/SmartData";
import { ENUM_BATTLE_CHARACTER } from "modules/battle/BattleConf";
import { SceneObjRootCom } from "modules/scene_obj/SceneObjRootCom";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { SPINE_ANI_STATE, SPINE_ANI_EVENT_STATE, SPINE_OBJ_STATE } from "./ObjSpineConfig";
import { SceneObjDrawerSpine } from "./SceneObjDrawerSpine";
import { SceneObjVoBaseSpine, SceneObjVoFightSpine } from "./SceneObjVoSpine";

let rootPath = "actors/root_node_spine";
export let role_prefab = "10001";

export class SceneObjSpine implements IPoolObject {
    /**
     * 创建Spine模型
     * @param data spine模型数据
     * @param p 父节点
     */
    static Create<T extends SceneObjSpine>(
        cons: new (data: SceneObjVoBaseSpine,
            p: Node, invalid_CallBack?: (data: SceneObjVoBaseSpine) => void) => T,
        data: SceneObjVoBaseSpine,
        p?: Node, invalid_CallBack?: (data: SceneObjVoBaseSpine) => void): SceneObjSpine {
        return ObjectPool.Get(cons, data, p, invalid_CallBack);
    }
    static Destroy(obj: SceneObjSpine) {
        obj.Destory();
    }
    protected _vo: SceneObjVoBaseSpine
    protected _root: Node;
    public get top(): Node {
        return this._drawer.body.top;
    }
    public get center(): Node {
        return this._drawer.body.center;
    }
    protected _rootCom: SceneObjRootCom;
    private _root_p: Node
    private _invalid = false;
    private _invalid_CallBack: (data: SceneObjVoBaseSpine) => void;
    protected _drawer: SceneObjDrawerSpine;
    public constructor(data: SceneObjVoBaseSpine, p: Node, invalid_CallBack?: (data: SceneObjVoBaseSpine) => void) {
        this.reInit(data, p, invalid_CallBack);
    }

    reInit(data: SceneObjVoBaseSpine, p: Node, invalid_CallBack?: (data: SceneObjVoBaseSpine) => void): void {
        let t = this
        t._root_p = p
        t._invalid = false;
        t._vo = data;
        t._invalid_CallBack = invalid_CallBack;
        NodePools.Inst().Get(rootPath, t.OnLoad.bind(t, data))
    }

    onPoolReset(): void {
        let t = this;
        t._invalid = true;
        t.setNode(undefined);
        t._drawer.Destroy();
        t._invalid_CallBack = undefined;
        t._vo = undefined;
        t._root = undefined;
        t._rootCom = undefined;
        t._invalid_CallBack = undefined;
    }

    private OnLoad(data: SceneObjVoBaseSpine, obj: Node) {
        let t = this;
        if (t._invalid) {
            this.Destory();
            return;
        }
        t._root = obj
        t._rootCom = t._root.getComponent(SceneObjRootCom);
        t._vo.node = t;
        t.setNode(t._root_p);
        this.setPos(t._vo.pos.x, t._vo.pos.y);
        t.createDrawer();
    }

    protected OnLoadBody() {

    }

    private createDrawer() {
        let t = this;
        t._drawer = SceneObjDrawerSpine.Create(this._vo.drawer, this._rootCom.AttachNode, () => {
            t.OnLoadBody();
            t._invalid_CallBack && t._invalid_CallBack(t._vo);
        });
        let path;
        switch (t._vo.type) {
            case ENUM_BATTLE_CHARACTER.MONSTER:
                path = ResPath.Npc(t._vo.drawer.id_arm);
                break;
            case ENUM_BATTLE_CHARACTER.PET:
                path = ResPath.Npc(t._vo.drawer.id_arm);
                break;
            case ENUM_BATTLE_CHARACTER.ROLE:
                path = ResPath.ActorRole(t._vo.drawer.id_arm);
                break;
            default:
                path = ResPath.ActorRole(t._vo.drawer.id_arm);
        }
        t._drawer.flushMain(path);
    }

    public Destory() {
        ObjectPool.Push(this);
    };

    setNode(node: Node, index: number = NaN) {
        let t = this;
        if (node) {
            t._root_p = node
            t._root_p.addChild(t._root)
            if (!isNaN(index)) {
                t.setIndex(index);
            }
        } else {
            if (t._root_p) {
                t._root_p.removeChild(t._root)
                t._root_p = undefined;
            }
        }
    }

    setIndex(index: number = NaN) {
        this._rootCom.setIndex(index);
    }

    setPos(x: number, y: number, time: number = 0, cb?: () => void) {
        let t = this;
        if (t._vo.pos) {
            t._vo.pos.x = x;
            t._vo.pos.y = y;
            if (t._rootCom) {
                if (time) {
                    t._rootCom.Move(x, y, undefined, time, cb);
                } else
                    t._rootCom.SetPos(x, y);
            }
        }
    }

    reSetPos(cb?: () => void) {
        let t = this;
        this.setPos(t._vo.pos.x, t._vo.pos.y, this._vo.move_speed, cb);
    }

    public moveTo(x: number, y: number, time_scale: number = 1, cb?: () => void) {
        if (this._vo.drawer.anim.loopState == SPINE_ANI_STATE.RUN) {
            SmartDatRouter.OnValueChange(this._vo.drawer.anim, "loopState");
        } else
            this._vo.drawer.anim.loopState = SPINE_ANI_STATE.RUN;
        this._rootCom.Move(x, y, undefined, time_scale, () => {
            this.stopMove();
            cb && cb();
        })
    }

    public moveToSelf(x: number, y: number, time_scale: number = NaN, cb?: () => void) {
        if (isNaN(time_scale)) {
            time_scale = this._vo.move_speed
        }
        x = this.toPosByDirX(x, true);
        this._rootCom.Move(x, y, this._drawer.body.node_ske, time_scale, () => {
            cb && cb();
        })
    }

    public moveToVo(vo: SceneObjVoBaseSpine, time_scale?: number, cb?: () => void) {
        if (time_scale == undefined) {
            time_scale = this._vo.move_speed
        }
        this.moveTo(vo.pos.x + this.toPosByDirX(this._drawer.body.bodyTransform.width / 1.5), vo.pos.y, time_scale, cb);
    }
    public playOnce(type: SPINE_ANI_STATE, onceCb?: (type: SPINE_ANI_STATE) => void, onceEventCb?: (type: SPINE_ANI_EVENT_STATE) => void) {
        this._drawer.body._aarAnim.push({ type: type, onceCb: onceCb, onceEventCb: onceEventCb });
        if (this._drawer.body._aarAnim.length > 1) {
            return
        }
        let ani = this._vo.drawer.anim;
        ani.setComp(type, onceCb, onceEventCb);
        if (this._vo.drawer.anim.onceState == type) {
            SmartDatRouter.OnValueChange(this._vo.drawer.anim, "onceState");
        } else
            this._vo.drawer.anim.onceState = type;
    }

    public playLoop(type: SPINE_ANI_STATE) {
        if (this._vo.drawer.anim.loopState == type) {
            SmartDatRouter.OnValueChange(this._vo.drawer.anim, "loopState");
        } else
            this._vo.drawer.anim.loopState = type;
    }

    private stopMove() {
        this._vo.drawer.anim.loopState = SPINE_ANI_STATE.IDLE;
    }

    protected toPosByDirX(x: number, isSelf = false) {
        let dir = isSelf ? this._vo.drawer.anim.dirX : -this._vo.drawer.anim.dirX;
        return x *= dir;
    }
}

export class SceneObjFightSpine extends SceneObjSpine {
    // protected _vo:SceneObjVoFightSpine
    /**
     * 进场方式
     */
    public Approach(cb?: () => void) {
        let t = this;
        let p = t._root.parent;
        if (!p) {
            return
        }
        let p_transform = p.getComponent(UITransform);
        let s_x = p_transform.width / 2 * -t._vo.drawer.anim.dirX;
        t._rootCom.SetPos(s_x);
        t.moveTo(t._vo.pos.x, undefined, (this._vo as SceneObjVoFightSpine).drawer.anim.move_speed, cb);
    }

    protected OnLoadBody() {
        let effectTool = this._drawer.body.getEffectTool();
        if (effectTool) {
            effectTool.dirX = this._vo.drawer.anim.dirX;
            effectTool.enabled = true;
        }
    }
    public playEffect(effect_id: string, node?: Node, isLoad = false, res: string = undefined, target: Node = undefined) {
        let effectTool = this._drawer.body.getEffectTool();
        if (effectTool) {
            effectTool.playEffect(effect_id, node, isLoad, res, target);
        }
    }
    public stopEffect(effect_id: string) {
        let effectTool = this._drawer.body.getEffectTool();
        if (effectTool) {
            effectTool.stopEffect(effect_id);
        }
    }

    public stopAllEffect() {
        let effectTool = this._drawer.body.getEffectTool();
        if (effectTool) {
            effectTool.stopAllEffect();
        }
    }

    public doAlive(cb?: Function, time: number = 0) {
        let t = this;
        t._drawer.body.updateState(SPINE_OBJ_STATE.ALIVE)
        if (time) {
            Timer.Inst().AddRunTimer(() => {
                t.playOnce(SPINE_ANI_STATE.IDLE, (name: string) => {
                    t._drawer.body.updateState(SPINE_OBJ_STATE.NORMAL)
                    t.playLoop(SPINE_ANI_STATE.IDLE);
                    cb && cb();
                });
            }, time, 1, false);
        } else {
            t.playOnce(SPINE_ANI_STATE.IDLE, (name: string) => {
                t._drawer.body.updateState(SPINE_OBJ_STATE.NORMAL)
                t.playLoop(SPINE_ANI_STATE.IDLE);
                cb && cb();
            });
        }
    }
}
