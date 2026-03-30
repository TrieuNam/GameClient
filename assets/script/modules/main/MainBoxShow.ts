

import { log, Node } from "cc";
import { ObjectPool } from "core/ObjectPool";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BoxData, BOX_STATUS, AUTO_STATUS } from "modules/box/BoxData";
import { BoxInfoView } from "modules/box/BoxInfoView";
import { BaseView } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UISpineShow, UISpinePlayData } from "modules/scene_obj_spine/UISpineShow";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { UH } from "../../helpers/UIHelper";
import { LogError } from "core/Debugger";

export class MainBoxShow extends fgui.GComponent {

    private equip_up: fgui.Transition;

    private loopNum: number = 1;
    private loopNumMax: number = 0;
    private boxState: number = 0;
    private _wHanlder: { time: number } = undefined;
    private _wHanlderOpen: { time: number } = undefined;
    private viewNode = {
        UIEffectShow: <UIEffectShow>null,
        UIEffectShowUp: <UIEffectShow>null,
        IconEquip: <fgui.GLoader>null,
    };

    private changBoxConf = [
        undefined,
        4164065,
        4164069,
        4164066,
        4164070,
        4164067,
        4164071,
        4164068,
        4164072
    ]
    private spShow: UISpineShow = undefined;
    private _boxType: number = undefined;
    protected onDestroy(): void {
        let t = this;
        if (t._wHanlder) {
            Timer.Inst().CancelTimer(t._wHanlder);
            t._wHanlder = undefined;
        }
        if (t._wHanlderOpen) {
            Timer.Inst().CancelTimer(t._wHanlderOpen);
            t._wHanlderOpen = undefined;
        }
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public InitData() {
        this.equip_up = this.getTransition("equip_up");
        this.viewNode.IconEquip.visible = false;
        this.initBox(true);
        EventCtrl.Inst().on(CommonEvent.VIEW_CLOSE, this.onCloseViewBox, this);
    }

    private onCloseViewBox(viewName: string, viewClass: new (p?: any) => BaseView) {
        if (viewClass == BoxInfoView) {
            this.initBox();
        }
    }

    public initBox(isInit = false) {
        let t = this;
        let type = BoxData.Inst().GetBoxType();
        let is_real = BoxData.Inst().box_result_data.box_level_data != null;
        if (!t.spShow) {
            t.spShow = ObjectPool.Get(UISpineShow, ResPath.Box(type), () => {
                t.onBoxLoad(type);
            });
        } else {
            if (ViewManager.Inst().IsOpen(BoxInfoView)) {
                return;
            }
            if (t._boxType != undefined && t._boxType != type && type > this._boxType) {
                if (t.spShow.active == true && isInit == false && this.boxState != BOX_STATUS.Init && (t._boxType == type || this.boxState != BOX_STATUS.CLOSEED)) {
                    return
                }
                let oEffect = t.changBoxConf[t._boxType];
                t._boxType = type
                t.spShow.reInit(ResPath.Box(type), (obj: Node | undefined) => {
                    let nEffect = t.changBoxConf[t._boxType];
                    if (obj == undefined) {
                        t.viewNode.UIEffectShowUp.PlayEff(4164064)
                        t.viewNode.UIEffectShowUp.PlayEff(4164063)
                        let play = t.viewNode.UIEffectShowUp.PlayEff(oEffect, () => {
                            Timer.Inst().AddRunTimer(() => {
                                t.viewNode.UIEffectShowUp.PlayEff(nEffect)
                                t.spShow.setBySelf(false);
                                t.viewNode.UIEffectShowUp.StopAllEff(4)
                            }, 1.5, 1, false)
                        });
                        if (!play) {
                            Timer.Inst().AddRunTimer(() => {
                                t.viewNode.UIEffectShowUp.PlayEff(nEffect)
                                t.spShow.setBySelf(false);
                                t.viewNode.UIEffectShowUp.StopAllEff(4)
                            }, 1.5, 1, false)
                        }
                    } else {
                        t.onBoxLoad(type);
                    }
                }, true)
            } else {
                t._boxType = type
                t.spShow.reInit(ResPath.Box(type), () => {
                    t.onBoxLoad(type);
                })
            }
        }
        if (isInit) {
            t.spShow.active = false;
        } else if (t.spShow.active == false) {
            t.spShow.active = true;
        }
        if (type == 1 && this.is_init && t.spShow.active) {
            this.is_real_box_init = BoxData.Inst().box_result_data.box_level_data != null && BoxData.Inst().GetBoxType() == type;
            t.FlushBoxStatus();
        }
    }

    private is_init = false;
    private is_real_box_init = false;//真正的宝箱加载完成
    private onBoxLoad(type = 1) {
        let t = this;
        let is_real_box_init = BoxData.Inst().box_result_data.box_level_data != null && BoxData.Inst().GetBoxType() == type;
        this.is_real_box_init = is_real_box_init;
        t.spShow.node.setPosition(250, -455);
        t._container.insertChild(t.spShow.node, 0);
        t.spShow.addEffect(t.viewNode.UIEffectShow, "uiEffect");
        this.is_init = true;
        // !isInit &&
        t.FlushBoxStatus(true);
    }

    public FlushBoxStatus(is_check = false) {
        let state = BoxData.Inst().GetboxResultData().box_status;
        if (state == this.boxState)
            return;
        if (!BoxData.Inst().box_result_data.equip_info || !this.is_init ||
            !this.is_real_box_init)
            return;
        this.boxState = state;
        switch (this.boxState) {
            case BOX_STATUS.OPENING:
                this.playOpen();
                break;
            case BOX_STATUS.OPENANI:
                this.aniBoxOpen();
                break;
            case BOX_STATUS.OPENED:
                this.checkOpened();
                break;
            case BOX_STATUS.CLOSEING:
                this.CloseBox();
                break;
            case BOX_STATUS.CLOSEED:
                this.checkCloseed();
                break;
        }
    }

    /** 开启宝箱，播放蓄力特效 */
    private playOpen() {
        let equip_info = BoxData.Inst().GetBoxEquipInfo();
        if (equip_info && equip_info.equipInfo.itemId) {
            let icon_id = Item.GetIconId(equip_info.equipInfo.itemId);
            UH.SetIcon(this.viewNode.IconEquip, icon_id, ICON_TYPE.ITEM);
        }

        let qua = BoxData.Inst().GetBoxEquipQualiy();
        this.loopNum = 1;
        this.loopNumMax = qua;

        let playData = ObjectPool.Get(UISpinePlayData);
        // playData.end = 0.23;
        playData.name = "ani1";//宝箱打开 0.734
        playData.loop = false;
        playData.check = true;
        playData.comp = this.CheckLoop.bind(this);
        this.spShow.play(playData);
    }

    /**宝箱开启蓄力特效循环 */
    private CheckLoop() {
        if (this.loopNum <= this.loopNumMax) {
            if (BoxData.Inst().IsBoxBackStage())
                this.viewNode.UIEffectShow.StopAllEff();
            else
                this.viewNode.UIEffectShow.PlayEff(4164001 + this.loopNum);
            this.loopNum++;
            let playData = ObjectPool.Get(UISpinePlayData);
            playData.name = "ani2";//宝箱抖动 0.367
            this.spShow.play(playData);
            this.addTimer(0.26, this.CheckLoop.bind(this), 1)
            // playData.comp = this.CheckLoop.bind(this);
        } else {
            //循环结束，更新宝箱状态
            BoxData.Inst().SetBoxStatus(BOX_STATUS.OPENANI);
        }
    }

    /**宝箱蓄力结束，播放开箱动画 */
    private aniBoxOpen() {
        let playData = ObjectPool.Get(UISpinePlayData);
        // playData.start = 0.33;
        playData.name = "ani3";//宝箱打开 0.734
        playData.loop = false;
        playData.check = true;
        if (!BoxData.Inst().IsBoxBackStage()) {
            this.closeTimer();
            playData.comp = this.AniBoxEquip.bind(this);
            LogError("!!!!!!!处于后台")
        } else {
            playData.comp = null;
            this.addTimer(0.1, this.AniBoxEquip.bind(this), 2);
        }
        this.spShow.play(playData);
        if (this._wHanlderOpen) {
            Timer.Inst().CancelTimer(this._wHanlderOpen);
        }
        AudioManager.Inst().Play(AudioTag.KaiXiangZi);
        this._wHanlderOpen = Timer.Inst().AddRunTimer(() => {
            let is_play = this.viewNode.UIEffectShow.PlayEff(4164010);
        }, 0.1, 1, false)
    }

    /** 播放装备动效 */
    private AniBoxEquip() {
        this.checkOpened();
        this.equip_up.play();
        this.addTimer(0.333, () => {
            //装备动效播放结束，更新宝箱状态，检查开箱逻辑
            BoxData.Inst().SetBoxStatus(BOX_STATUS.OPENED)
            if (this.loopNumMax != 0)
                BoxData.Inst().checkBoxOpened();
        }, 3);
    }

    /**宝箱已打开，检查装备图标展示 */
    private checkOpened() {
        let equip_info = BoxData.Inst().GetBoxEquipInfo();
        if (equip_info && equip_info.equipInfo.itemId) {
            let equip_info = BoxData.Inst().GetBoxEquipInfo();
            if (equip_info && equip_info.equipInfo.itemId) {
                this.viewNode.IconEquip.visible = true;
                let icon_id = Item.GetIconId(equip_info.equipInfo.itemId);
                UH.SetIcon(this.viewNode.IconEquip, icon_id, ICON_TYPE.ITEM);
            }
        }
    }

    /**播放关闭宝箱动画 */
    public CloseBox() {
        for (let i = 4164002; i <= 4164010; i++) {
            this.viewNode.UIEffectShow.StopEff(i, false)
        }
        this.viewNode.IconEquip.visible = false;
        let playData = ObjectPool.Get(UISpinePlayData)
        playData.name = "ani4";  //0.367
        this.addTimer(0.3, this.BoxCloseed.bind(this), 4)
        playData.loop = false;
        this.spShow.play(playData);
    }

    /**更新宝箱关闭状态 检查开箱逻辑 */
    private BoxCloseed() {
        BoxData.Inst().checkBoxCloseed();
    }

    //宝箱已关闭
    private checkCloseed() {
        this.initBox();
    }

    private closeTimer() {
        Timer.Inst().CancelTimer(this._wHanlder);
    }

    private addTimer(time: number, func: Function, tag: number) {
        this.closeTimer();
        this._wHanlder = Timer.Inst().AddRunTimer(() => {
            Timer.Inst().CancelTimer(this._wHanlder);
            func();
        }, time, 1, false)
    }

}