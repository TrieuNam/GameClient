import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { CoreCrisisBoxType, CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { UH } from "../../helpers/UIHelper";
import { CoreCrisisCard } from "modules/CoreCrisis/CoreCrisisCard";
import { CoreCrisisBoxData, CoreCrisisBoxRet } from "./CoreCrisisBoxData";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { Timer } from "modules/time/Timer";
import { CountDownTTTimerHandle } from "data/HandleCollectorCfg";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { ObjectPool } from "core/ObjectPool";
import { UISpineShow } from "modules/scene_obj_spine/UISpineShow";
import { ResPath } from "utils/ResPath";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { RoleCtrl } from "modules/role/RoleCtrl";

enum CoreCrisisBoxViewState {
    None,
    OpenBox = 1,
    ShowCard1,
    ShowCard2,
    ShowCard3,
    ShowRet,
    Count,
}
@BaseView.registView
export class CoreCrisisBoxView extends BaseView {

    private curState = CoreCrisisBoxViewState.None;
    private displayRunning = false;
    private cardTran: fgui.Transition;
    private finalRetTran: fgui.Transition;
    // private boxTran:fgui.Transition;
    private spShow: UISpineShow = undefined;

    protected viewRegcfg = {
        UIPackName: "CoreCrisisBox,CoreCrisisCard",
        ViewName: "CoreCrisisBox",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.Block,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */
    OpenCallBack() {
        this.gotoNextState();
    }
    protected viewNode = {
        LrMask: <fgui.GLoader>null,
        GgCard: <fgui.GGroup>null,
        CcMainCard: <CoreCrisisCard>null,
        LrBoxNum: <fgui.GLoader>null,
        LrIconSmall: <fgui.GLoader>null,
        LrIcon: <fgui.GLoader>null,
        LblNum: <fgui.GLabel>null,
        PbCore: <fgui.GProgressBar>null,
        RtProg: <fgui.GRichTextField>null,
        GgRetCards: <fgui.GGroup>null,
        CcRetCard1: <CoreCrisisCard>null,
        LrRetIcon1: <fgui.GLoader>null,
        LblRetNum1: <fgui.GLabel>null,
        CcRetCard2: <CoreCrisisCard>null,
        LrRetIcon2: <fgui.GLoader>null,
        LblRetNum2: <fgui.GLabel>null,
        CcRetCard3: <CoreCrisisCard>null,
        LrRetIcon3: <fgui.GLoader>null,
        LblRetNum3: <fgui.GLabel>null,
        EffectShow: <UIEffectShow>null,
        GgBoxNum: <fgui.GGroup>null,
        LrBoxButtom: <fgui.GLoader>null,
        LrBoxCoverOpen: <fgui.GLoader>null,
        LrBoxCoverClose: <fgui.GLoader>null,

    };

    protected extendsCfg = [
        { PkgName: "CoreCrisisCard", ResName: "CoreCrisisCard", ExtendsClass: CoreCrisisCard }
    ];

    InitData() {
        // fgui.GGroup;
    }

    InitUI() {

        // this.viewNode.GgCard.alpha = 0.5;
        // this.viewNode.CcMainCard.SetLv(10);
        // this.viewNode.CcMainCard.SetType(CoreCrisisType.Mount);
        // this.viewNode.CcMainCard.ShowLv(false);
        // this.viewNode.CcRetCard1.ShowLv(false);
        // this.viewNode.CcRetCard2.ShowLv(false);
        // this.viewNode.CcRetCard3.ShowLv(false);
        this.viewNode.LrMask.on(fgui.Event.CLICK, this.onClickMask, this);
        this.cardTran = this.view.getTransition("CardAlpha");
        this.finalRetTran = this.view.getTransition("FinalRetShow");
        // this.boxTran = this.view.getTransition("Box");
        // console.error(`====${this.cardTran}===`);

        // this.showCoreCard(0);
        // this.viewNode.EffectShow.PlayEff(4164119);
    }

    private setBoxNum(num: number) {
        UH.SpriteName(this.viewNode.LrBoxNum, "CoreCrisisBox", `KaPianShuLiang${num}`);
    }

    private static setHuiZhang(img: fgui.GLoader, type: CoreCrisisType) {
        let v = `HuiZhang${type}`;
        // console.error(`===${v}`);
        UH.SpriteName(img, "CoreCrisisBox", `HuiZhang${type}`);
    }

    private setProg(val: number, max: number) {
        this.viewNode.PbCore.max = max;
        this.viewNode.PbCore.value = val;
        UH.SetText(this.viewNode.RtProg, `${TextHelper.SizeStr(val, 36)}/${max}`);
    }

    private showCoreCard(index: number) {
        let ret = CoreCrisisBoxData.Inst().OpenBoxRet[index];
        this.setBoxNum(2 - index);
        this.viewNode.CcMainCard.SetType(ret.type);
        CoreCrisisBoxView.setHuiZhang(this.viewNode.LrIconSmall, ret.type);
        let ccParam = CoreCrisisData.Inst().GetCCparam(ret.type);
        let needNum = ccParam.need_num;
        this.viewNode.CcMainCard.SetLv(ccParam.level);
        let addNum = ret.num;
        let hasNum = Number(Item.GetNum(ccParam.need_item)) - addNum;// BagData.Inst().GetNumByItemId(
        this.setProg(hasNum, needNum);
        // this.viewNode.PbCore.max = needNum;
        // this.viewNode.PbCore.value = hasNum;
        // UH.SetText(this.viewNode.RtProg, `${TextHelper.SizeStr(hasNum,36)}/${needNum}`);
        CoreCrisisBoxView.setHuiZhang(this.viewNode.LrIcon, ret.type);
        UH.SetText(this.viewNode.LblNum, `+${ret.num}`);
        let nowShowNum = 0;
        let upgradeTime = 0.075;  //多少秒长一点
        this.displayRunning = true;
        this.viewNode.GgCard.alpha = 0;
        this.viewNode.EffectShow.StopEff(4164120);
        this.viewNode.EffectShow.PlayEff(4164120, () => {
            this.handleCollector.KeyAdd("WaitCardEff", CountDownTTTimerHandle.Create(() => { }, () => {
                this.cardTran.play(() => {
                    AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
                    this.handleCollector.KeyAdd("ProgChange", CountDownTTTimerHandle.Create(
                        () => {   //onUpdate
                            ++nowShowNum;
                            this.setProg(hasNum + nowShowNum, needNum);
                        },
                        () => {   //onCompete
                            this.setProg(hasNum + addNum, needNum);
                            this.displayRunning = false;
                        },
                        addNum * upgradeTime, upgradeTime, false));
                });
            }, 1));
        });

    }

    private gotoNextState() {
        ++this.curState;
        switch (this.curState) {
            case CoreCrisisBoxViewState.OpenBox:
                this.showBoxOpen(); break;
            case CoreCrisisBoxViewState.ShowCard1:
                this.viewNode.GgCard.visible = true;
                this.showCoreCard(0); break;
            case CoreCrisisBoxViewState.ShowCard2:
                this.showCoreCard(1);break;
            case CoreCrisisBoxViewState.ShowCard3:
                this.showCoreCard(2);break;
            case CoreCrisisBoxViewState.ShowRet:
                this.showFinalRet(); break;
        }
    }

    private showBoxOpen() {
        let boxQua = CoreCrisisBoxData.Inst().BoxQuality;
        // boxQua = CoreCrisisBoxType.Normal;
        // UH.SpriteName(this.viewNode.LrBoxButtom, "CoreCrisisBox",`BaoXiangBtm${boxQua}`);
        // UH.SpriteName(this.viewNode.LrBoxCoverClose, "CoreCrisisBox",`BaoXiangClose${boxQua}`);
        // UH.SpriteName(this.viewNode.LrBoxCoverOpen, "CoreCrisisBox",`BaoXiangOpen${boxQua}`);
        this.displayRunning = true;
        this.viewNode.GgCard.visible = false;
        this.viewNode.GgBoxNum.visible = false;
        // this.boxTran.play(()=>{
        //     this.viewNode.EffectShow.PlayEff(4164119);
        //     this.viewNode.GgBoxNum.visible = true;
        //     this.setBoxNum(3);
        //     this.handleCollector.KeyAdd("WaitCardEff",CountDownTTTimerHandle.Create(()=>{},()=>{
        //         this.displayRunning = false;
        //         this.gotoNextState();
        //     },0.2));
        // });
        this.spShow = ObjectPool.Get(UISpineShow, ResPath.Spine(`core_crisis_box${boxQua}`), (obj: any) => {
            obj.setPosition(400, -750);
            this.view._container.insertChild(obj, 2);
            AudioManager.Inst().Play(AudioTag.KaiXiangXuLi);
            this.handleCollector.KeyAdd("WaitBoxOpen", CountDownTTTimerHandle.Create(() => { }, () => {
                this.viewNode.EffectShow.PlayEff(4164119);
                this.viewNode.GgBoxNum.visible = true;
                this.setBoxNum(3);
                AudioManager.Inst().Play(AudioTag.KaiXiangZi);
                this.handleCollector.KeyAdd("WaitCardEff", CountDownTTTimerHandle.Create(() => { }, () => {
                    this.displayRunning = false;
                    this.gotoNextState();
                }, 0.3))
            }, 1.3));
        });
    }


    private showFinalRet() {
        this.viewNode.GgCard.visible = false;
        this.flushFinalRetCard(0);
        this.flushFinalRetCard(1);
        this.flushFinalRetCard(2);
        this.viewNode.GgRetCards.visible = true;
        this.displayRunning = true;
        this.finalRetTran.play(() => {
            this.displayRunning = false;
        })
    }

    private flushFinalRetCard(index: number) {
        let ret = CoreCrisisBoxData.Inst().OpenBoxRet[index];
        let objI = index + 1;

        let ccCard = this.KeyVN<CoreCrisisCard>(`CcRetCard${objI}`);
        ccCard.SetType(ret.type);
        let ccParam = CoreCrisisData.Inst().GetCCparam(ret.type);
        ccCard.SetLv(ccParam.level);
        let icon = this.KeyVN<fgui.GLoader>(`LrRetIcon${objI}`);
        CoreCrisisBoxView.setHuiZhang(icon, ret.type);
        UH.SetText(this.KeyVN<fgui.GLabel>(`LblRetNum${objI}`), `+${ret.num}`);
        // console.error(`lbl=${this.KeyVN<fgui.GLabel>(`LblRetNum${objI}`)},str=${ret.num}`)
    }

    private onClickMask() {
        if (this.displayRunning) {
            return;
        }
        if (this.curState < CoreCrisisBoxViewState.Count - 1) {
            this.gotoNextState();
        }
        else {
            ViewManager.Inst().CloseView(CoreCrisisBoxView);
        }
    }


    DoOpenWaitHandle() {
    }


    CloseCallBack() {
        if (this.spShow) {
            ObjectPool.Push(this.spShow);
        }
        RoleCtrl.Inst().checkAdCard()
    }

    ///----------------测试接口-----------------------///
    //通过类型获取升级需要的核心数量
    // testNeedCoreNum(type:CoreCrisisType){
    //     let cfg = {
    //         [CoreCrisisType.Mount] : 15,
    //         [CoreCrisisType.Angel] : 20,
    //         [CoreCrisisType.Gem] : 25,
    //         [CoreCrisisType.StarMap] : 10,
    //         [CoreCrisisType.Inscription] : 30,
    //         [CoreCrisisType.ShenQi] : 15,
    //     }
    //     return cfg[type];
    // }

    // //通过类型获取当前已有的核心数量
    // testCurCoreNum(type:CoreCrisisType){
    //     let cfg = {
    //         [CoreCrisisType.Mount] : 7,
    //         [CoreCrisisType.Angel] : 12,
    //         [CoreCrisisType.Gem] : 17,
    //         [CoreCrisisType.StarMap] : 2,
    //         [CoreCrisisType.Inscription] : 22,
    //         [CoreCrisisType.ShenQi] : 7,
    //     }
    //     return cfg[type];
    // }
}
