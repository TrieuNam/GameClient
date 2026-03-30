import { CfgDuoBaoData } from 'config/CfgDuobao';
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from 'modules/bag/BagData';
import { Item } from 'modules/bag/ItemData';
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from 'modules/common/CommonEnum';
import { Language } from 'modules/common/Language';
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from 'modules/common_button/CommonButtonBuy';
import { ItemCell } from 'modules/extends/ItemCell';
import { RedPoint } from 'modules/extends/RedPoint';
import { TimeFormatType, TimeMeter } from 'modules/extends/TimeMeter';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { ItemInfoView } from 'modules/item_info/ItemInfoView';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { Timer } from 'modules/time/Timer';
import { TextHelper } from '../../helpers/TextHelper';
import { UH } from '../../helpers/UIHelper';
import { DUO_BAO_REQ_TYPE, LoopMineCtrl } from './LoopMineCtrl';
import { LoopMineData } from './LoopMineData';
import { LoopMineRecordView } from './LoopMineRecordView';
import { LoopMineResult } from './LoopMineResult';

@BaseView.registView
export class LoopMineView extends BaseView {
    private Controller: fgui.Controller
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "LoopMine",
        ViewName: "LoopMineView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        TagList: <fgui.GList>null,
        ProgressList: <fgui.GList>null,
        ProgressShow: <fgui.GProgressBar>null,
        CurLucky: <fgui.GLabel>null,
        BtnFlush: <fgui.GButton>null,
        timer: <TimeMeter>null,
        BtnOne: <fgui.GButton>null,
        BtnTen: <CommonButtonBuy>null,
        CostIOneCost: <fgui.GLabel>null,
        CostITenCost: <fgui.GLabel>null,
        CostOneIcon: <fgui.GLoader>null,
        CostTenIcon: <fgui.GLoader>null,
        HighLoopPart: <DuoBanDrawPlayer>null,
        BaseLoopPart: <DuoBanDrawPlayer>null,
        BtnRecord: <fgui.GButton>null,
        Block: <fgui.GGraph>null,
        OneRedPoint: <RedPoint>null,
        TenRedPoint: <RedPoint>null,
        ProgressLastItem: <DuoBaoProgressItem>null,
        JumpToggle: <fgui.GButton>null,
    }
    protected extendsCfg = [
        { ResName: "TypeBtn", ExtendsClass: DuoBaoTypeBtn },
        { ResName: "ProgressItem", ExtendsClass: DuoBaoProgressItem },
        { ResName: "HighLoop", ExtendsClass: DuoBanDrawPlayer },
        { ResName: "BaseLoop", ExtendsClass: DuoBanDrawPlayer },
        { ResName: "BaseLoopItem", ExtendsClass: DuoBaoLoopItem },
        { ResName: "HighLoopItem", ExtendsClass: DuoBaoLoopItem },
    ];

    protected TagCfg = [
        { name: Language.LoopMine.TagName[0], type: 0 },
        { name: Language.LoopMine.TagName[1], type: 1 },
    ];

    private show_type: number
    private cache_timer: number
    private cache_one_flag: boolean
    private cache_ten_flag: boolean
    public draw_mark: boolean
    InitData() {
        LoopMineData.Inst().SetLoopMineView(this)
        this.viewNode.Board.SetData(new BoardData(LoopMineView, Language.LoopMine.Title, 7))

        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM, this.OnClickTag, this);
        this.viewNode.TagList.SetData(this.TagCfg);
        this.show_type = this.TagCfg[0].type
        this.viewNode.TagList.selectedIndex = this.TagCfg[0].type

        this.viewNode.ProgressList.on(fgui.Event.CLICK_ITEM, this.OnClickProgress, this);

        this.viewNode.ProgressLastItem.onClick(this.OnClickProgress.bind(this, this.viewNode.ProgressLastItem));

        this.viewNode.BtnRecord.onClick(this.OnClickRecord.bind(this));
        this.viewNode.BtnFlush.onClick(this.OnClickFlush.bind(this));
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this));

        this.viewNode.BtnOne.onClick(this.OnClickOne.bind(this));
        this.viewNode.BtnTen.onClick(this.OnClickTen.bind(this));
        this.viewNode.JumpToggle.onClick(this.OnClickJump.bind(this));

        this.Controller = this.view.getController("Type");
        this.Controller.selectedIndex = 0
        this.AddSmartDataCare(LoopMineData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        // this.draw_mark = false

        this.flushInfoPanel()
    }

    private flushInfoPanel() {

        let prog_param = LoopMineData.Inst().GetLuckProgress(this.show_type)
        this.viewNode.ProgressShow.max = prog_param.p_max
        this.viewNode.ProgressShow.value = prog_param.p_value
        let item_list = []
        for (let i = 0; i < prog_param.prog_list.length - 1; i++) {
            item_list.push(prog_param.prog_list[i])
        }
        this.viewNode.ProgressList.SetData(item_list)
        this.viewNode.ProgressLastItem.SetData(prog_param.prog_list[prog_param.prog_list.length - 1])

        UH.SetText(this.viewNode.CurLucky, prog_param.prog_num)

        this.viewNode.BtnFlush.touchable = prog_param.free_refresh_num > 0
        if (prog_param.free_refresh_num == 0) {
            this.viewNode.BtnFlush.grayed = true
            this.cache_timer = prog_param.free_refresh_time
        } else {
            this.viewNode.BtnFlush.grayed = false
            this.cache_timer = 0
        }

        this.FlushFlushTime()
        let oper_part = this.show_type == 0 ? this.viewNode.BaseLoopPart : this.viewNode.HighLoopPart

        let flush_param = LoopMineData.Inst().GetLoopParam(this.show_type)
        if (!LoopMineData.Inst().IsLoopMark()) {
            oper_part.PlayData(flush_param)
        }
        else {
            oper_part.SetData(flush_param)
        }
        let surplus = 0;
        for (let i = 0; i < flush_param.itemlist.length; i++) {
            surplus += flush_param.itemlist[i].last_time;
        }
        let Num = surplus < 10 ? surplus : 10;
        let btnTitle = TextHelper.Format(Language.LoopMine.BtnTitle, Num);
        this.viewNode.BtnTen.SetTitle(btnTitle);

        let item_param = LoopMineData.Inst().GetItemParam(this.show_type, Num)
        UH.SetIcon(this.viewNode.CostOneIcon, item_param.item_id, ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.CostTenIcon, item_param.item_id, ICON_TYPE.ITEM);
        this.viewNode.BtnOne.grayed = !item_param.flag_one
        this.viewNode.BtnTen.grayed = !item_param.flag_ten

        this.cache_one_flag = item_param.flag_one
        this.cache_ten_flag = item_param.flag_ten

        this.viewNode.OneRedPoint.SetNum(item_param.flag_one ? 1 : 0)
        this.viewNode.TenRedPoint.SetNum(item_param.flag_ten ? 1 : 0)

        UH.SetText(this.viewNode.CostIOneCost, item_param.one_str)
        UH.SetText(this.viewNode.CostITenCost, item_param.ten_str)

        this.viewNode.HighLoopPart.visible = this.show_type == 1
        this.viewNode.BaseLoopPart.visible = this.show_type == 0


        this.viewNode.TagList.SetData(this.TagCfg);


        this.viewNode.JumpToggle.selected = LoopMineData.Inst().GetJumpPlay()
    }

    private OnClickJump() {
        LoopMineData.Inst().SetJumpPlay(this.viewNode.JumpToggle.selected)
    }

    private OnClickTag(item: DuoBaoTypeBtn) {
        this.show_type = item.data.type
        this.viewNode.TagList.selectedIndex = item.data.type


        this.Controller.selectedIndex = item.data.type
        this.flushInfoPanel()
    }

    private OnClickFlush() {
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.REFRESH, { param1: this.show_type, param2: 0 })
    }

    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_0);
    }

    private OnClickOne() {
        let item_param = LoopMineData.Inst().GetItemParam(this.show_type)

        if (!this.cache_one_flag) {
            PublicPopupCtrl.Inst().Center(Language.LoopMine.ItemLackError);
            let show_call = Item.Create({ item_id: item_param.item_id, num: 1 })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }
        if (!LoopMineData.Inst().WithDrawTime(this.show_type)) {
            PublicPopupCtrl.Inst().Center(Language.LoopMine.NeedReflush);
            return
        }

        // this.draw_mark = true
        LoopMineData.Inst().SetLoopMark(this.show_type, 1)
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.DRAW, { param1: this.show_type, param2: 1 })
    }
    private OnClickTen() {
        let item_param = LoopMineData.Inst().GetItemParam(this.show_type)

        if (!this.cache_ten_flag) {
            PublicPopupCtrl.Inst().Center(Language.LoopMine.ItemLackError);
            let show_call = Item.Create({ item_id: item_param.item_id, num: 1 })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }
        if (!LoopMineData.Inst().WithDrawTime(this.show_type)) {
            PublicPopupCtrl.Inst().Center(Language.LoopMine.NeedReflush);
            return
        }
        let flush_param = LoopMineData.Inst().GetLoopParam(this.show_type)
        let surplus = 0;
        for (let i = 0; i < flush_param.itemlist.length; i++) {
            surplus += flush_param.itemlist[i].last_time;
        }
        let Num = surplus < 10 ? surplus : 10;
        // this.draw_mark = true
        LoopMineData.Inst().SetLoopMark(this.show_type, Num)
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.DRAW, { param1: this.show_type, param2: Num })
    }

    private OnClickProgress(item: DuoBaoProgressItem) {
        if (item.data.got_flag) {
            PublicPopupCtrl.Inst().Center(Language.LoopMine.RewardGot)
            return
        }

        if (!item.data.got_flag && this.viewNode.ProgressShow.value < item.data.integral) {
            let show_call = Item.Create({ item_id: item.data.item.item_id, num: item.data.item.num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            // PublicPopupCtrl.Inst().Center(Language.LoopMine.RewardLackNum)
            return
        }

        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.FETCH, { param1: this.show_type, param2: item.data.level })
    }

    private OnClickRecord() {
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.RECORD_INFO, { param1: this.show_type, param2: 0 })

        ViewManager.Inst().OpenView(LoopMineRecordView, { show_type: this.show_type });
    }

    CloseCallBack() {
        this.viewNode.HighLoopPart.CloseCallBack()
        this.viewNode.BaseLoopPart.CloseCallBack()
        GuideCtrl.Inst().ForceStop();
    }
}

