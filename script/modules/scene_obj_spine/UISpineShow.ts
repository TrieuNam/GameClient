import { Animation, AnimationState, log, Node, path } from "cc";
import { LogError } from "core/Debugger";
import { NodePools } from "core/NodePools";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { SpSkeletonBase } from "core/SpSkeletonBase";
import { UIEffectShow } from "./UIEffectShow";
export class UISpinePlayData implements IPoolObject {
    reInit(): void {
        this.onPoolReset();
    }
    onPoolReset(): void {
        let t = this;
        t.name = "ani1";
        t.loop = false;
        t.comp = undefined;
        t.start = NaN;
        t.check = false;
        t.end = NaN;
    }
    constructor() {
        this.reInit();
    }
    public check: boolean;
    public name: string;
    public loop: boolean;
    public comp: Function;
    public start: number;
    public end: number;
}
export class UISpineShow implements IPoolObject {
    reInit(path?: string, onLoad?: (obj: Node | undefined) => void, setBySelf = false): void {
        this.LoadSpine(path, onLoad, setBySelf);
    }
    onPoolReset(): void {
        let t = this;
        t.resetNode();
        t._path = undefined;
        t._onLoadNode = undefined;
        t._compFunc = undefined;
    }

    private resetNode(claenPlayData = true) {
        let t = this;
        if (t._node) {
            t._node.removeFromParent();
            // NodePools.Inst().Put(t._node);
            t._node = undefined;
        }
        if (t._ske) {
            t._ske.setCompleteListener(undefined);
            t._ske = undefined
        }
        if (claenPlayData && t._playData) {
            ObjectPool.Push(t._playData);
            t._playData = undefined;
        }
        this._active = true;
    }

    private _active = true;
    public get active() {
        return this._active;
    }
    public set active(value: boolean) {
        this._active = value;
        if (this._node) {
            this._node.active = value;
        }
    }
    private _path: string;
    private _onLoadNode: Function;
    private _onLoadSke: Function;
    private _node: Node;
    private _compFunc: Function;
    private _playData: UISpinePlayData = undefined;
    private _funSetBySelf = Function;
    public get node(): Node {
        return this._node;
    }
    private _ske: SpSkeletonBase;

    constructor(path?: string, onLoad?: (obj: Node | undefined) => void, setBySelf = false) {
        this.reInit(path, onLoad, setBySelf);
    }
    public LoadSpine(path: string, onLoad?: Function, setBySelf = false) {
        let t = this;
        if (!onLoad) {
            setBySelf = false
        }
        if (path && path != undefined && t._path != path) {
            if (t._node && !setBySelf) {
                t.onPoolReset();
            }
            t._path = path;
            t._onLoadNode = onLoad;
            NodePools.Inst().Get(t._path, (obj: Node) => {
                if (t._path == path) {      //在加载的时候外部请求了其它加载
                    if (setBySelf) {
                        this._funSetBySelf = this.onLoaded.bind(this, obj)
                        t._onLoadNode && t._onLoadNode(undefined);
                    } else
                        t.onLoaded(obj);
                }
            });
        }
    }

    public setBySelf(claenPlayData = true) {
        let t = this;
        if (t._node) {
            t.resetNode(claenPlayData);
        }
        t._funSetBySelf && t._funSetBySelf();
    }

    private onLoaded(obj: Node) {
        let t = this;
        if (obj) {
            obj.active = t.active;
            t._node = obj;
            t._ske = t._node.getComponent(SpSkeletonBase);
            t._onLoadNode && t._onLoadNode(obj);
            t._ske.setCompleteListener(t.onComp.bind(t));
            t._ske.setOnPreLoad(() => {
                if (t.active) {
                    if (t._playData) {
                        t.play(t._playData);
                    }
                }
            })
        }
    }

    private onComp(track: { animation: Animation }) {
        let t = this;
        let name = track.animation.name;
        if (t._playData && name == t._playData.name) {
            t._playData.comp && t._playData.comp();
        }
        t._compFunc && t._compFunc();

    }

    public setCompFunc(compFunc: Function) {
        this._compFunc = compFunc;
    }
    public play(play_data: UISpinePlayData) {
        let t = this;
        if (t._playData && play_data != t._playData) {
            ObjectPool.Push(t._playData);
            t._playData = undefined;
        }
        t._playData = play_data;
        if (t._ske) {
            let check = play_data.check;
            if (check) {
                let now_name = t._ske.animation;
                if (now_name == play_data.name) {
                    return;
                }
            }

            let entry = t._ske.setAnimation(0, play_data.name, play_data.loop);
            if (!isNaN(play_data.start)) {
                entry.animationStart = play_data.start;
            }
            if (!isNaN(play_data.end)) {
                entry.animationEnd = play_data.end <= entry.animationEnd ? play_data.end : entry.animationEnd;
            }
            // ObjectPool.Push(play_data);
        }
    }

    public addEffect(effect: UIEffectShow, pName: string) {
        let eff_node = pName ? this.node.getChildByName(pName) : this._node;
        if (eff_node) {
            eff_node.addChild(effect._container);
        }
    }
}