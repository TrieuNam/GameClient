import { BoxFundData } from 'modules/boxfund/BoxFundData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { ContinuePresentData } from 'modules/ContinuePresent/ContinuePresentCtrl';
import { DailyGiftData } from 'modules/DailyGift/DailyGiftCtrl';
import { ExclusiveGiftBagData } from 'modules/ExclusiveGiftBag/ExclusiveGiftBagData';
import { FirstChargeData } from 'modules/first_charge/FirstChargeCtrl';
import { InviteFriendData } from 'modules/invitefriend/InviteFriendData';
import { LeiChongData } from 'modules/lei_chong/LeiChongData';
import { LeiChongYouLiData } from 'modules/lei_chong/LeiChongYouLi/LeiChongYouLiCtrl';
import { ShouChongDingZhiData } from 'modules/lei_chong/ShouChongDingZhi/ShouChongDingZhiCtrl';
import { TianXuanZhiLiData } from 'modules/lei_chong/TianXuanZhiLi/TianXuanZhiLiCtrl';
import { LevelFundData } from 'modules/levelfund/LevelFundData';
import { LuckyGiftData } from 'modules/LuckyGift.ts/LuckyGiftCtrl';
import { MonthlyCardData } from 'modules/MonthlyCard/MonthlyCardCtrl';
import { MoreServerActivityData } from 'modules/moreserveractive/MoreServerActivityData';
import { OpenServerData } from 'modules/open_server/OpenServerData';
import { ScoreFundData } from 'modules/ScoreFund/ScoreFundCtrl';
import { ServerActivityData } from 'modules/serveractivity/ServerActivityData';
import { TodayShareData } from 'modules/TodayShare/TodayShareCtrl';
import { WarOrderData } from 'modules/warOrder/WarOrderData';
import { ActivityData } from './ActivityData';
import { ACTIVITY_TYPE } from './ActivityEnum';
import { ActivityRandData } from './ActivityRandData';

export class ActivityCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCActivityStatus, func: this.recvActivityStatus },
        ]
    }

    initCtrl() {
        this.OnInits();
    }

    private recvActivityStatus(data: PB_SCActivityStatus) {
        ActivityData.Inst().SetActivityStatus(data);
    }

    public SendAngelReq(activity_type: ACTIVITY_TYPE, operaType?: number, param1?: number, param2?: number, param3?: number,) {
        let protocol = this.GetProtocol(PB_CSRandActivityOperaReq);
        protocol.randActivityType = activity_type;
        protocol.operaType = operaType;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        protocol.param3 = param3 ?? 0;
        this.SendToServer(protocol);
    }


    /**
     * 随机活动图标开关注册监听
     */
    private OnInits() {
        //宝箱基金
        ActivityRandData.Inst().Register(Mod.ServerActivity.BoxFund, () => {
            return BoxFundData.Inst().GetIsActiveOver();
        }, BoxFundData.Inst().BoxFundSmartData)
        //等级基金
        ActivityRandData.Inst().Register(Mod.ServerActivity.LevelFund, () => {
            return LevelFundData.Inst().GetIsActiveOver();
        }, LevelFundData.Inst().LevelFundSmartData)
        //首充
        ActivityRandData.Inst().Register(Mod.FirstCharge.View, () => {
            return FirstChargeData.Inst().IsFirstActShow();
        }, FirstChargeData.Inst().ResultData)
        //累充有礼
        ActivityRandData.Inst().Register(Mod.LeiChong.LeiChongYouLi, () => {
            return LeiChongYouLiData.Inst().IsLeiChongActShow();
        }, LeiChongYouLiData.Inst().ResultData)
        //累充
        ActivityRandData.Inst().Register(Mod.LeiChong.View, () => {
            return LeiChongData.Inst().GetLeiChongIsOPen();
        })
        //幸运礼遇
        ActivityRandData.Inst().Register(Mod.LuckyGift.View, () => {
            return LuckyGiftData.Inst().IsLuckyGiftShow();
        }, LuckyGiftData.Inst().ResultData)
        ActivityRandData.Inst().RegisterCountDown(Mod.LuckyGift.View,()=>{
            return LuckyGiftData.Inst().ActTimeShow();
        })
        //邀请好友
        ActivityRandData.Inst().Register(Mod.ServerActivity.InviteFriend, () => {
            return InviteFriendData.Inst().GetInviteIsClose();
        }, InviteFriendData.Inst().ResultData)
        //更多活动
        ActivityRandData.Inst().Register(Mod.MoreServer.view, () => {
            return MoreServerActivityData.Inst().GetMoreServerIsOPen();
        }, MoreServerActivityData.Inst().ResultData)
        //活动
        ActivityRandData.Inst().Register(Mod.ServerActivity.view, () => {
            return ServerActivityData.Inst().GetServerIsOPen();
        })
        // 开服狂欢
        ActivityRandData.Inst().Register(Mod.OpenServer.View, () => {
            return OpenServerData.Inst().GetOpenServerIsOpen();
        }, OpenServerData.Inst().flush_info)
        // 日常礼包
        ActivityRandData.Inst().Register(Mod.ServerActivity.DailyGift, () => {
            return DailyGiftData.Inst().IsDailyGidtOpen();
        }, DailyGiftData.Inst().ResultData)
        // 月卡
        ActivityRandData.Inst().Register(Mod.ServerActivity.MonthlyCard, () => {
            return MonthlyCardData.Inst().IsDailyGidtOpen();
        }, MonthlyCardData.Inst().ResultData)
        // // 评分基金
        // ActivityRandData.Inst().Register(Mod.ServerActivity.ScoreFund, () => {
        //     return ScoreFundData.Inst().IsScoreFundOpen();
        // }, ScoreFundData.Inst().ResultData)
        // 无限战令
        ActivityRandData.Inst().Register(Mod.ServerActivity.WarOrder, () => {
            return WarOrderData.Inst().GetIsActiveOver();
        }, WarOrderData.Inst().WarOrderSmartData)
        // 连充赠礼
        ActivityRandData.Inst().Register(Mod.LeiChong.LianChongZengLi, () => {
            return ContinuePresentData.Inst().GetIsOpen();
        }, ContinuePresentData.Inst().flush_info)
        // 今日分享
        ActivityRandData.Inst().Register(Mod.ServerActivity.TodayShare, () => {
            return TodayShareData.Inst().GetIsOpen();
        }, TodayShareData.Inst().flush_info)
        //天选之礼
        ActivityRandData.Inst().Register(Mod.LeiChong.TianXuanZhiLi, () => {
            return TianXuanZhiLiData.Inst().IsTianXuanActShow();
        },TianXuanZhiLiData.Inst().ResultData);
        //首充定制
        ActivityRandData.Inst().Register(Mod.LeiChong.ShouChongDingZhi, () => {
            return ShouChongDingZhiData.Inst().IsDingZhiActShow();
        },ShouChongDingZhiData.Inst().ResultData);
        //专属礼包
        ActivityRandData.Inst().Register(Mod.ExclusiveGiftBag.View, () => {
            return ExclusiveGiftBagData.Inst().IsGiftBagActShow();
        }, ExclusiveGiftBagData.Inst().ResultData);
        ActivityRandData.Inst().RegisterCountDown(Mod.ExclusiveGiftBag.View,()=>{
            return ExclusiveGiftBagData.Inst().ActTimeShow();
        })
    }
}