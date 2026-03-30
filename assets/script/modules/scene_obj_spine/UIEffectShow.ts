import { Animation, Node } from "cc";
import { NodePools } from "core/NodePools";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { GComponent } from "fairygui-cc";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { UIEffectConf } from "./Effect/UIEffectConf";


export class UIEffectShow extends GComponent implements IPoolObject {
    onPoolReset(): void {
        this._path = undefined;
        this._effects = undefined;
        this._invalid = false;
    }
    static Destory(obj: UIEffectShow) {
        ObjectPool.Push(obj);
    }

    reInit(): void {
        this._effects = new Map();
        this._effect_loading = new Map();
        this._invalid = false;
        this._container.once(Node.EventType.NODE_DESTROYED, () => {
            this.StopAllEff();
        }, this);
    }
    private _path: string;
    private _effects: Map<number | string, Node>
    private _effect_loading: Map<number | string, number>
    private _effects_ani: Map<number | string, Animation>
    private _invalid: boolean;
    _isIPool = false;
    constructor(path?: string) {
        super();
        this.reInit()
    }
    protected onConstruct() {
        this._invalid = false;
    }

    public PlayEff(effect_id: number | string, cb?: Function) {
        if (!effect_id || !this._effects) {
            return false;
        }
        if (this._effect_loading.has(effect_id)) {
            return false;
        }
        if (this._effects.has(effect_id)) {
            let node = this._effects.get(effect_id)
            let conf = node.getComponent(UIEffectConf)
            if (conf) {
                conf.play();
                return true;
            }
            this.StopEff(effect_id)
        }
        this._path = ResPath.UIEffect(effect_id);
        this._effect_loading.set(effect_id, 1);
        NodePools.Inst().Get(this._path, (obj) => {
            this.onLoaded(obj, effect_id, true);
            cb && cb();
        });
        return true
    }

    public StopEff(effect_id: number | string, destory = true) {
        if (!effect_id || !this._effects) {
            return
        }
        if (!this._effects)
            return;
        if (this._effects.has(effect_id)) {
            let data = this._effects.get(effect_id)
            let conf = data.getComponent(UIEffectConf)
            if (conf) {
                conf.stop();
                if (!destory) {
                    return
                }
            }
            let node = data.getChildByName("Uitexiao");
            if (node) {
                let ani = node.getComponent(Animation);
                if (ani)
                    ani.stop();
            }
            // data.active = false;
            NodePools.Inst().Put(data);
            this._effects.delete(effect_id)
        }
    }

    public StopAllEff(time?: number) {
        if (time) {
            Timer.Inst().AddRunTimer(() => {
                this.StopAllEff();
            }, time, 1, false)
            return
        }
        this._container.removeAllChildren()
        this._effects && this._effects.forEach((value, key) => {
            this.StopEff(key);
        })
    }

    onLoaded(data: Node, effect_id: number | string, visible: boolean) {
        if (data) {
            if (!this._invalid) {
                data.setParent(this._container)
                data.active = visible;
                let conf = data.getComponent(UIEffectConf)
                if (conf) {
                    visible ? conf.play() : conf.stop();
                }

                let node = data.getChildByName("Uitexiao");
                if (node) {
                    let ani = node.getComponent(Animation);
                    if (ani)
                        visible ? ani.play() : ani.stop();
                }
                this._effects.set(effect_id, data)
                this._effect_loading.delete(effect_id)
            } else {
                NodePools.Inst().Put(data);
            }
        }
    }

    onDestroy() {
        if (this._isIPool) {
            ObjectPool.Push(this);
        } else {
            this.onPoolReset();
        }
        this._invalid = true;
    }

}
