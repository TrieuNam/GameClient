// import { ErrorInfo } from 'config/CfgError';
// import { CfgLanguage } from 'config/CfgLanguage';
import { ErrorInfo } from 'config/CfgError';
import { CfgGetWayData } from 'config/CfgGetWay';
import { ViewManager } from 'manager/ViewManager';
import { Item } from 'modules/bag/ItemData';
// import { GetWayView } from 'modules/bag/GetWayView';
// import { Item } from 'modules/bag/ItemData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { CommonId } from 'modules/common/CommonEnum';
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { WaitView } from 'modules/login/WaitView';
import { FloatingTextDate } from 'modules/main/FloatingTextData';
import { TextHelper } from '../../helpers/TextHelper';
import { DialogTipsView } from './DialogTipsView';
import { DialogTipsTypes } from './PublicPopupData';
import { CommonRewardView } from 'modules/common_account/CommonRewardView';
import { CfgAttrUp } from 'config/CfgCommon';
import { AttrHelper } from '../../helpers/AttrHelper';
// import { RoleData } from 'modules/role/RoleData';
// import { TipsPopupView } from './TipsPopupView';

export class PublicPopupCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCNoticeNum, func: this.onSCNoticeNum },
            { msgType: PB_SCItemNotEnoughNotice, func: this.onSCItemNotEnoughNotice },
            // { msgType: PB_SCSystemMsg, func: this.onSCSystemMsg },
            // { msgType: PB_SCZeroHour, func: this.onSCZeroHou },
            // { msgType: PB_SCCMDChongZhiRetInfo, func: this.onSCCMDChongZhiRetInfo },
        ]
    }

    //系统通知
    private onSCNoticeNum(protocol: PB_SCNoticeNum) {
        this.Center(ErrorInfo[protocol.noticeNum] ?? `ErrorCode No Generate ` + protocol.noticeNum);
    }

    //物品不足通知
    private onSCItemNotEnoughNotice(data: { itemId: number }) {
        this.ItemNotEnoughNotice(data.itemId);
    }

    public ItemNotEnoughNotice(itemId: number) {
        let name = Item.GetName(itemId);
        let desc = name + Language.Common.NotHasTip;
        switch (itemId) {
            case CommonId.Gold:
                ViewManager.Inst().OpenViewByKey(Mod.Shop.GoldShop);
                this.Center(desc);
                break;
            case CommonId.Diamond:
                ViewManager.Inst().OpenViewByKey(Mod.Shop.DiamondShop);
                this.Center(desc);
                break;
            default:
                let co = Item.GetConfig(itemId);
                if (co && co.get_way != null && co.get_way != "") {
                    let get_way_id = +co.get_way.toString().split("|")[0];
                    for (let i = 0; i < CfgGetWayData.get_way.length; i++) {
                        let cfg = CfgGetWayData.get_way[i];
                        if (cfg.id == get_way_id) {
                            desc += TextHelper.Format(Language.Common.GetWayTip, cfg.desc);
                            break;
                        }
                    }
                }
                this.Center(desc);
                Item.OnItemInfo(Item.Create({ item_id: itemId }))
                break;
        }
    }

    //系统消息
    private onSCSystemMsg(protocol: PB_SCSystemMsg) {
        // if (RoleData.Inst().GetRoleLevel() < protocol.limitLevel) {
        //     return;
        // }
        console.error(protocol.msg);
    }
    //0点通知
    private onSCZeroHou(protocol: PB_SCZeroHour) {
    }
    //玩家充值返回
    private onSCCMDChongZhiRetInfo(protocol: PB_SCCMDChongZhiRetInfo) {
    }
    //弹出飘字
    public Center(str: string) {
        FloatingTextDate.Inst().AddFloatText({ desc: str });
    }

    public CenterAttr(str: string, arrow: number) {
        FloatingTextDate.Inst().AddFloatText({ desc: str, arrow: arrow });
    }

    public CenterAttr2(data:CfgAttrUp, arrow:number){
        let fuhao = arrow == 1 ? "+" : "-"
        this.CenterAttr(`${AttrListName[data.type]}  ${fuhao}${AttrHelper.Percent(data.type, data.add)}`, arrow)
    }

    public HelpTip(help_tip: number | string) {
        if (typeof (help_tip) == "number") {
            // let cfg = CfgLanguage.textdesc[help_tip];
            // if (cfg != undefined) {
            //     help_tip = cfg.desc;
            // } else {
            //     help_tip = help_tip.toString();
            // }
        }
        // ViewManager.Inst().OpenView(TipsPopupView, { desc: help_tip });
    }

    //弹出获取途径
    public GetWay(item_id: number) {
        // GetWayView.OpenWithItem(Item.Create({item_id:item_id}));
    }

    public ShowWait(desc: string) {
        FloatingTextDate.Inst().WaitDesc = desc;
        if (!ViewManager.Inst().IsOpen(WaitView)) {
            ViewManager.Inst().OpenView(WaitView);
        }
    }

    public HideWait() {
        ViewManager.Inst().CloseView(WaitView);
    }

    public DialogTips(desc: string, type: DialogTipsTypes, cb?: Function, not_tips?: boolean, confirmText?: string) {
        ViewManager.Inst().OpenView(DialogTipsView, { desc: desc, type: type, cb: cb, not_tips: not_tips, confirmText: confirmText })
    }

    /**奖励页面效果测试 */
    // public test() {
    //     ViewManager.Inst().OpenView(CommonRewardView, {
    //         reward_data: [{    /** PB_ItemData itemId */
    //             itemId: 40001,
    //             num: 100
    //         }], call_back: null, get_type: 0
    //     })
    // }
}