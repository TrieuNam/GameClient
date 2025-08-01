
import { AudioClip, AudioSource, Input, _decorator } from "cc";
import { Debugger } from "core/Debugger";
import { SingletonCom } from "core/SingletonCom";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AUTO_STATUS, BoxData } from "modules/box/BoxData";
import { ROLE_SETTING_TYPE } from "modules/common/CommonEnum";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RoleData } from "modules/role/RoleData";
import { TaskData } from "modules/task/TaskData";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
const { ccclass, property } = _decorator;
export enum AudioTag {
    ZhuJieMian = "zhujiemian",
    TongYongClick = "tongyongdianji",
    FbZhanDou = "fb_zhandou",
    GongJi = "gongji",
    WaBao = "wabao",
    JiHuo = "jihuo",
    ShengJi = "shengji",
    KaiXiangXuLi = "kaixiangxuli",
    KaiXiangZi = "kaixiangzi",
    WaBaoBg = "wabaobg",
    WaBaoHuiChuTou = "wabaohuichutou",
    JinBi = "jinbi",
    ChuanDaiZhaungBei = "chuandaizhuangbei",
    HuoDeJingLi = "huodejingli",
}
@ccclass('AudioManager')
export class AudioManager extends SingletonCom {
    @property({ type: AudioSource })
    audioSource: AudioSource;
    audioEngine: AudioSource;
    private _cu_clip: AudioClip;
    private pools: { [key: string]: AudioClip } = {};
    private loadedBg: { [key: string]: boolean } = {}
    private _isInit = false;
    private _isLoad = false;
    private _preTag: AudioTag;
    private timer_handle: any;
    start() {
        console.log("最大音效播放数量：", AudioSource.maxAudioChannel);
        fgui.GRoot.inst.on(Input.EventType.MOUSE_DOWN, this.onTouchStartEvent, this);
    }
    onTouchStartEvent() {
        if (this.timer_handle) {
            Timer.Inst().CancelTimer(this.timer_handle)
            this.timer_handle = null
        }
        let level = RoleData.Inst().GetRoleLevel()
        if (level < 25) {
            //倒计时5秒进行指引
            this.timer_handle = Timer.Inst().AddCountDownTT(() => {

            }, () => {
                if (BoxData.Inst().getAutoStatus() != AUTO_STATUS.OVER) {
                    return
                }
                if (!TaskData.Inst().GetCurTaskInfo()) {
                    return
                }
                if (ViewManager.Inst().CurViewOnlyMain()) {
                    GuideCtrl.Inst().Start(30)
                }
            }, 5, 1, false)
        }
    }
    public PlayBg(tag: AudioTag) {
        let t = this;
        if (t.checkBg(tag)) {
            return
        }
        if (1 == RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingMusic)) {
            return
        }
        let clip = t.pools[tag];
        if (!clip) {
            //let url = fgui.UIPackage.getItemURL("Audio", tag)
            let url = fgui.UIPackage.getItemURL(tag, tag)
            let pi = fgui.UIPackage.getItemByURL(url)
            if (pi) {
                clip = t.pools[tag] = pi.owner.getItemAsset(pi) as AudioClip
            } else {
                Debugger.LogError("AudioManager", "pi undefined");
                return;
            }
        } else {
            if (!clip.isValid) {
                delete t.pools[tag];
                t.loadedBg[tag] = false;
                t.PlayBg(tag);
                return
            }
        }
        t.audioSource.stop();
        t.audioSource.clip = clip;
        //t.audioSource.volume = 1
        t.audioSource.loop = true;
        t.audioSource.play();
    }
    private checkBg(tag: AudioTag): boolean {
        let t = this;
        let loaded = t.loadedBg[tag];
        if (!loaded) {
            const path = ResPath.UIPackage(tag);
            fgui.UIPackage.loadPackage(path, (error: any, pkg: fgui.UIPackage) => {
                if (error) {
                    console.error(error);
                    return;
                }
                t.loadedBg[tag] = true;
                t.PlayBg(tag);
            })
            return true
        }
    }


    private check(tag: AudioTag): boolean {
        let t = this;
        if (!t._isInit || t._isLoad) {
            tag && (t._preTag = tag)
            if (t._isLoad) {
                return true
            }
            t._isLoad = true;
            const path = ResPath.UIPackage("Audio");
            fgui.UIPackage.loadPackage(path, (error: any, pkg: fgui.UIPackage) => {
                if (error) {
                    console.error(error);
                    return;
                }
                t._isInit = true;
                t._isLoad = false;
                if (t._preTag) {
                    t.PlayBg(t._preTag);
                    t._preTag = undefined
                }
            })
            return true
        }
    }
    public RePlayBg() {
        this.audioSource.play();
    }
    //0-1
    public BgVolume(value: number) {
        this.audioSource.volume = value
    }
    public StopBg() {
        this.audioSource.stop()
    }

    public Play(tag: AudioTag) {

        if (this.check(null)) {
            return
        }
        if (1 == RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingAudio)) {
            return
        }
        let url = fgui.UIPackage.getItemURL("Audio", tag)
        let pi = fgui.UIPackage.getItemByURL(url)
        if (pi) {
            let clip = pi.owner.getItemAsset(pi)
            fgui.GRoot.inst.playOneShotSound(<AudioClip>clip)
        }
    }
    public ReEffect() {
        fgui.GRoot.inst.volumeScale = 1
    }
    public StopEffect() {
        fgui.GRoot.inst.volumeScale = 0
    }

    // update(deltaTime: number) {

    // }
}

