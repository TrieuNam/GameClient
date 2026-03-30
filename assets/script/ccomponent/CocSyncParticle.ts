import { Component, HtmlTextParser, Node, sys, _decorator } from "cc";
import { Event, GComponent, GObject } from "fairygui-cc";
import { BaseCtrl } from "modules/common/BaseCtrl";
import { UIEffectConf } from "modules/scene_obj_spine/Effect/UIEffectConf";
import { TYPE_TIMER } from "modules/time/Timer";

const { ccclass, property } = _decorator;

@ccclass("CocSyncParticle")
export class CocSyncParticle extends Component {
    private _index: number = NaN;
    onLoad() {
        let name = this.node.name;
        let pSys = ParticleSyncSys.Inst();
        this._index = pSys.addEffect(name, this.node.getComponent(UIEffectConf));
    }
    public onPlay(): void {
        let name = this.node.name;
        ParticleSyncSys.Inst().onPlay(name, this._index);
    }
    onDestroy() {
        let name = this.node.name;
        ParticleSyncSys.Inst().removeEffect(name, this._index);
    }
}

export class ParticleSyncSys extends BaseCtrl {
    private list_effect: { [key: string]: UIEffectConf[] } = {};
    public addEffect(id: string, conf: UIEffectConf) {
        if (id && conf) {
            let effs = this.list_effect[id];
            if (!effs) {
                effs = this.list_effect[id] = [];
            }
            let index = effs.length;
            effs.push(conf);
            return index;
        }
        return -1;
    }

    public onPlay(id: string, skip_index: number) {
        if (id) {
            let effs = this.list_effect[id];
            if (effs) {
                effs.forEach((element, index) => {
                    element.rePlay();
                });
            }
        }
        return -1;
    }

    public removeEffect(id: string, index: number) {
        if (!isNaN(index) && index > 0) {
            let effs = this.list_effect[id];
            if (effs) {
                effs.splice(index, 1);
            }
        }
    }
}