import { Animation, log, Node, path, UITransform } from "cc";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { NodePools } from "core/NodePools";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { SpSkeleton } from "core/SpSkeleton";
import { SMDHandle } from "data/HandleCollectorCfg";
import { SmartDatRouter } from "data/SmartData";
import { FashionData } from "modules/fashion/FashionData";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { EffectTool } from "./Effect/EffectTool";
import { SpineObjDirX, SPINE_ANI_POINT, SPINE_ANI_SLOT, SPINE_ANI_STATE, SPINE_DEFAUT_SKIN, SPINE_OBJ_STATE, SPINE_ANI_EVENT_STATE } from "./ObjSpineConfig";
import { SceneObjAnimDataSpine, SceneObjFightAnimDataSpine } from "./SceneObjVoSpine";
import TGA from "tga-js";


export class BodyObjSpine implements IPoolObject {
    private _resPath: string;
    protected skeleton: SpSkeleton;
    protected root: Node;
    private _animData: SceneObjAnimDataSpine;
    private _handle: HandleCollector;
    private _bodyTransform: UITransform;
    private _invalid = false;
    private _state: SPINE_OBJ_STATE;

    public get bodyTransform(): UITransform {
        return this._bodyTransform;
    }
    private _top: Node;
    public get top(): Node {
        return this._top;
    }

    private _center: Node;
    public get center(): Node {
        return this._center;
    }

    protected _node_ske: Node;
    public get node_ske(): Node {
        return this._node_ske;
    }

    private _id_weapon = SPINE_DEFAUT_SKIN.WEAPON;
    private _id_head = SPINE_DEFAUT_SKIN.HEAD;
    private _id_shield = SPINE_DEFAUT_SKIN.SHIELD;
    private _id_body = SPINE_DEFAUT_SKIN.BODY;
    private _id_mount = SPINE_DEFAUT_SKIN.MOUNT;

    private _arr_skin_effect: { [key: string]: Node } = {};
    private _id_effect: { [key: string]: number } = {};
    private _arr_skin_effect2: { [key: string]: Node } = {};
    private _id_effect2: { [key: string]: string } = {};

    private _id_fazhen: number = undefined;

    private _node_ride: Node;
    private _ske_ride: SpSkeleton;

    private _node_fazhen: Node;

    private _node_ZuoTui: Node;
    private _node_tou: Node;
    private _node_tou1: Node;

    public static Create(r: Node, data: SceneObjAnimDataSpine): BodyObjSpine {
        return ObjectPool.Get(BodyObjSpine, r, data);
    }

    public constructor(r: Node, data: SceneObjAnimDataSpine) {
        this.reInit(r, data);
    }

    reInit(r: Node, data: SceneObjAnimDataSpine): void {
        let t = this;
        t._invalid = false;
        t._handle = HandleCollector.Create();
        t.root = r;
        t._animData = data;
        if (t.node_ske) {
            t.node_ske.setParent(t.root);
        }

    }

