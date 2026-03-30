import * as fgui from "fairygui-cc";
import { LogError } from "core/Debugger";
import { ViewLayer } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { ViewManager } from "manager/ViewManager";
import { ItemCell } from "modules/extends/ItemCell";
import { Item } from "modules/bag/ItemData";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { Timer } from "modules/time/Timer";
import { TimeHelper } from "../../helpers/TimeHelper";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { IntegralTurntableData } from "./IntegralTurntableData";
import { TurntableView } from "./TurntableView";
import { IntegralSourceView } from "./IntegralSourceView";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { BaseItem } from "modules/common/BaseItem";
import { RedPoint } from "modules/extends/RedPoint";


// @BaseView.registView
export class IntegralTurntableView extends fgui.GComponent {


    protected viewRegcfg = {
        UIPackName: "MoreServer",
        ViewName: "IntegralTurntableView",
        LayerType: ViewLayer.Normal,
    };

    protected viewNode: { [key: string]: any } = {
        Node_0: <TurntableAwardCell>null,
        Node_1: <TurntableAwardCell>null,
        Node_2: <TurntableAwardCell>null,
        Node_3: <TurntableAwardCell>null,
        Node_4: <TurntableAwardCell>null,
        Node_5: <TurntableAwardCell>null,
        Node_6: <TurntableAwardCell>null,
        Node_7: <TurntableAwardCell>null,
        Node_8: <TurntableAwardCell>null,
        Node_9: <TurntableAwardCell>null,
        Node_10: <TurntableAwardCell>null,
        Node_11: <TurntableAwardCell>null,
        Node_12: <TurntableAwardCell>null,
        Node_13: <TurntableAwardCell>null,

        BtnSoure: <fgui.GButton>null,
        BtnJump: <fgui.GButton>null,
        BtnOne: <fgui.GButton>null,
        BtnTen: <fgui.GButton>null,
        BtnGailv: <fgui.GButton>null,
        Integral: <fgui.GTextField>null,
        OneText: <fgui.GTextField>null,
        TenText: <fgui.GTextField>null,
        MustNum: <fgui.GTextField>null,
        Time: <fgui.GTextField>null,
        timer: <TimeMeter>null,
        MustItem: <ItemCell>null,
        EffShowSource: <UIEffectShow>null,
        EffShowOne: <UIEffectShow>null,
        EffShowTen: <UIEffectShow>null,
        OneRedPoint: <RedPoint>null,
        TenRedPoint: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "TurntableAwardCell", ExtendsClass: TurntableAwardCell },
    ];

    private handleCollector: HandleCollector;
    private timer_handle_draw: any = null;
    static IsDrawing: boolean = false;
    private drawIndex: number = 0;
    private cache_timer: number = 0;
    private interval = 0.2;

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        Timer.Inst().CancelTimer(this.timer_handle_draw);
        this.timer_handle_draw = null;
        IntegralTurntableView.IsDrawing = false;
    }

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.data = IntegralTurntableData.Inst();
        this.addSmartDataCare(IntegralTurntableData.Inst().ResultData, this.FlushDrawInfo.bind(this), "TurntableInfoFlush");

        this.viewNode.BtnGailv.onClick(this.OnClickShowPro.bind(this));
        this.viewNode.BtnSoure.onClick(this.OnClickShowSourcePro.bind(this));
        this.viewNode.BtnOne.onClick(this.OnClickChou.bind(this, 1));
        this.viewNode.BtnTen.onClick(this.OnClickChou.bind(this, 10));

        this.viewNode.EffShowOne.PlayEff(4164137);
        this.viewNode.EffShowTen.PlayEff(4164138);
        this.viewNode.EffShowSource.PlayEff(4164139);

        this.drawIndex = 0;

        this.LuckydrawItem();
        this.FlushDrawInfo();

        let MustItemData = this.data.GetMinimumGuarantee();
        let item_call = Item.Create(MustItemData.reward, { is_click: true, is_num: true });
        this.viewNode.MustItem.SetData(item_call);

        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));

        this.SetSelect(true);
    };

    public SetSelect(select: boolean) {
        this.visible = select;
        if (select) {
            this.data.ClearFirstRemind();
        }
    }

    private TurntableRewardsShow(rewardSeqs: any[]) {
        let reward = this.data.GetSeqReward(rewardSeqs);
        ViewManager.Inst().OpenView(CommonRewardView, { reward_data: reward })
    }

    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let hour = time_t.hour ? time_t.hour : 1;
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour);
        UH.SetText(this.viewNode.Time, Language.OpenServer.TimeLimit + ":" + t_str)
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    };

    private OnClickShowPro() {
        //打开概率界面
        let param = {
            common_list: this.data.GetRewardPreviewShowData(2),
            special_list: this.data.GetRewardPreviewShowData(1),
        };
        ViewManager.Inst().OpenView(TurntableView, param);
    }

    private OnClickChou(num: number) {
        if (IntegralTurntableView.IsDrawing) {
            return PublicPopupCtrl.Inst().Center(Language.IntegralTurntable.DrawingTips);
        }
        let score = this.data.GetScoreNum();
        let scoreInfo = this.data.GetLuckDrawConfig();
        if ((num == 1 && score < scoreInfo.first_consume_score) || (num == 10 && score < scoreInfo.ten_consume_score)) {
            return PublicPopupCtrl.Inst().Center(Language.IntegralTurntable.onScore);
        }
        this.data.SendChouJiang(num);
    }

    private FlushDrawInfo() {
        if (this.data.TurntableInfo.rewardSeqs.length) {
            this.Draw(0)
        }
        this.MustItemNum();

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.JiFenChouJiang)
        this.FlushFlushTime()
    }

    private Draw(index: number) {
        if (this.data.TurntableInfo.rewardSeqs[index] && !this.viewNode.BtnJump.selected && index == 0) {
            this.Drawing(index, this.data.TurntableInfo.rewardSeqs[index]);
            // if (index > 0) {
            // Timer.Inst().CancelTimer(this.timer_handle_draw)
            // this.timer_handle_draw = Timer.Inst().AddCountDownTT(() => { }, () => {
            //     this.Drawing(index, this.data.TurntableInfo.rewardSeqs[index]);
            // }, 1, this.interval, false)
            // } else {
            // this.Drawing(index, this.data.TurntableInfo.rewardSeqs[index]);
            // }
        } else {
            Timer.Inst().CancelTimer(this.timer_handle_draw);
            this.timer_handle_draw = null;
            this.TurntableRewardsShow(this.data.TurntableInfo.rewardSeqs);
            this.data.SendGetAward();
            IntegralTurntableView.IsDrawing = false;
        }
    }

    private Drawing(index: number, to_index: number) {
        Timer.Inst().CancelTimer(this.timer_handle_draw)
        this.timer_handle_draw = Timer.Inst().AddRunTimer(() => {
            this.drawIndex++;
            this.drawIndex = this.drawIndex > 13 ? 0 : this.drawIndex;
            this.viewNode["Node_" + this.drawIndex].turnEffect();

            if (this.drawIndex == (to_index % 14)) {
                this.viewNode["Node_" + this.drawIndex].pitchOnEffect();
                Timer.Inst().CancelTimer(this.timer_handle_draw)
                this.Draw(index + 1)
            }
        }, this.interval, -1, false)
    }



    private OnClickShowSourcePro() {
        //打开积分来源
        ViewManager.Inst().OpenView(IntegralSourceView, this.data.GetIntegralSourceShowData());
    }

    private MustItemNum() {
        let info = this.data.GetLuckDrawConfig();
        let item_num = this.data.GetScoreNum();
        let must = this.data.GetMustNum();
        UH.SetText(this.viewNode.OneText, TextHelper.Format(Language.IntegralTurntable.UseNum, item_num, info.first_consume_score))
        UH.SetText(this.viewNode.TenText, TextHelper.Format(Language.IntegralTurntable.UseNum, item_num, info.ten_consume_score))
        UH.SetText(this.viewNode.Integral, TextHelper.Format(Language.IntegralTurntable.current, item_num))
        UH.SetText(this.viewNode.MustNum, TextHelper.Format(Language.IntegralTurntable.must, must));

        this.viewNode.OneRedPoint.SetNum(this.data.GetScoreRed(1));
        this.viewNode.TenRedPoint.SetNum(this.data.GetScoreRed(10));
    };

    private LuckydrawItem() {
        let data = this.data.getLuckydrawConfig();
        for (let i = 0; i < data.length; i++) {
            this.viewNode["Node_" + i].SetData(data[i]);
        }
    };
}

export class TurntableAwardCell extends BaseItem {
    protected viewNode = {
        Pu_bg: <fgui.GImage>null,
        Cell: <ItemCell>null,
        EffShow: <UIEffectShow>null,
    };
    public SetData(data: any) {
        this.data = data;
        let item_call = Item.Create(data.reward, { is_click: true, is_num: true });
        this.viewNode.Cell.SetData(item_call);
        let isBig = IntegralTurntableData.Inst().getIsBigPrize(this.data.seq % 14);
        this.viewNode.Pu_bg.visible = !isBig;
    }
    public turnEffect() {
        this.viewNode.EffShow.PlayEff(4164136);
    }
    public pitchOnEffect() {
        IntegralTurntableView.IsDrawing = false;
        this.viewNode.EffShow.StopEff(4164136)
        this.viewNode.EffShow.PlayEff(4164135);
    }
}
