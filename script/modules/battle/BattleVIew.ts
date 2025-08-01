
import { TransformByTarget } from "core/TransformByTarget";
import * as fgui from "fairygui-cc";
import { UIPkgConfig } from "manager/UIPkgConfig";
import { ViewManager } from "manager/ViewManager";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { SceneObjVoFightSpine } from "modules/scene_obj_spine/SceneObjVoSpine";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ENUM_BATTLE_EVENT_ATTACK, ENUM_BATTLE_FONT } from "./BattleConf";
import { BattleCtrl } from "./BattleCtrl";
import { BattleBehData, BattleBeh } from "./BattleBeh";
import { BattleReportData, BattleData, BattleEventData, BattleAttackerEventData } from "./BattleData";
import { ResPath } from "utils/ResPath";
import { LogError } from "core/Debugger";




@BaseView.registView
export class BattleView extends BaseView {
    private v_data: BattleReportData;
    private b_data: BattleBehData;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: UIPkgConfig.Battle,
        ViewName: "BattleView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    protected extendsCfg = [
        { ResName: "XueTiao", ExtendsClass: XueTiao },
        { ResName: "XueTiaoTip", ExtendsClass: XueTiaoTip },
    ];

    protected viewNode: { [key: string]: any } = {
        XueTiao0: <XueTiao>null,
        XueTiao1: <XueTiao>null,
        XueTiao2: <XueTiao>null,
        XueTiao3: <XueTiao>null,
        XueTiao4: <XueTiao>null,
        XueTiao5: <XueTiao>null,
        lb_round: <fgui.GLabel>null,
        BtnSkip: <fgui.GButton>null,

        gp_name: <fgui.GGroup>null,
        lb_name: <fgui.GLabel>null,
    }
    private ani_name: fgui.Transition;
    InitData() {
        let t = this;
        this.viewNode.BtnSkip.onClick(this.OnClickSkip, this);
    }

    public initBattleData() {
        let t = this;
        t.ani_name = t.view.getTransition("ani_name")
        t.v_data = BattleData.Inst().cu_battle_data;
        t.b_data = BattleBeh.Inst().data;
        t.AddSmartDataCare(t.b_data, t.onRound.bind(t), "round")
        t.AddSmartDataCare(t.b_data, t.onHpChange.bind(t), "val_hp")
        t.AddSmartDataCare(t.b_data, t.onBuff.bind(t), "val_passive")
        t.AddSmartDataCare(t.b_data, t.onSkillName.bind(t), "val_skill_name")
        this.onRound();
        for (let index = 0; index <= 5; index++) {
            const xu: XueTiao = t.viewNode["XueTiao" + index];
            if (xu) {
                let vo = t.v_data.data_obj_vo[index]
                if (vo) {
                    xu.init(vo)
                    t.AddSmartDataCare(vo, t.OnSmaHp.bind(t, index), "hp")
                } else
                    xu.init(undefined)
            }
        }
    }

    InitUI() {
        this.viewNode.BtnSkip.visible = false;
        this.hidhp();
    }

    onRound() {
        let t = this;
        UH.SetText(t.viewNode.lb_round, TextHelper.Format(Language.Battle.round, DataHelper.GetDaXie(t.b_data.round)));
        this.viewNode.BtnSkip.visible = t.b_data.round > 5
    }

    onHpChange() {
        let t = this;
        let data_hp = t.b_data;
        for (let index = 0; index < data_hp.hp_list.length; index++) {
            const element = data_hp.hp_list[index];
            const xu: XueTiao = t.viewNode["XueTiao" + element.p1];
            if (xu) {
                xu.hpChange(element);
            }
        }
    }

    onBuff() {
        let t = this;
        let data = t.b_data;
        t.b_data.passive_list.forEach((element, index) => {
            const xu: XueTiao = t.viewNode["XueTiao" + index];
            if (xu) {
                xu.passiveChange(element);
            }
        });
    }

    onSkillName() {
        if (this.b_data.val_skill_name != "") {
            this.viewNode.gp_name.visible = true;
            UH.SetText(this.viewNode.lb_name, this.b_data.val_skill_name);
            this.ani_name.play();
        }
    }

    OpenCallBack(): void {
        let t = this;
        BattleCtrl.Inst().initView(t);


    }

    private OnSmaHp(index: number) {
        const xu: XueTiao = this.viewNode["XueTiao" + index];
        if (xu) {
            let vo = this.v_data.data_obj_vo[index]
            if (vo) {
                xu.SetData(vo);
            }
        }
    }

    CloseCallBack() {
        let t = this;
        if (t.v_data) {
            t.v_data.Clean();
        }
        // this.hidhp();
    }

    private hidhp() {
        for (let index = 1; index <= 6; index++) {
            const xu: XueTiao = this.viewNode["XueTiao" + index];
            if (xu) {
                xu.visible = false;
            }
        }
    }

    private CloseView() {
        ViewManager.Inst().CloseView(BattleView)
    }

    private OnClickSkip() {
        BattleCtrl.Inst().skipFight();
    }
}

