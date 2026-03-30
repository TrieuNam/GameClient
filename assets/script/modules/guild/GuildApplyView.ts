
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from 'modules/common_board/CommonBoard2';
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildApplyView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildApply",
        ViewName: "GuildApplyView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: GuildApplyViewShowItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildApplyView));

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushAppList.bind(this), "AppList");
    }

    InitUI() {
        this.FlushAppList()
    }

    FlushAppList() {
        let list = GuildData.Inst().GetGuildApplyListShow()
        this.viewNode.ShowList.SetData(list)
    }
}

class GuildApplyViewShowItem extends BaseItem {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        IdShow: <fgui.GTextField>null,
        AvatarShow: <AvatarCell>null,
        BtnAgree: <fgui.GButton>null,
        BtnRefuse: <fgui.GButton>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnAgree.onClick(this.OnClickAgree, this);
        this.viewNode.BtnRefuse.onClick(this.OnClickRefuse, this);
    }

    public SetData(data: IPB_RoleInfo) {
        super.SetData(data);

        this.viewNode.AvatarShow.SetData(new AvatarData(data.headPicId, data.level, data.headChar))
        UH.SetText(this.viewNode.NameShow, DataHelper.BytesToString(data.name))
        UH.SetText(this.viewNode.IdShow, TextHelper.Format(Language.Guild.IdShow, data.roleId))
    }

    OnClickAgree() {
        GuildCtrl.Inst().SendGuildReqApplyGuild(this._data.roleId, true)
    }

    OnClickRefuse() {
        GuildCtrl.Inst().SendGuildReqApplyGuild(this._data.roleId, false)
    }
}