    onPoolReset(): void {
        let t = this;
        HandleCollector.Destory(t._handle);
        t._handle = undefined;
        t._resPath = undefined;
        t._invalid = true;

        if (t.skeleton) {
            // t.bindBone(t.skeleton, SPINE_ANI_SLOT.HIP, SPINE_ANI_SLOT.ROOT);
            t.skeleton.cleanSkin2();
            t.skeleton.clearTracks();
            t.skeleton.setCompleteListener(undefined)
            t.skeleton.setEventListener(undefined)
        }
        t.skeleton = undefined;
        if (t._node_ske) {
            for (const key in t._id_effect) {
                const id_effect = t._id_effect[key];
                if (id_effect) {
                    let attach = this.getSkinAttach(key as SPINE_ANI_SLOT)
                    if (attach) {
                        attach.removeAllChildren()
                    }
                }
                delete t._id_effect[key];
            }
            for (const key in t._id_effect2) {
                const id_effect = t._id_effect2[key];
                if (id_effect) {
                    let attach = this.getSkinAttach(key as SPINE_ANI_SLOT)
                    if (attach) {
                        attach.removeAllChildren()
                    }
                }
                delete t._id_effect2[key];
            }

            let rota = t._node_ske.getRotation();
            rota.y = 0;
            t._node_ske.setRotation(rota);
            t._node_ske.setParent(null);
            NodePools.Inst().Put(t._node_ske)
            let effect_tool = t.getEffectTool();
            if (effect_tool) {
                effect_tool.clean();
            }
            t._bodyTransform = undefined;
            t._node_ske.setPosition(0, 0, 0)
        }
        if (t._node_ride) {
            t._node_ride.setParent(null);
            if (t._node_ride) {
                NodePools.Inst().Put(t._node_ride)
            }
            t._node_ride = undefined;
            t._ske_ride = undefined;
        }
        t.root.removeAllChildren()
        NodePools.Inst().Put(t.root, false);
        t.root = undefined;

        t._animData = undefined;

        t._id_weapon = SPINE_DEFAUT_SKIN.WEAPON;
        t._id_head = SPINE_DEFAUT_SKIN.HEAD;
        t._id_shield = SPINE_DEFAUT_SKIN.SHIELD;
        t._id_body = SPINE_DEFAUT_SKIN.BODY;
        t._id_mount = SPINE_DEFAUT_SKIN.MOUNT;


        if (t._node_ZuoTui) {
            t._node_ZuoTui.active = false;
            t._node_ZuoTui = undefined;
        }

        if (t._node_tou1) {
            t._node_tou1.active = false;
            t._node_tou.active = true;

            t._node_tou1 = undefined
            t._node_tou = undefined
        }
        if (t._top) {
            t._top.setPosition(0, 200, 0)
        }
        if (t._node_fazhen) {
            t._node_fazhen.setParent(null);
            NodePools.Inst().Put(t._node_fazhen);
            t._node_fazhen = undefined;
        }
        for (const type in this._arr_skin_effect) {
            let element = this._arr_skin_effect[type]
            NodePools.Inst().Put(element);
            delete this._arr_skin_effect[type];
        }
        for (const type in this._arr_skin_effect2) {
            let element = this._arr_skin_effect2[type]
            NodePools.Inst().Put(element);
            delete this._arr_skin_effect2[type];
        }

        t._id_fazhen = undefined;
        t._node_ske = undefined;

    }
    public SetPath(path: string, cb?: Function) {
        let t = this;
        if (t._resPath == path) {
            return
        }
        if (t._resPath != path) {
            t._resPath = path;
            NodePools.Inst().Get(t._resPath, (obj: Node) => {
                if (t._resPath != path) {      //在加载的时候外部请求了其它加载
                    NodePools.Inst().Put(obj);
                    return;
                }
                t.onLoaded(obj, cb);
            });
        }
    }

    setParent(root: Node) {
        let t = this;
        t.root = root
        t.node_ske.setParent(t.root);
    }

    protected onLoaded(node_ske: Node, cb?: Function) {
        let t = this;
        if (t._invalid) {
            t.node_ske && NodePools.Inst().Put(t.node_ske);
            return;
        }

        t._node_ske = node_ske;
        if (t.node_ske.children) {
            t._top = t.node_ske.getChildByName(SPINE_ANI_POINT.TOP);
            t._center = t.node_ske.getChildByName(SPINE_ANI_POINT.CENTER);
        }
        t._bodyTransform = t.node_ske.getComponent(UITransform);
        // t._defDirx = rota.x;
        t.CheckNode();
        t.node_ske.getComponent(SpSkeleton).setOnPreLoad(() => {
            if (t._invalid) {
                return;
            }
            t.skeleton = t.node_ske.getComponent(SpSkeleton);
            t.skeleton.timeScale = t._animData.ani_time_scale;
            t.skeleton.setCompleteListener(this.onAniEnd.bind(this));
            t.skeleton.setEventListener(this.onAniEvent.bind(this));
            t._handle.Add(SMDHandle.Create(t._animData, t.onLoopAnimChange.bind(t), "loopState"));
            t._handle.Add(SMDHandle.Create(t._animData, t.onOnceAnimChange.bind(t), "onceState"));
            t._handle.Add(SMDHandle.Create(t._animData, t.onAnimSpeed.bind(t), "ani_time_scale"));
            t.onLoopAnimChange();
            t.flushWeapon();
            t.flushShield();
            t.flushHead();
            t.flushSkin2();
            t.flushMont();
            t.flushBody();
            if (t._animData instanceof SceneObjFightAnimDataSpine) {
                t.skeleton.Check();
            }
        })
        if (t.root) {
            t.node_ske.setParent(t.root);
            let y = (t._animData.dirX == SpineObjDirX.LEFT ? 0 : 180);
            t.node_ske.setRotationFromEuler(0, y, 0);
        }
        cb && cb();
    }

