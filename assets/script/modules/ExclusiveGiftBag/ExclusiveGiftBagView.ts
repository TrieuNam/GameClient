import * as fgui from "fairygui-cc";
import { ViewMask, BaseView, ViewLayer } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { ViewManager } from "manager/ViewManager";
import { ItemCell } from "modules/extends/ItemCell";
import { Item } from "modules/bag/ItemData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { ExclusiveGiftBagData } from "./ExclusiveGiftBagData";
import { BaseItem } from "modules/common/BaseItem";
import { LogError } from "core/Debugger";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { ACTIVITY_ENTER_TYPE, ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { tween, Vec3 } from "cc";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { CfgActivityRand } from "config/CfgActivity";
import { ActivityData } from "modules/activity/ActivityData";

@BaseView.registView
export class ExclusiveGiftBagView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "ExclusiveGiftBag",
        ViewName: "ExclusiveGiftBagView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };

    protected viewNode = {
        Purchase: <fgui.GTextField>null,
        Price: <fgui.GTextField>null,
        list: <fgui.GList>null,
        BtnBuy: <CommonButtonBuy>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,
        EffShowBox: <UIEffectShow>null,
        EffShowBtn: <UIEffectShow>null,
    };

    protected extendsCfg = [
        { ResName: "ExclusiveItem", ExtendsClass: ExclusiveItem }
    ];

    private common_list: any
    private index: number = 0;

    InitData(index: number) {
        this.AddSmartDataCare(ExclusiveGiftBagData.Inst().result_data, this.FlushData.bind(this), "ExclusiveInfoFlush");

        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.list.setVirtual();

        this.FlushData();
        this.SetSelect();
    }
    InitUI() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        this.viewNode.BtnLeft.onClick(this.OnClickDir.bind(this, -1));
        this.viewNode.BtnRight.onClick(this.OnClickDir.bind(this, 1));
        this.viewNode.BtnBuy.onClick(this.OnClickBuy.bind(this));

        this.viewNode.EffShowBox.PlayEff(4164146);
        this.viewNode.EffShowBtn.PlayEff(4164144);
    }

    private GiftInfo() {
        let Giftdata = ExclusiveGiftBagData.Inst();
        let info = Giftdata.getGiftBagData(this.index);
        let config = Giftdata.getGiftBagConfig(info.seq);

        this.common_list = config.reward_item;

        let num = config.limit_num - info.alreadyBuyTimes;
        UH.SetText(this.viewNode.Purchase, TextHelper.Format(Language.ExclusiveGift.Purchase, num, config.value));
        UH.SetText(this.viewNode.Price, TextHelper.Format(Language.ExclusiveGift.Price, config.buy_money));

        this.FluhShowList();
        this.aroundBtnShow();
    }

    CloseCallBack() {
        ActivityData.Inst().CheckRandOpenData();
    }

    //左右按钮显示
    private aroundBtnShow() {
        let num = ExclusiveGiftBagData.Inst().getGiftBagNum();
        this.viewNode.BtnLeft.visible = this.index != 0;
        this.viewNode.BtnRight.visible = this.index != num - 1;
    }

    private FluhShowList() {
        this.viewNode.list.numItems = this.common_list.length;
    }

    private FlushData() {
        let num = ExclusiveGiftBagData.Inst().getGiftBagNum();
        if (num == 0) {
            ViewManager.Inst().CloseView(ExclusiveGiftBagView);
            ActivityData.Inst().CheckRandOpenData();
            return;
        }
        this.GiftInfo();
    }

    private renderListItem(index: number, item: ExclusiveItem) {
        item.SetData(this.common_list[index]);
    }



    private OnClickBuy() {
        let Giftdata = ExclusiveGiftBagData.Inst();
        let info = Giftdata.getGiftBagData(this.index);
        if (info.endTimestamp < Math.floor(TimeCtrl.Inst().ServerTime)) {
            this.FlushData();//礼包时间已结束
            return;
        }
        let config = Giftdata.getGiftBagConfig(info.seq);

        let order_data = Order_Data.initOrder(config.type, ACTIVITY_TYPE.ZhuanShuLiBaoRuKou, config.buy_money, config.recharge_equal_diamond_num, "");
        OrderCtrl.generateOrder(order_data);
        this.index = 0;
    }

    private OnClickDir(dir: number) {
        this.index += dir;
        this.GiftInfo();
    }

    private CloseView() {
        let rand_list = ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.Right);
        rand_list.sort(
            (a: CfgActivityRand, b: CfgActivityRand) => {
                return a.seq - b.seq;
            }
        )
        let index = -1;
        for (let i = 0; i < rand_list.length; i++) {
            if (rand_list[i].act_type == ACTIVITY_TYPE.ZhuanShuLiBaoRuKou) {
                index = i;
                break;
            }
        }
        let close_func = () => {
            ViewManager.Inst().CloseView(ExclusiveGiftBagView);
        }
        if (index == -1) {
            close_func();
        } else {
            this.view.pivotX = 0.5
            this.view.pivotY = 0.5
            this.view.node.scale = new Vec3(0.9, 0.9, 0);
            let start_real_x = this.view.node.position.x;
            let start_real_y = this.view.node.position.y;
            let offsetX = 40;
            let offsetY = -40;
            let end_x = 680 + offsetX;// 800 - (50 + index * 110) + offsetX;
            let end_y = -905 - index * 120 + offsetY;  //-905 + offsetY;;// -150 + offsetY;

            let start_x = 400;
            let start_y = -750;

            let dis_x = end_x - start_x
            let dis_y = end_y - start_y

            fgui.GTween.to(start_x, end_x, 0.3)
                .setEase(fgui.EaseType.Linear)
                .onUpdate((tweener: fgui.GTweener) => {
                    let bili = +((tweener.value.x - start_x) / dis_x).toFixed(2)
                    this.view.node.scale = new Vec3(1 - bili, 1 - bili, 0);
                    let x = start_real_x + bili * dis_x
                    let y = start_real_y + bili * dis_y;
                    this.view.node.position = new Vec3(x, y, 0);
                }).onComplete(() => {
                    close_func();
                })
        }
    }

    public SetSelect() {
        ExclusiveGiftBagData.Inst().ClearFirstRemind();
    }

}

export class ExclusiveItem extends BaseItem {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Cell: <ItemCell>null,
    };
    public SetData(data: any) {
        this.data = data;

        let item_call = Item.Create(data, { is_click: true, is_num: true });
        this.viewNode.Cell.SetData(item_call);

        UH.SetText(this.viewNode.Name, Item.GetName(this.data.item_id));
    }
}
