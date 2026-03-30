
import { GetCfgValue } from "config/CfgCommon";
import { CreateSMD, smartdata } from "data/SmartData";
import * as fgui from "fairygui-cc";
import { NetManager } from "manager/NetManager";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewMask } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { server_List_Info } from "preload/PkgData";
import { Base64 } from "../../helpers/Base64";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { Main } from "../../proload/Main";
import { LoginData } from "./LoginData";
import { LoginAckResult } from "./LoginView";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";


class ServerSelectViewData {
    @smartdata
    currentGroup: number; //当前选择服务器组
}

@BaseView.registView
export class ServerSelectView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "SelectServer",
        ViewName: "ServerSelectView",
        ViewMask: ViewMask.BgBlock,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        close: <fgui.GButton>null,
        grouplist: <fgui.GList>null,
        itemlist: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ItemServer", ExtendsClass: ServerSelectViewServerItem },
        { ResName: "ItemGroup", ExtendsClass: ServerSelectViewGroupItem },
    ];

    private serverSelectViewData: ServerSelectViewData;

    InitData() {
        this.viewNode.Board.SetData(new BoardData(ServerSelectView));

        let self = this;
        self.viewNode.grouplist.setVirtual();
        self.viewNode.grouplist.on(fgui.Event.CLICK_ITEM, self.onCliCKGroup, self);
        self.viewNode.grouplist.itemRenderer = self.renderGroupListItem.bind(self);
        // self.viewNode.close.onClick(self.onClickView.bind(self));

        self.viewNode.itemlist.setVirtual();
        self.viewNode.itemlist.on(fgui.Event.CLICK_ITEM, self.onCliCKItem, self);
        self.viewNode.itemlist.itemRenderer = self.renderListItem.bind(self);

        self.serverSelectViewData = CreateSMD(ServerSelectViewData);
        self.AddSmartDataCare(self.serverSelectViewData, self.freshItemList.bind(self), "currentGroup");
    }

    InitUI() {
        let self = this;
        let count = LoginData.Inst().GetServerGroupCount();
        self.viewNode.grouplist.numItems = count;
        self.viewNode.grouplist.selectedIndex = 0;
        self.serverSelectViewData.currentGroup = self.viewNode.grouplist.selectedIndex;
    }

    private onCliCKGroup(item: ServerSelectViewGroupItem) {
        this.serverSelectViewData.currentGroup = this.viewNode.grouplist.selectedIndex;
    }

    private renderGroupListItem(index: number, item: ServerSelectViewGroupItem) {
        if (index === 0) {
            item.SetData(Language.Login.RecentLogin)
        } else {
            let count = LoginData.Inst().GetServerGroupCount();
            index = count - index
            let start = (index - 1) * 10 + 1;
            let end = start + 9;
            let text = `${start}-${end}`;
            // item.title = TextHelper.Format(Language.Login.Group, text)
            item.SetData(TextHelper.Format(Language.Login.Group, text))
        }
    }

    private onCliCKItem(item: ServerSelectViewServerItem) {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10092, Report2Type.par_12());
        let old_server = LoginData.Inst().ResultData.currentId;
        let cur_server = item.GetServerId()
        if (LoginData.Inst().ResultData.result == LoginAckResult.LOGIN_RESULT_SUC) {
            if (cur_server != old_server) {
                // LoginData.Inst().ResultData.currentId = item.GetServerId()
                EventCtrl.Inst().emit(CommonEvent.NET_BEFORE_SWITCH);
                NetManager.Inst().NetNodeStateSwitch()
                Main.Inst().connect(cur_server);
            } else {
                PublicPopupCtrl.Inst().Center("已在当前服务器")
            }
        } else {
            LoginData.Inst().ResultData.currentId = cur_server;
        }
        ViewManager.Inst().CloseView(ServerSelectView);
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10093, Report2Type.par_12());
    }

    private renderListItem(index: number, item: ServerSelectViewServerItem) {
        let self = this;
        let list = LoginData.Inst().GetShowServerShowListByGroup(self.serverSelectViewData.currentGroup)
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (index === i) {
                item.SetData(element);
                break;
            }

        }
    }

    private freshItemList() {
        let self = this;
        let count = LoginData.Inst().GetShowServerShowListByGroup(self.serverSelectViewData.currentGroup).length;
        self.viewNode.itemlist.numItems = count;
    }

    private onClickView() {
        ViewManager.Inst().CloseView(ServerSelectView);
    }
}


//============================ServerSelectViewServerItem============================
export class ServerSelectViewServerItem extends fgui.GButton {
    private ServerItemConfig = {
        StateSp: {
            [0]: "WeiHu",
            [1]: "XinFu",
            [2]: "YongJi",
            [3]: "BaoManDi",
            [4]: "CeShi",
            [5]: "WeiHu",
        },
    }

    private viewNode = {
        title: <fgui.GTextField>null,
        RoleNameShow: <fgui.GTextField>null,
        MeObj: <fgui.GGroup>null,
        StateSp: <fgui.GLoader>null,
        StateShow: <fgui.GTextField>null,
    };

    private serverInfo: server_List_Info;
    private stateController: fgui.Controller;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
        this.stateController = this.getController("State");
    }

    public SetData(info: server_List_Info) {
        this.serverInfo = info;
        let role_info = LoginData.Inst().GetServerRoleInfoById(info.id);
        let has_role = !IsEmpty(role_info)
        let time_ago = has_role ? TimeHelper.Ago(role_info.last_login_time) : 0;
        UH.SpriteName(this.viewNode.StateSp, "SelectServer", GetCfgValue(this.ServerItemConfig.StateSp, info.flag));
        UH.SetText(this.viewNode.StateShow, GetCfgValue(Language.Login.StateShow, info.flag));
        this.viewNode.StateShow.color = (0 == info.flag || 5 == info.flag) ? COLORS.Gray2 : COLORS.Yellow8;
        UH.SetText(this.viewNode.title, has_role ? TextHelper.Format(Language.Login.SeverNameShow1, info.id, time_ago) : TextHelper.Format(Language.Login.SeverNameShow2, info.id));
        UH.SetText(this.viewNode.RoleNameShow, has_role ? TextHelper.Format(Language.Login.RoleNameShow, Base64.utf8_decode(role_info.role_name), has_role ? role_info.level : "") : Language.Login.NoRole)
        this.viewNode.MeObj.visible = has_role
    }

    public GetServerId() {
        return this.serverInfo.id;
    }
}

//============================ServerItem============================
export class ServerSelectViewGroupItem extends BaseItemGB {
    protected viewNode = {
        TitleShow1: <fgui.GTextField>null,
        TitleShow2: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.TitleShow1, data)
        UH.SetText(this.viewNode.TitleShow2, data)
    }

}