    private CheckNode() {
        let t = this;
        if (!t._top) {
            t._top = new Node();
            t._top.name = SPINE_ANI_POINT.TOP
            let trans_top = t._top.addComponent(UITransform);
            trans_top.height = trans_top.width = 0;
            t._top.setPosition(0, t._bodyTransform.height + 30, 0);
            t.node_ske.addChild(t._top);
        }
        if (!t._center) {
            t._center = new Node();
            t._center.name = SPINE_ANI_POINT.CENTER
            let trans_center = t._center.addComponent(UITransform);
            trans_center.height = trans_center.width = 0;
            t._center.setPosition(0, t._bodyTransform.height / 2, 0);
            t.node_ske.addChild(t._center);
        }
        let node_skin = this._node_ske.getChildByName(SPINE_ANI_SLOT.SKIN);
        if (node_skin) {
            let lt = node_skin.getChildByName(SPINE_ANI_SLOT.zuoTui);
            if (lt) {
                this._node_ZuoTui = lt;
            }

            let tou = node_skin.getChildByName(SPINE_ANI_SLOT.HEAD);
            if (tou) {
                this._node_tou = tou.getChildByName("attach")
                this._node_tou1 = tou.getChildByName("attach-1")
            }
        }
        if (this._animData instanceof SceneObjFightAnimDataSpine) {
            let effect_tool = this.getEffectTool()
            if (!effect_tool) {
                this.node_ske.addComponent(EffectTool);
            } else {
                effect_tool.enabled = true;
            }
        }
    }


    public flushWeapon(id?: number) {
        let t = this;
        t._id_effect[SPINE_ANI_SLOT.WEAPON] = undefined;
        t._id_weapon = (id == 0 && t._id_weapon != id) ? SPINE_DEFAUT_SKIN.WEAPON : id || t._id_weapon;
        t._id_weapon && t.skeleton?.changSkin2(SPINE_ANI_SLOT.WEAPON, t._id_weapon, ResPath.ActorWeapon(t._id_weapon), (result: boolean, loadId: string | number) => {
            if (!result || t._invalid || loadId != t._id_weapon) {
                return false
            }
            t.setSkinEffect(t._id_weapon, SPINE_ANI_SLOT.WEAPON)
            return true
        });
    }

    public flushShield(id?: number) {
        let t = this;
        t._id_effect[SPINE_ANI_SLOT.SHIELD] = undefined;
        t._id_shield = (id == 0 && t._id_shield != id) ? SPINE_DEFAUT_SKIN.SHIELD : id || t._id_shield;
        t._id_shield && t.skeleton?.changSkin2(SPINE_ANI_SLOT.SHIELD, t._id_shield, ResPath.ActorShiled(t._id_shield), (result: boolean, loadId: string | number) => {
            if (!result || t._invalid || loadId != t._id_shield) {
                return false
            }
            t.setSkinEffect(t._id_shield, SPINE_ANI_SLOT.SHIELD)
            return true
        });
    }

