import { _decorator, Component, CCString, Node } from "cc";
import { NodePools } from "core/NodePools";
import { ResPath } from "utils/ResPath";
import { SpineObjDirX } from "../ObjSpineConfig";
import { UIEffectConf } from "./UIEffectConf";


const { ccclass, property } = _decorator;
@ccclass("EffectTool")
export class EffectTool extends Component {
    private _list_effect: { [key: string]: UIEffectConf };

    private _dirX: SpineObjDirX = 1;
    public set dirX(value: SpineObjDirX) {
        this._dirX = value;
        for (const key in this._list_effect) {
            const element = this._list_effect[key];
            element.setDirX(value);
        }
    }
    @property({ type: [CCString] })
    EffectID: string[] = [];
    _EffectID_byLoad: string[] = [];
    @property([Node])
    PNode: Node[] = [];
    _PNode_byLoad: Node[] = [];

    private _tranFNode: Node[] = [];
    private _loading: { [key: string]: boolean }
    onLoad() {

    }
    onEnable() {
        let t = this;
        if (t._list_effect) {
            return
        }
        t._list_effect = {};
        t._loading = {};
        for (let index = 0, l = t.EffectID.length; index < l; index++) {
            const effect_id = t.EffectID[index];
            if (effect_id) {
                let path = ResPath.UIEffect(effect_id);
                let node = this.PNode[index]
                NodePools.Inst().Get(path, t.onEffectLoad.bind(t, effect_id, index, node));
            }
        }
    }

    private onEffectLoad(effect_id: string, index: number, pNode: Node, effect_node: Node) {
        let t = this;
        const node = pNode || t._PNode_byLoad[index];
        const target_node = t._tranFNode[index];
        let conf = effect_node.getComponent(UIEffectConf);
        if (conf) {
            conf.init();
            conf.setDirX(this._dirX);
            t._list_effect[effect_id] = conf;
            if (node) {
                node.addChild(effect_node);
            }
            conf.target = target_node;
            if (t._loading[effect_id] == true) {
                this.playEffect(effect_id)
                t._loading[effect_id] = false;
            }
        } else {
            console.error("战斗特效缺少UIEffectConf");

        }
    }

    public playEffect(effect_id: string, node?: Node, isLoad = false, res: string = undefined, target: Node = undefined) {
        let t = this;
        let conf = t._list_effect[effect_id];
        if (conf) {
            conf.play(node);
        } else if (isLoad) {
            if (t._loading[effect_id] != undefined) {
                return;
            }
            t._loading[effect_id] = true;
            let path = res && res != "" ? res : ResPath.UIEffect(effect_id)
            t._EffectID_byLoad.push(effect_id);
            t._PNode_byLoad.push(node);
            t._tranFNode.push(target);
            NodePools.Inst().Get(path, t.onEffectLoad.bind(t, effect_id, t._EffectID_byLoad.length - 1, null));
        }
    }

    public stopEffect(effect_id: string) {
        let t = this;
        let conf = t._list_effect[effect_id];
        if (conf) {
            conf.stop();
        }
        if (t._loading[effect_id]) {
            t._loading[effect_id] = false
        }
    }

    unLoadEffect(id: string) {
        let t = this;
        let effect = t._list_effect[id];
        if (effect) {
            effect.clean();
            delete t._list_effect[id];

        }
    }

    stopAllEffect() {
        let t = this;
        if (t._list_effect)
            for (const key in t._list_effect) {
                this.stopEffect(key)
            }
    }

    public clean() {
        let t = this;
        for (const key in t._list_effect) {
            const element = t._list_effect[key];
            element.clean();
        }
        t._list_effect = undefined;
        t._loading = undefined;
        t._tranFNode.length = 0;
        t._EffectID_byLoad.length = 0;
        t._PNode_byLoad.length = 0;
    }

    onDestroy() {
        this.clean();
    }
}