export class DuoBaoTypeBtn extends fgui.GButton {
    private viewNode = {
        Name: <fgui.GLabel>null,
        SelectName: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data;
        UH.SetText(this.viewNode.Name, data.name);
        UH.SetText(this.viewNode.SelectName, data.name);

        if (data.name == Language.LoopMine.TagName[1]) {
            GuideCtrl.Inst().AddGuideUi("LoopMineBtnSeniorType", this);
        }

        if (data.type == 1) {
            let num = BagData.Inst().getItemNum(CfgDuoBaoData.other[0].gaoji_id)
            this.viewNode.RedPoint.SetNum(num > 0 ? 1 : 0)
        }
        else {
            let num = BagData.Inst().getItemNum(CfgDuoBaoData.other[0].chuji_id)
            this.viewNode.RedPoint.SetNum(num > 0 ? 1 : 0)
        }
    }

    onDestroy() {
        GuideCtrl.Inst().ClearGuideUi("LoopMineBtnSeniorType");
        super.onDestroy();
    }
}

export class DuoBaoProgressItem extends fgui.GButton {
    private viewNode = {
        pro_num: <fgui.GLabel>null,
        ItemCall: <ItemCell>null,
        Got: <fgui.GImage>null,
        RedPoint: <RedPoint>null,
        item_num: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data;
        UH.SetText(this.viewNode.pro_num, data.integral);
        this.viewNode.Got.visible = data.got_flag
        UH.SetText(this.viewNode.item_num, data.item.num);

        this.viewNode.ItemCall.SetData(Item.Create(
            { item_id: data.item.item_id, num: data.item.num },
            { is_num: false, is_click: false, eff: -1 }
        ))

        let flag = LoopMineData.Inst().GetLoopMineView().viewNode.ProgressShow.value >= data.integral && !data.got_flag
        this.viewNode.RedPoint.SetNum(flag ? 1 : 0)
    }
}
export class DuoBaoLoopItem extends fgui.GComponent {
    private viewNode = {
        selected: <fgui.GImage>null,
        ItemCall: <ItemCell>null,
        TimerShow: <fgui.GLabel>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return; }
        this.viewNode.ItemCall.SetData(Item.Create(
            { item_id: data.item.item_id, num: data.item.num },
            { is_num: true, is_click: true }
        ))