class XueTiao extends fgui.GComponent {
    constructor() {
        super();
    }
    private viewNode = {
        gp: <fgui.GGroup>undefined,
        n1: <fgui.GLoader>undefined,
        tip: <XueTiaoTip>undefined,
    }

    // private t_by_target: TransformByTarget;
    public init(vo: SceneObjVoFightSpine) {
        if (vo) {
            let tfb = this.node.addComponent(TransformByTarget);
            tfb.target = vo.node.top;
            this.visible = true;
            if (vo.drawer.Appearance.surfaceMount > 0) {
                this.viewNode.gp.y = -20;
            } else {
                this.viewNode.gp.y = 0
            }
            this.viewNode.gp.visible = true;
        } else {
            this.visible = false;
        }
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(vo: SceneObjVoFightSpine) {
        if (vo.hp == 0) {
            this.viewNode.gp.visible = false;
        } else {
            this.viewNode.gp.visible = true;
        }
        let amo = vo.hp / vo.hp_max;
        if (amo < 0.07 && amo != 0) {
            amo = 0.07
        }
        this.viewNode.n1.fillAmount = amo
    }
    public hpChange(hp: BattleEventData) {
        this.viewNode.tip.SetData(hp);
    }

    public passiveChange(effect: string[]) {
        this.viewNode.tip.SetPassive(effect);
    }
}

class XueTiaoTip extends fgui.GComponent {
    private viewNode = {
        lb_hp: <fgui.GTextField>undefined,
        img_buff: <fgui.GLoader>undefined,
        // ani_hp: <fgui.GTween>undefined,
    }
    private ani: fgui.Transition;
    private ani_buff: fgui.Transition;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.ani = this.getTransition("ani_hp");
        this.ani_buff = this.getTransition("ani_buff");
    }

    public SetPassive(effect: string[]) {
        this.playPassive([].concat(effect));
    }

    private playPassive(arr_skeff: string[]) {
        if (arr_skeff && arr_skeff.length) {
            let skeff = arr_skeff.pop();
            if (skeff && skeff != "0" && +skeff < 1000) {
                UH.SpriteNameLoader(this.viewNode.img_buff, ResPath.BattleBuff(skeff));
                this.ani_buff.play(this.playPassive.bind(this, arr_skeff));
            } else if (arr_skeff.length) {
                this.playPassive(arr_skeff);
            }
        }

    }

    public SetData(hp_event: BattleEventData) {
        let font = "";
        let text;
        if (hp_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.THUMP) {
            font = ENUM_BATTLE_FONT.N;
            text = ENUM_BATTLE_FONT.Z;
        } else {
            text = hp_event.p2 + "";
            if (hp_event.p3 == 1) {
                font = ENUM_BATTLE_FONT.K;
                text += "k";
            } else
                if (hp_event.p2 > 0) {
                    font = ENUM_BATTLE_FONT.A;
                    text = "+" + text;
                } else {
                    font = ENUM_BATTLE_FONT.N;
                    if (hp_event.p2 == 0) {
                        text = ENUM_BATTLE_FONT.S
                    } else {
                        if (hp_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.LIANJI) {
                            text += ENUM_BATTLE_FONT.L;
                        } else if (hp_event.event_attack == ENUM_BATTLE_EVENT_ATTACK.FANJI) {
                            text += ENUM_BATTLE_FONT.F;
                        }
                    }
                }
        }
        UH.SetText(this.viewNode.lb_hp, "");
        UH.FontName(this.viewNode.lb_hp, UIPkgConfig.Battle, font);
        UH.SetText(this.viewNode.lb_hp, text);
        this.ani.play();
    }
}