    private setSkinEffect(id: number, type: SPINE_ANI_SLOT) {
        let attach = this.getSkinAttach(type)
        if (attach) {
            let effect = this._arr_skin_effect[type];
            if (effect) {
                effect.removeFromParent();
                delete this._arr_skin_effect[type];
                NodePools.Inst().Put(effect);
            }
            let cfg_skin = FashionData.Inst().GetCFGFashionResId(id);
            if (cfg_skin && cfg_skin.effect_id && cfg_skin.effect_id != "0") {
                this._id_effect[type] = id;
                NodePools.Inst().Get(ResPath.Shizhuang(cfg_skin.effect_id), (obj: Node) => {
                    let effect = this._arr_skin_effect[type];
                    if (effect) {
                        effect.removeFromParent();
                        delete this._arr_skin_effect[type];
                        NodePools.Inst().Put(effect);
                    }
                    if (!obj || this._id_effect[type] != id) {
                        return;
                    }
                    if (this._invalid) {
                        NodePools.Inst().Put(obj);
                        return;
                    }
                    this._arr_skin_effect[type] = obj;
                    attach.addChild(obj);
                })
            }
        }
    }

    private flushSkin2() {
        for (const type in this._id_effect2) {
            const element = this._id_effect2[type];
            this.setSkin2(type as SPINE_ANI_SLOT, element);
        }
    }

    public setSkin2(type: SPINE_ANI_SLOT, path: string) {
        let t = this;
        if (t._invalid) {
            return
        }
        if (!t.skeleton) {
            t._id_effect2[type] = path;
        } else {
            let attach = t.getSkinAttach(type)
            if (attach) {
                let effect = t._arr_skin_effect2[type];
                if (effect) {
                    effect.removeFromParent();
                    delete t._arr_skin_effect2[type];
                    NodePools.Inst().Put(effect);
                }
                if (path) {
                    t._id_effect2[type] = path;
                    NodePools.Inst().Get(path, (obj: Node) => {
                        let effect = t._arr_skin_effect2[type];
                        if (effect) {
                            effect.removeFromParent();
                            delete t._arr_skin_effect2[type];
                            NodePools.Inst().Put(effect);
                        }
                        if (!obj || t._id_effect2[type] != path) {
                            return;
                        }
                        if (t._invalid) {
                            NodePools.Inst().Put(obj);
                            return;
                        }
                        t._arr_skin_effect2[type] = obj;
                        attach.addChild(obj);
                    })
                }
            }
        }
    }

    public flushHead(id?: number) {
        let t = this;
        t._id_effect[SPINE_ANI_SLOT.HEAD] = undefined;
        t._id_head = (id == 0 && t._id_head != id) ? SPINE_DEFAUT_SKIN.HEAD : id || t._id_head;
        if (t._id_head) {
            t.skeleton?.changSkin2(SPINE_ANI_SLOT.HEAD, t._id_head, ResPath.ActorHelmet(t._id_head), (result: boolean, loadId: string | number) => {
                if (!result || this._invalid || loadId != t._id_head) {
                    return false
                }
                this.setSkinEffect(t._id_head, SPINE_ANI_SLOT.HEAD)
                return true
            });
            t.skeleton?.changSkin2(SPINE_ANI_SLOT.HEAD, t._id_head, ResPath.ActorHelmet(t._id_head + "-1"), undefined, "attach-1")
        }
    }

    public flushBody(id?: number) {
        let t = this;
        t._id_effect[SPINE_ANI_SLOT.Body] = undefined;
        t._id_body = (id == 0 && t._id_body != id) ? SPINE_DEFAUT_SKIN.BODY : id || t._id_body;
        if (t._id_body && t.skeleton) {
            t.skeleton.changSkin2(SPINE_ANI_SLOT.Body, t._id_body, ResPath.ActorBody(t._id_body), (result: boolean, loadId: string | number) => {
                if (!result || this._invalid || loadId != t._id_body) {
                    return false
                }
                this.setSkinEffect(t._id_body, SPINE_ANI_SLOT.Body)
                return true
            });
            t.skeleton.changSkin2(SPINE_ANI_SLOT.rHand, t._id_body, ResPath.ActorBody(t._id_body, 3))
            if (this._node_ZuoTui && this._node_ZuoTui.active) {
                t.skeleton.changSkin2(SPINE_ANI_SLOT.zuoTui, t._id_body, ResPath.ActorBody(t._id_body, 4))
                // t.skeleton.changSkin2(SPINE_ANI_SLOT.youTui, t._id_body, ResPath.ActorBody(t._id_body, 5))
            } else {
                t.skeleton.changSkin(SPINE_ANI_SLOT.zuoTui, ResPath.ActorBody(t._id_body, 4))
                t.skeleton.changSkin(SPINE_ANI_SLOT.youTui, ResPath.ActorBody(t._id_body, 5))
            }
        }
    }