        UH.SetText(this.viewNode.TimerShow, TextHelper.Format(Language.LoopMine.ItemLast, data.last_time));
    }

    public SetSelected(flag: boolean) { this.viewNode.selected.visible = flag }
    public ShowTimes(flag: boolean) { this.viewNode.TimerShow.visible = flag }

}
export class DuoBanDrawPlayer extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        Node_0: <DuoBaoLoopItem>null,
        Node_1: <DuoBaoLoopItem>null,
        Node_2: <DuoBaoLoopItem>null,
        Node_3: <DuoBaoLoopItem>null,
        Node_4: <DuoBaoLoopItem>null,
        Node_5: <DuoBaoLoopItem>null,
        Node_6: <DuoBaoLoopItem>null,
        Node_7: <DuoBaoLoopItem>null,
        NodeLine: <fgui.GImage>null,
    }
    private time_timer: any
    private time_index: any
    private time_step = 1
    private play_list: any
    private mark_data: any
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.ClearSelect()
    }

    CloseCallBack(): void {
        Timer.Inst().CancelTimer(this.time_timer)
    }
    // setData 操作用于对界面数据刷新
    public SetData(data: any) {
        if (data == null) { return; }

        this.ShowAllNumber(true)
        for (let i = 0; i < 8; i++) {
            this.viewNode["Node_" + i].SetData(data.itemlist[i])
        }
    }

    // PlayData 操作用于演出并在演出完成后刷新数据
    public PlayData(data: any) {
        Timer.Inst().CancelTimer(this.time_timer)
        this.ClearSelect()
        this.ShowAllNumber(false)
        this.time_index = 0

        this.mark_data = data
        if (LoopMineData.Inst().GetJumpPlay()) {
            this.completeCallBack()
        }
        else {
            LoopMineData.Inst().GetLoopMineView().viewNode.Block.touchable = true
            LoopMineData.Inst().GetLoopMineView().viewNode.Block.visible = true
            // LogError("?asdasdf",this.time_step,data.play_list.length * this.time_step)
            this.time_timer = Timer.Inst().AddRunFrameTimer(
                this.updateTime.bind(this), // this.completeCallBack.bind(this),
                this.time_step, data.play_list.length - 1 * this.time_step);
            // 
        }

    }

    private updateTime() {
        this.SelectNode(this.mark_data.play_list[this.time_index])
        this.time_index = this.time_index + 1
        if (this.mark_data.play_list.length == this.time_index) {
            this.completeCallBack()
        }
    }

    private completeCallBack() {
        this.SetData(this.mark_data)

        LoopMineData.Inst().GetLoopMineView().viewNode.Block.touchable = false
        LoopMineData.Inst().GetLoopMineView().viewNode.Block.visible = false
        LoopMineData.Inst().ClearLoopMark()
        let info = {
            show_type: this.mark_data.show_type,
            reward: LoopMineData.Inst().GetMarkItemNotice().reward_data
        }
        ViewManager.Inst().OpenView(LoopMineResult, info)
        // LoopMineData.Inst().GetLoopMineView().draw_mark = false
    }

    public ShowAllNumber(flag: boolean) {
        for (let i = 0; i < 8; i++) {
            this.viewNode["Node_" + i].ShowTimes(flag)
        }
    }

    public ClearSelect() {
        for (let i = 0; i < 8; i++) {
            this.viewNode["Node_" + i].SetSelected(false)
        }
        this.viewNode.NodeLine.rotation = 0
        // this.viewNode.NodeLine.visible = false
    }

    public SelectNode(index: number) {
        for (let i = 0; i < 8; i++) {
            this.viewNode["Node_" + i].SetSelected(index == i)
        }
        // this.viewNode.NodeLine.visible = true
        this.viewNode.NodeLine.rotation = index * 45
    }

}
