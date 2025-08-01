
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { ViewLayer } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { InviteFriendCtrl } from "./InviteFriendCtrl";
import { InviteFriendData } from "./InviteFriendData";


export class InviteFriendView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "Serveractivity",
        ViewName: "InviteFriend",
        LayerType: ViewLayer.Normal,
    };
    private invite_list: any
    private handleCollector: HandleCollector;


    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        list: <fgui.GList>null,
        BtnInvite: <fgui.GButton>null,
    };
    protected extendsCfg = [
        { ResName: "InviteFriendItem", ExtendsClass: InviteFriendItem }
    ];
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // InviteFriendData.Inst().SendInviteAllInfo()
        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.list.setVirtual();
        this.addSmartDataCare(InviteFriendData.Inst().ResultData, this.FlushList.bind(this));
        this.viewNode.BtnInvite.onClick(this.OnClickInvite.bind(this))
        this.FlushList()
    };

    private OnClickInvite() {
        InviteFriendCtrl.Inst().InviteFriend();
    }
    
    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    /*
    
        InitData() {
            this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
            this.viewNode.list.setVirtual();
            this.FlushList()
        }
    
        InitUI() {
        }
    */

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    public FlushList() {
        this.invite_list = InviteFriendData.Inst().GetInviteList()
        this.viewNode.list.numItems = this.invite_list.length;

    }

    private renderListItem(index: number, item: InviteFriendItem) {
        item.SetData(this.invite_list[index]);
    }
}

export class InviteFriendItem extends fgui.GComponent {
    private viewNode = {
        Desc: <fgui.GRichTextField>null,
        BtnGet: <fgui.GButton>null,
        Cell: <ItemCell>null,
        BtnInvite: <fgui.GButton>null,
        HasGet: <fgui.GGroup>null,
        Pro: <fgui.GProgressBar>null,
        celleffect: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnInvite.onClick(this.OnClickInvite.bind(this))
        this.viewNode.BtnGet.onClick(this.OnClickGetReward.bind(this))
    }
    public SetData(data: any) {
        this.data = data
        UH.SetText(this.viewNode.Desc, TextHelper.Format(Language.InviteFriends.InviteDesc, data.invitation_friend_num))
        this.viewNode.Cell.SetData(Item.Create(data.reward_item, { is_num: true }));
        let jindu = InviteFriendData.Inst().GetInviteJindu()

        this.viewNode.Pro.max = data.invitation_friend_num
        this.viewNode.Pro.value = jindu > data.invitation_friend_num ? data.invitation_friend_num : jindu

        let is_get = InviteFriendData.Inst().GetInviteIsGet(data.type)
        this.viewNode.BtnGet.visible = jindu >= data.invitation_friend_num && !is_get
        this.viewNode.HasGet.visible = is_get
        this.viewNode.BtnInvite.visible = jindu < data.invitation_friend_num

        if (jindu >= data.invitation_friend_num && !is_get) {
            this.viewNode.celleffect.PlayEff(4164011)
        } else {
            this.viewNode.celleffect.StopEff(4164011)
        }
    }
    private OnClickInvite() {
        InviteFriendCtrl.Inst().InviteFriend();
    }
    private OnClickGetReward() {
        InviteFriendData.Inst().SendInviteGetReward(this.data.type)
    }
}