    public flushMont(id?: number) {
        let t = this;
        if (id != t._id_mount) {
            if (t._node_ride) {
                t._node_ride.setParent(null);
                NodePools.Inst().Put(t._node_ride)
                t._node_ride = undefined;
            }
            if (t._ske_ride) {
                t._ske_ride.setOnPreLoad(undefined);
                t._ske_ride.setCompleteListener(undefined);
                t._ske_ride = undefined
            }
        }
        t._id_mount = id != undefined ? id : t._id_mount;
        if (BodyObjSpine.Check_Mont(t._id_mount) && t.skeleton) {
            if (this._node_ZuoTui) {
                this._node_ZuoTui.active = true;
            }
            NodePools.Inst().Get(ResPath.Ride(t._id_mount), (node: Node | null) => {
                if (t._invalid || !node) {
                    NodePools.Inst().Put(node);
                    return;
                }
                t._node_ride = node;
                // t._node_ride.setScale(t.node_ske.getScale());
                t._ske_ride = t._node_ride.getComponent(SpSkeleton);
                t._ske_ride.setOnPreLoad(() => {
                    let y = t.bindBone(t._ske_ride, SPINE_ANI_SLOT.ZUOQI, SPINE_ANI_SLOT.HIP);
                    if (this._top) {
                        this._top.setPosition(0, this._top.position.y + y, 0)
                        this.node_ske.setPosition(0, -20, 0)
                    }
                    t.onLoopAnimChange();
                })
                t._ske_ride.setCompleteListener(t.onAniRideEnd.bind(t))

                let skin = t.node_ske.getChildByName("skin");
                skin && skin.getChildByName("ride").addChild(t._node_ride);
            })
        } else {
            this.skeleton && this.bindBone(this.skeleton, SPINE_ANI_SLOT.ROOT, SPINE_ANI_SLOT.HIP);
        }
    }

    public flushFazhen(id?: number) {
        let t = this;
        t._id_fazhen = id || t._id_fazhen;
        if (t._node_fazhen) {
            t._node_fazhen.setParent(null);
            NodePools.Inst().Put(t._node_fazhen);
            t._node_fazhen = undefined;
        }
        if (t._id_fazhen && t._id_fazhen != -1) {
            NodePools.Inst().Get(ResPath.Fazheng(t._id_fazhen), (fazhen: Node) => {
                if (t._invalid || !fazhen) {
                    t._node_fazhen.setParent(null);
                    NodePools.Inst().Put(t._node_fazhen);
                    t._node_fazhen = undefined;
                    return;
                }
                t._node_fazhen = fazhen;
                t.root.insertChild(t._node_fazhen, 0);
            })
        }
    }

    private onAniEvent(track: { animation: Animation }, ev: { data: { name: string } }) {
        let name = track.animation.name
        let event_comp = this._animData.getAniEventComp(name);
        if (event_comp) {
            event_comp(name);
        }
    }

