import { view } from "cc";
import { LogError } from "core/Debugger";
import { HandleBase, HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { Debugger } from "electron";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ArenaData } from "modules/Arena/ArenaData";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { BasePanel } from "modules/common/BasePanel";
import { BaseView } from "modules/common/BaseView";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { LoginData } from "modules/login/LoginData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { BattleScene } from "modules/scene/BattleScene";
import { Timer } from "modules/time/Timer";
import { PackageData } from "preload/PkgData";
import { TextHelper } from "../../helpers/TextHelper";
import { BattleBeh } from "./BattleBeh";
import { BATTLE_INFO_INIT, ENUM_BATTLE, BATTLE_INFO } from "./BattleConf";
import { BattleData } from "./BattleData";
import { BattleView } from "./BattleVIew";


export class BattleCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCBattleReport, func: this.recvResult }
        ]
    }
    private _urlHttp = "http://{0}:85/h02_{1}_s{2}/fightdata/common_"
    private _urlHttps = "https://{0}:94/h02_{1}_s{2}/fightdata/common_"
    private _url: string;
    private _data: BattleData = BattleData.Inst();
    private _onPre = 0;
    private _onError = false;
    private _wait: {
        time: number;
    };
    protected initCtrl() {
        BATTLE_INFO_INIT();
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC, this.onLogin, this);
    }

    private onLogin() {
        if (LoginData.Inst().HTTPS) {
            this._url = this._urlHttps;
        } else {
            this._url = this._urlHttp;
        }
    }

    /**请求战斗
     * @param ty_battle ENUM_BATTLE 战斗类型
     * @param ty_req 战斗协议type
     * @param param 协议参数
     */
    public reqFight(ty_battle: ENUM_BATTLE, ty_req: number, ...param: any[]) {
        let t = this;
        if (t._wait) {
            return;
        }

        let battle_info = BATTLE_INFO[ty_battle];
        if (t._data.check(ty_battle)) {
            PublicPopupCtrl.Inst().Center(Language.Battle.loading)
            return
        }
        if (battle_info) {
            fgui.GRoot.inst.touchable = false;
            t._wait = Timer.Inst().AddRunTimer(() => {
                t.reqTimeOut();
            }, 1, 1, false);

            let proto = t.GetProtocol(battle_info.proto);
            proto.type = ty_req;
            for (let index = 0; index < param.length; index++) {
                let p = param[index];
                let key = "p" + (index + 1);
                if (p != undefined) {
                    proto[key] = p;
                }
            }
            t._onPre = 0;
            t._onError = false;
            t.SendToServer(proto);
        } else {
            LogError("Battle", "no Info");
        }
    }
    private _handle_load: HandleBase
    public check(view: BaseView | BasePanel, cb: Function) {
        return this.checkByHandle(view.handleCollectors, cb);
    }

    public checkByHandle(handleCollector: HandleCollector, cb: Function) {
        let isload = BattleData.Inst().checkLoad(undefined);
        if (isload) {
            if (this._handle_load) {
                if (this._handle_load.collector == handleCollector) {
                    return isload;
                }
                this._handle_load.BindFunc();
                this._handle_load.removeSelfFromCollector();
                this._handle_load = undefined
            }
            if (handleCollector) {
                let handle = SMDHandle.Create(BattleBeh.Inst().data, cb, "val_load_end")
                handle.collector = handleCollector;
                handleCollector.Add(handle);
                this._handle_load = handle;
            }
        }
        return isload;
    }

    private recvResult(data: PB_SCBattleReport) {
        LogError("Log info:", data);
        BattleScene.Inst().loadBg();
        let url = this.GetBattleUrl(data);
        this._data.load(data, url, false);
    }

    private GetBattleUrl(data: PB_SCBattleReport) {
        let type;
        if (BATTLE_INFO[data.battleModeType].isPvP) {
            type = "pvp"
        } else {
            type = "pve"
        }
        let server_info = LoginData.Inst().GetCurServerInfo();
        return TextHelper.Format(`${this._url}${type}/${data.battleModeType}/${data.battleFileName}`, server_info.noHeandIp, PackageData.Inst().getSpid(), server_info.fsid);
    }

    public test(src: string): void {
        let data = new PB_SCBattleReport();
        data.battleModeType = ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB;
        let isLoacal = false
        if (src.indexOf("http") == -1) {
            isLoacal = true;
            src = src.replace(/\s/g, "")
        }
        this._data.load(data, src, isLoacal);
    }

    public test2(src: string): void {
        let data = new PB_SCBattleReport();
        data.battleModeType = ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB;
        this._data.load(data, "1675231914_0_2", true);
    }
    onStart() {
        BattleBeh.Inst().data.val_load_end = !BattleBeh.Inst().data.val_load_end
        if (this._handle_load) {
            this._handle_load.removeSelfFromCollector();
            this._handle_load = undefined;
        }
    }

    public onLoadError(type: ENUM_BATTLE) {
        this.reqTimeOut();
        PublicPopupCtrl.Inst().Center(Language.Battle.tip);
        this._onError = true;
        BattleBeh.Inst().data.val_load_end = !BattleBeh.Inst().data.val_load_end
        if (this._handle_load) {
            this._handle_load.removeSelfFromCollector();
            this._handle_load = undefined;
        }
    }

    Load() {
        ViewManager.Inst().OpenView(BattleView)
    }

    private reqTimeOut() {
        Timer.Inst().CancelTimer(this._wait);
        this._wait = undefined;
        fgui.GRoot.inst.touchable = true;
    }

    public initView(view: BattleView) {
        BattleScene.Inst().init(view);
        this._onPre += 1;
        if (this._onPre == 2) {
            view.initBattleData();
            this._data.Approach();
        }

    }

    /**加载完毕 人物进场 */
    public OnLoad() {
        this.reqTimeOut();
        AudioManager.Inst().PlayBg(AudioTag.FbZhanDou);
        this._onPre += 1;
        if (this._onPre == 2) {
            let view: BattleView = ViewManager.Inst().getView<BattleView>(BattleView);
            view.initBattleData();
            this._data.Approach();
        }
        if (!ViewManager.Inst().IsOpen(BattleView)) {
            ViewManager.Inst().OpenView(BattleView)
        }
    }

    /**位置就绪开始战斗 */
    public OnPos() {
        this._data.onStart();
    }

    public skipFight() {
        BattleBeh.Inst().onSkip();
    }

    public end() {
        this._onPre = 0;
        AudioManager.Inst().PlayBg(AudioTag.ZhuJieMian);
        BattleScene.Inst().end();
        BattleData.Inst().onEnd();
        BattleBeh.Inst().onEnd();
    }
}