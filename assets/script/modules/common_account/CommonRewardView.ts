import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonGetView2 } from "modules/CommonGet2/CommonGetView2";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { GET_TYPE, NeedCheckAdCard } from "modules/bag/BagEnum";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { ItemCell, ItemCellBlock } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class CommonRewardView extends BaseView {
    private call_back: Function;
    private timer_handle: any = null;
    get_type = -1
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "CommonRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "CommonRewardCell", ExtendsClass: CommonRewardCell },
        { ResName: "CommonRewardCellBlock", ExtendsClass: CommonRewardCellBlock },
    ];

    protected viewNode = {
        ListReward: <fgui.GList>null,
        TxtTimer: <TimeMeter>null,
    }

    InitData(param?: { reward_data: IPB_ItemData[], call_back?: Function, get_type?: GET_TYPE }) {
        this.call_back = param.call_back;
        this.get_type = param.get_type ?? -1
        this.viewNode.ListReward.itemProvider = GET_TYPE.PUT_REASON_CUSTOM_BLOCK == this.get_type ? this.GetListItemResourceBlock.bind(this) : this.GetListItemResourceCommon.bind(this);
        this.showList = param.reward_data
        this.viewNode.ListReward.visible = false
        this.viewNode.ListReward.SetData(this.showList);

        this.viewNode.TxtTimer.SetCallBack(this.closeview.bind(this));
        this.viewNode.TxtTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));
        Timer.Inst().CancelTimer(this.timer_handle)
        this.timer_handle = Timer.Inst().AddRunFrameTimer(() => {
            this.viewNode.ListReward.visible = true
        }, 3, 1, false)

    }

    InitUI() {
    }

    private showList: any[]

    private GetListItemResourceCommon(index: number) {
        return fgui.UIPackage.getItemURL("CommonAccount", "CommonRewardCell");
    }

    private GetListItemResourceBlock(index: number) {
        let data = this.showList[index];
        if (data.blockId) {
            return fgui.UIPackage.getItemURL("CommonAccount", "CommonRewardCellBlock");
        } else {
            return fgui.UIPackage.getItemURL("CommonAccount", "CommonRewardCell");
        }
    }

    private closeview() {
        if (ViewManager.Inst().IsOpen(CommonGetView2)) {
            this.viewNode.ListReward.scrollPane.cancelDragging()
            return;
        }
        this.viewNode.ListReward.scrollPane.cancelDragging()
        ViewManager.Inst().CloseView(CommonRewardView)
    }

    CloseCallBack(): void {
        this.call_back && this.call_back();
        Timer.Inst().CancelTimer(this.timer_handle)
        if (NeedCheckAdCard[this.get_type]) {
            RoleCtrl.Inst().checkAdCard()
        }
    }

    OpenCallBack() {
        AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
    }
}


export class CommonRewardCell extends fgui.GComponent {
    private viewNode = {
        Cell: <ItemCell>null,
        TxtName: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        this.viewNode.Cell.SetData(Item.Create(data, { is_gray: false, is_click: true, is_num: true, eff: 4164000 }));
        UH.SetText(this.viewNode.TxtName, Item.GetName(data.itemId))
    }
}

export class CommonRewardCellBlock extends fgui.GComponent {
    private viewNode = {
        Cell: <ItemCellBlock>null,
        TxtName: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        this.viewNode.Cell.SetData(data);
        UH.SetText(this.viewNode.TxtName, "")
    }
}

