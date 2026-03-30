import { CfgItem } from "config/CfgCommon";
import { ObjectPool } from "core/ObjectPool";
import { CountDownTTTimerHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { GET_TYPE } from "modules/bag/BagEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { ItemCell } from "modules/extends/ItemCell";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UISpineShow } from "modules/scene_obj_spine/UISpineShow";
import { ResPath } from "utils/ResPath";
import { UH } from "../../helpers/UIHelper";
import { BoxDrawData, BoxDrawState, BoxDrawType } from "./BoxDrawData";


@BaseView.registView
export class BoxDrawRewardView extends BaseView {

    private curState = BoxDrawState.None;
    private displayRunning = false;
    private cardTran: fgui.Transition;
    private finalRetTran: fgui.Transition;
    private spShow: UISpineShow = undefined;

    protected viewRegcfg = {
        UIPackName: "BoxDrawReward",
        ViewName: "BoxDrawRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.Block,
    };

    OpenCallBack() {
        this.gotoNextState();
    }
    protected viewNode = {
        LrMask: <fgui.GLoader>null,
        Card: <BoxDrawRewardtem>null,
        GgRetCards: <fgui.GGroup>null,
        Card0: <BoxDrawRewardtem>null,
        Card1: <BoxDrawRewardtem>null,
        Card2: <BoxDrawRewardtem>null,
        EffectShow: <UIEffectShow>null,
        LrBoxButtom: <fgui.GLoader>null,
        LrBoxCoverOpen: <fgui.GLoader>null,
        LrBoxCoverClose: <fgui.GLoader>null,

        GgBoxNum: <fgui.GGroup>null,
        LrBoxNum: <fgui.GLoader>null,

    };

    protected extendsCfg = [
        { ResName: "BoxDrawRewardItem", ExtendsClass: BoxDrawRewardtem },
        { ResName: "BoxDrawRewardItem2", ExtendsClass: BoxDrawRewardtem },
    ];

    InitData() {
    }

    InitUI() {
        this.viewNode.LrMask.on(fgui.Event.CLICK, this.onClickMask, this);
        this.cardTran = this.view.getTransition("CardAlpha");
        this.finalRetTran = this.view.getTransition("FinalRetShow");
    }

    private onClickMask() {
        if (this.displayRunning) {
            return;
        }
        if (this.curState < BoxDrawState.Count - 1) {
            this.gotoNextState();
        }
        else {
            ViewManager.Inst().CloseView(BoxDrawRewardView);
        }
    }

    private gotoNextState() {
        ++this.curState;
        switch (this.curState) {
            case BoxDrawState.OpenBox:
                this.showBoxOpen(); break;
            case BoxDrawState.ShowCard1:
                this.viewNode.Card.visible = true;
                this.showCoreCard(0); break;
            case BoxDrawState.ShowCard2:
                this.showCoreCard(1); break;
            case BoxDrawState.ShowCard3:
                this.showCoreCard(2); break;
            case BoxDrawState.ShowRet:
                this.showFinalRet(); break;
        }
    }

    private showBoxOpen() {
        let boxQua = BoxDrawData.Inst().BoxQuality ?? BoxDrawType.Normal;
        let boxGetType = BoxDrawData.Inst().BoxGetType;
        this.displayRunning = true;
        this.viewNode.Card.visible = false;
        this.viewNode.GgBoxNum.visible = false;
        this.spShow = ObjectPool.Get(UISpineShow, ResPath.Spine(GET_TYPE.PUT_REASON_INSCRIPTION_BOX == boxGetType ? `MingWen_Box${boxQua}` : `sp_pet_box${BoxDrawType.Normal}`), (obj: any) => {
            obj.setPosition(400, -750);
            this.view._container.insertChild(obj, 2);
            AudioManager.Inst().Play(AudioTag.KaiXiangXuLi);
            this.handleCollector.KeyAdd("WaitBoxOpen", CountDownTTTimerHandle.Create(() => { }, () => {
                this.viewNode.EffectShow.PlayEff(4164121);
                this.setBoxNum(3);
                this.viewNode.GgBoxNum.visible = true;
                AudioManager.Inst().Play(AudioTag.KaiXiangZi);
                this.handleCollector.KeyAdd("WaitCardEff", CountDownTTTimerHandle.Create(() => { }, () => {
                    this.displayRunning = false;
                    this.gotoNextState();
                }, 0.3))
            }, 1.3));
        });
    }


    private showCoreCard(index: number) {
        let ret = BoxDrawData.Inst().GetBoxRet(index);
        this.viewNode.Card.SetData(ret);
        this.viewNode.Card.IsShowItem(false);
        this.displayRunning = true;
        this.viewNode.Card.alpha = 0;
        this.setBoxNum(2 - index);
        this.viewNode.EffectShow.PlayEff(4164122, () => {
            this.handleCollector.KeyAdd("WaitCardEff", CountDownTTTimerHandle.Create(() => { }, () => {
                this.viewNode.Card.IsShowItem(true);
                this.cardTran.play(() => {
                    AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
                    this.viewNode.EffectShow.StopEff(4164120);
                    this.displayRunning = false;
                });
            }, 1));
        });
    }


    private showFinalRet() {
        this.viewNode.Card.visible = false;
        this.viewNode.Card0.SetData(BoxDrawData.Inst().GetBoxRet(0));
        this.viewNode.Card1.SetData(BoxDrawData.Inst().GetBoxRet(1));
        this.viewNode.Card2.SetData(BoxDrawData.Inst().GetBoxRet(2));
        this.viewNode.GgRetCards.visible = true;
        this.displayRunning = true;
        this.finalRetTran.setHook("One", () => {
            this.viewNode.Card0.IsShowItem(true);
        })
        this.finalRetTran.setHook("Two", () => {
            this.viewNode.Card1.IsShowItem(true);
        })
        this.finalRetTran.setHook("Three", () => {
            this.viewNode.Card2.IsShowItem(true);
        })
        this.finalRetTran.play(() => {
            this.displayRunning = false;
        })
    }


    private setBoxNum(num: number) {
        UH.SpriteName(this.viewNode.LrBoxNum, "BoxDrawReward", `KaPianShuLiang${num}`);
    }

    CloseCallBack() {
        if (this.spShow) {
            ObjectPool.Push(this.spShow);
        }
        RoleCtrl.Inst().checkAdCard()
    }

}

class BoxDrawRewardtem extends BaseItem {
    protected viewNode = {
        title: <fgui.GTextField>null,
        Cell: <ItemCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: CfgItem) {
        this.viewNode.Cell.SetData(Item.Create(data, { is_num: true }));
        UH.SetText(this.viewNode.title, Item.GetName(data.itemId));
    }

    public IsShowItem(visible: boolean) {
        if (this.viewNode.Cell)
            this.viewNode.Cell.visible = visible;
    }
}