    public _aarAnim: { type: SPINE_ANI_STATE, onceCb?: (type: SPINE_ANI_STATE) => void, onceEventCb?: (type: SPINE_ANI_EVENT_STATE) => void }[] = [];
    private onAniEnd(track: { animation: Animation }, count: number) {
        let onceState = this._animData.onceState
        let name = track.animation.name as SPINE_ANI_STATE;
        if (name == SPINE_ANI_STATE.IDLE && this._animData.onceState != SPINE_ANI_STATE.IDLE) {
            return;
        }
        let loop;
        if (SPINE_ANI_STATE.HIT == name || SPINE_ANI_STATE.ATTACK == name) {
            if (this._animData.onceState && name == this._animData.onceState && this._animData.loopState == SPINE_ANI_STATE.IDLE) {
                this._animData.onceState = SPINE_ANI_STATE.None;
                this.onLoopAnimChange()
                // SmartDatRouter.OnValueChange(this._animData, "loopState");
            } else {
                if (this._state != SPINE_OBJ_STATE.ALIVE) {
                    loop = SPINE_ANI_STATE.IDLE;
                }
            }
        }

        if (SPINE_ANI_STATE.DIE == name) {
            if (this._node_tou1) {
                this._node_tou1.active = true;
                this._node_tou.active = false;
            }
        }
        let event_comp = this._animData.getAniComp(name);
        if (event_comp) {
            this._animData.setComp(name, undefined, undefined);
            event_comp(name);
        }
        if (name == onceState) {
            this._aarAnim.shift();
            if (this._aarAnim.length) {
                let data = this._aarAnim.shift()
                let anim = this._animData;
                let type = data.type
                anim.setComp(type, data.onceCb, data.onceEventCb);
                if (anim.onceState == type) {
                    SmartDatRouter.OnValueChange(anim, "onceState");
                } else
                    anim.onceState = type;
            }
        } else {
            if (loop) {
                this._animData.loopState = loop;
            }
        }
    }

    private onAniRideEnd(track: { animation: Animation }, count: number) {
        let name = track.animation.name;
        if (this._animData.loopState == SPINE_ANI_STATE.RUN) {
            let event_comp = this._animData.getAniComp(name);
            if (event_comp) {
                event_comp(name);
            }
        }
    }

    public Destory() {
        ObjectPool.Push(this);
    }

    private onLoopAnimChange() {
        let t = this;
        if (this._node_tou1 && this._node_tou1.active) {
            this._node_tou1.active = false;
            this._node_tou.active = true; ``
        }

        if (t._ske_ride) {
            t._ske_ride.setAnimation(0, t._animData.loopState, true);
            if (t._animData.loopState == SPINE_ANI_STATE.RUN) {
                return;
            }
        }
        let track = t.skeleton.getCurrent(0);
        if (!track || track.loop || track.isComplete()) {
            if (t._animData.onceState == SPINE_ANI_STATE.ATTACK || t._animData.onceState == SPINE_ANI_STATE.HIT) {
                t.skeleton.addAnimation(0, t._animData.loopState, true);
            } else
                t.skeleton.setAnimation(0, t._animData.loopState, true);
        }
    }

    private onAnimSpeed() {
        let t = this;
        t.skeleton.timeScale = t._animData.ani_time_scale;
    }

    private onOnceAnimChange() {
        let t = this;
        if (t._animData.onceState == SPINE_ANI_STATE.None) {
            return
        }
        if (this._node_tou1 && this._node_tou1.active) {
            this._node_tou1.active = false;
            this._node_tou.active = true;
        }

        if (t._ske_ride) {
            t._ske_ride.setAnimation(0, t._animData.onceState, false);
            if (t._animData.onceState == SPINE_ANI_STATE.RUN) {
                return;
            }
        }
        t.skeleton.setAnimation(0, t._animData.onceState, false);
    }

    public getEffectTool() {
        return this.node_ske.getComponent(EffectTool);
    }

    public bindBone(p_ske: SpSkeleton, p_name: SPINE_ANI_SLOT, bineName: SPINE_ANI_SLOT) {
        return this.skeleton.bindBone(p_ske, p_name, bineName)
    }

    protected getSkinAttach(name_slot: SPINE_ANI_SLOT, attachName = "attach"): Node {
        let t = this;
        let skin = t.node_ske.getChildByName("skin");
        if (skin) {
            let slot = skin.getChildByName(name_slot);
            if (slot) {
                let attach = slot.getChildByName(attachName);
                if (attach) {
                    return attach
                }
            }
        }
    }

    static Check_Mont(id: number) {
        return id > 0
    }

    public updateState(state: SPINE_OBJ_STATE) {
        this._state = state;
    }
}
