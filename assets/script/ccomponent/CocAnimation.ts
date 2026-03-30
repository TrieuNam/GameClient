import { Animation, Sprite, _decorator } from "cc";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { onDestroy } from "../../../FairyGUIPrj/plugins/ClientTools/main";
import { ConstValue } from "modules/common/ConstValue";

const { ccclass, property } = _decorator;
@ccclass("CocAnimation")
/**重载Cocos动画控件
 * 修复未加载完的动画添加shader会失效
 */
export class CocAnimation extends Animation {
    private _isLoad = false;
    private _list_onLoad: any[];
    private _num_onLoad = 0;
    @property({ type: [Sprite] })
    target: [] = [];
    @property({ type: [String] })
    event: string[] = [];
    onLoad() {
        if (this.target.length) {
            this._list_onLoad = [];
            this.target.forEach(element => {
                let onEnable = (element as any)['onEnable'];
                (element as any)['onEnable'] = this.onTargetEnable.bind(this, this._list_onLoad.length);
                this._list_onLoad.push(onEnable)
            });
        } else {
            super.onLoad();
        }
        if (this.event.length) {
            this.event.forEach(element => {
                EventCtrl.Inst().on(element as CommonEvent, this.onPlayEvent.bind(this));
            });
        }
        this.pause();
    }

    private onPlayEvent(...param: string[]) {
        let name = param[0];
        if (name == ConstValue.ANI_PARAM.PLAY) {
            this.play();
        }
    }

    private onTargetEnable(index: number) {
        let fun: Function = this._list_onLoad[index];
        if (fun) {
            Function.call(fun);
        }
        this._num_onLoad += 1;
        if (this._num_onLoad >= this._list_onLoad.length) {
            super.onLoad();
        }
    }

    onDestroy(): void {
        if (this.event.length) {
            this.event.forEach(element => {
                EventCtrl.Inst().off(element as CommonEvent, this.onPlayEvent.bind(this));
            });
        }
    }
    onDisable(): void {
        this.pause();
    }
}