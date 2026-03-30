
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { ShopView } from "modules/shop/ShopView";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { ContinuePresentData } from "./ContinuePresentCtrl";
import { ContinuePresentPreView } from "./ContinuePresentPreView";

export class ContinuePresentView extends fgui.GComponent {
    private viewNode = {
        bg:<EGLoader> null,
        list: <fgui.GList>null,
        BtnPreView: <CommonButtonBuy>null,
        BtnInvitation: <CommonButtonBuy>null,
        BtnCharge: <fgui.GButton>null,
        ItemCell: <ItemCell>null,
        prog_text: <fgui.GLabel>null,
        task_info: <fgui.GLabel>null,
        EffStar: <UIEffectShow>null,
        EffItem: <UIEffectShow>null,
    }
    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    protected onDestroy(): void {
        super.onDestroy();

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    public InitData() {
        this.viewNode.list.setVirtual();
        this.viewNode.bg.SetIcon("loader/lei_chong/LianChongBg", () => { })
        this.viewNode.BtnPreView.onClick(this.OnClickPreView.bind(this));
        this.viewNode.BtnInvitation.onClick(this.OnClickInvitation.bind(this));
        this.viewNode.BtnCharge.onClick(this.OnClickCharge.bind(this));
        this.addSmartDataCare(ContinuePresentData.Inst().flush_info, this.flushinfo.bind(this));

        this.viewNode.EffStar.PlayEff(4164095);
        this.viewNode.EffItem.PlayEff(4164101);

        this.flushinfo()
    }

    public InitUI() {
    }

    public OnShow()
    {

    }
    public OnHide() {}
    public flushinfo() {
        let param = ContinuePresentData.Inst().GetDetail()
        this.viewNode.list.SetData(param.gift_list)
        this.viewNode.ItemCell.SetData(Item.Create(param.item_data,{is_click:true,is_num:true}))
        UH.SetText(this.viewNode.prog_text,param.progress)
        UH.SetText(this.viewNode.task_info,param.count_desc)
    }
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    private OnClickPreView(){
        ViewManager.Inst().OpenView(ContinuePresentPreView);
    }

    private OnClickInvitation() {
        ChannelAgent.Inst().OnMessage(GameToChannel.arouseShare,"")
    }
    
    private OnClickCharge() {
        ViewManager.Inst().OpenViewByKey(Mod.Shop.DiamondShop);
    }
}

export class ContinuePresentCell extends fgui.GComponent {
    private viewNode = {
        DayShow : <fgui.GLabel>null,
        RewardList: <fgui.GList>null,
        Condition: <fgui.GLabel>null,
        BestReward : <fgui.GImage>null,
        ShowGot : <fgui.GImage>null,
        BtnGet: <CommonButtonBuy>null,
        BtnGo: <CommonButtonBuy>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
        this.viewNode.BtnGo.onClick(this.OnClickGo.bind(this));

        this.viewNode.BtnGet.playEffect(4164096)
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data    

        let list = []
        let oper_list = (data.is_big ? data.reward1_item : data.reward2_item)
        for (var index in oper_list) {
            let item_c = Item.Create(oper_list[index], { is_click: true, is_num: true })
            list.push(item_c)
        }
        this.viewNode.RewardList.SetData(list)

        UH.SetText(this.viewNode.DayShow,TextHelper.Format(Language.ContinuePresent.DayShow,data.day))
        UH.SetText(this.viewNode.Condition,data.task_desc)
        // this.viewNode.Condition.visible = !data.complete
        this.viewNode.BestReward.visible = data.is_big

        this.viewNode.BtnGet.visible = !data.done && data.complete
        this.viewNode.BtnGo.visible = !data.done && !data.complete
        this.viewNode.ShowGot.visible = data.done

    }
    private OnClickGet() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.LianChongZengLi,1,this.data.day)
    }

    private OnClickGo() {
        PublicPopupCtrl.Inst().Center(Language.ContinuePresent.UnCompleteTips)
    }
}