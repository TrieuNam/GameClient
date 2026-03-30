import { _decorator, Component, ParticleSystem, animation, Animation, Event, Director, NodePool, CCBoolean, CCInteger, Node } from "cc";
import { NodePools } from "core/NodePools";
import { ObjectPool, IPoolObject } from "core/ObjectPool";
import { TransformByTarget } from "core/TransformByTarget";
import { ConstValue } from "modules/common/ConstValue";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer, TYPE_TIMER } from "modules/time/Timer";
import { SpineObjDirX } from "../ObjSpineConfig";
import { CocSyncParticle } from "../../../ccomponent/CocSyncParticle";


const { ccclass, property } = _decorator;
@ccclass("UIEffectConf")
export class UIEffectConf extends Component {
    @property(Node)
    EffectNode: Node;
    @property(Animation)
    Anim: Animation;
    @property(CCBoolean)
    playOnAwake: boolean = false;
    @property(CCInteger)
    playTime: number = 0;
    @property(CCInteger)
    delayPlayTime: number = 0;
    private _arr_particle: UIEffectParticle[];
    private _dirX: SpineObjDirX = SpineObjDirX.LEFT;
    private _ani: Animation;
    private _comp: Function;
    private _tByTarget: TransformByTarget;
    private _cocSync: CocSyncParticle;
    public target: Node;

    public get arr_particle(): UIEffectParticle[] {
        return this._arr_particle;
    }

    onLoad() {
        if (!this._arr_particle) {
            this.init(this.playOnAwake);
        }
    }

    init(playOnAwake = false) {
        this._arr_particle = [];
        let effect_id = this.node.name;
        let p_effect;
        if (this.EffectNode) {
            p_effect = this.EffectNode;
        } else {
            p_effect = this.EffectNode = this.node.getChildByName(ConstValue.NameEffect + effect_id);
        }

        if (p_effect) {
            this._ani = this.Anim || p_effect.getComponent(Animation);
            if (this._ani) {
                this._ani.playOnLoad = playOnAwake;
            }
            if (p_effect) {
                let fun = (children: readonly Node[]) => {
                    if (children && children.length) {
                        children.forEach(node_effect => {
                            let particle = node_effect.getComponent(ParticleSystem);
                            if (particle) {
                                particle.playOnAwake = playOnAwake;
                                this._arr_particle.push(ObjectPool.Get(UIEffectParticle, particle));
                            } else {
                                fun(node_effect.children)
                            }
                        });
                    }
                }
                fun(p_effect.children)
            }
        }
        this._tByTarget = this.node.getComponent(TransformByTarget);
        this._cocSync = this.node.getComponent(CocSyncParticle);
    }

    public clean() {
        NodePools.Inst().Put(this.node);
    }

    protected onDestroy() {
        this.setDirX(SpineObjDirX.LEFT);
        this._arr_particle.forEach(element => {
            ObjectPool.Push(element);
        });
        this._arr_particle = undefined;
        this._ani = undefined;
        if (this._tByTarget) {
            this._tByTarget.target = undefined;
        }
        if (this._ht) {
            Timer.Inst().CancelTimer(this._ht);
            this._ht = undefined;
        }
        if (this._ht_dealy) {
            Timer.Inst().CancelTimer(this._ht_dealy);
            this._ht_dealy = undefined;
        }
    }

    public setComp() {
        this._ani.on(Animation.EventType.STOP, this.onComp, this);
        // this._arr_particle.forEach(element => {
        //     element.particle.set
        // });
    }

    private onComp() {

    }
    private _ht_dealy: TYPE_TIMER;
    private _ht: TYPE_TIMER;
    public play(node?: Node) {
        if (this.delayPlayTime) {
            if (this._ht_dealy) {
                this.stop();
                Timer.Inst().CancelTimer(this._ht_dealy);
            }
            this._ht_dealy = Timer.Inst().AddRunTimer(this.doPlay.bind(this, node), this.delayPlayTime, 1, false);
            return;
        }
        this.doPlay(node)
        if (this._cocSync) {
            this._cocSync.onPlay();
        }
    }

    private doPlay(node?: Node) {
        this.node.active = true;
        if (node) {
            node.addChild(this.node);
        }
        if (this._ani) {
            this._ani.play();
        }
        if (this._arr_particle) {
            this._arr_particle.forEach(element => {
                element.particle.play();
            });
        }
        if (this._tByTarget) {
            this._tByTarget.target = this.target;
        }
        if (this.playTime) {
            if (this._ht) {
                Timer.Inst().CancelTimer(this._ht);
            }
            this._ht = Timer.Inst().AddRunTimer(this.stop.bind(this), this.playTime, 1, false);
        }
    }

    public stop() {
        this.node.active = false;
        if (this._ani) {
            this._ani.stop();
        }
        if (this._arr_particle)
            this._arr_particle.forEach(element => {
                if (element.particle.processor)
                    element.particle.stop();
            });

        if (this._ht) {
            Timer.Inst().CancelTimer(this._ht);
            this._ht = undefined;
        }
        if (this._ht_dealy) {
            Timer.Inst().CancelTimer(this._ht_dealy);
            this._ht_dealy = undefined;
        }
    }

    public rePlay() {
        this.stop();
        this.doPlay();
    }

    setDirX(x: SpineObjDirX) {
        if (this._dirX == x) {
            return;
        }
        let cx = -1;
        this._dirX = x;
        // this.EffectNode.scale = this.EffectNode.scale.multiply3f(cx, cx, 1);
        this._arr_particle.forEach(element => {
            if (element.particle._rotationOvertimeModule && element.particle._rotationOvertimeModule.enable) {
                element.particle._rotationOvertimeModule.z.constant *= cx;
            }
        });
    }
}


class UIEffectParticle implements IPoolObject {
    private _particle: ParticleSystem;
    public get particle(): ParticleSystem {
        return this._particle;
    }
    private comp: 0 | 1;
    reInit?(particle: ParticleSystem): void {
        this._particle = particle;
    }
    onPoolReset(): void {
        this._particle = undefined;
        this.comp = 0;
    }
    constructor(particle: ParticleSystem) {
        this.reInit(particle);
    }
}