
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from 'modules/common_board/CommonBoard2';
import { AvatarGuildCell, AvatarGuildData } from "modules/extends/AvatarCell";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildCreateView } from "./GuildCreateView";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";
import { GuildView } from "./GuildView";

@BaseView.registView
export class GuildJoinView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildJoin",
        ViewName: "GuildJoinView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        BtnCreate: <fgui.GButton>null,
        BtnFlush: <fgui.GButton>null,

        InputField: <fgui.GTextInput>null,
        InputTips: <fgui.GTextField>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: GuildJoinViewShowItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildJoinView));

        this.viewNode.BtnCreate.onClick(this.OnClickCreate, this);
        this.viewNode.BtnFlush.onClick(this.OnClickFlush, this);
        this.viewNode.ShowList.setVirtual()

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushList.bind(this), "SearchList");
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");

        this.viewNode.InputField.on(fgui.Event.TEXT_CHANGE, () => {
            this.viewNode.InputTips.visible = "" == this.viewNode.InputField.text
        })
    }

    InitUI() {
        this.FlushList()
    }

    FlushList() {
        this.viewNode.ShowList.SetData(GuildData.Inst().ResultData.SearchList.guildList)
    }

    FlushInfo() {
        ViewManager.Inst().CloseView(GuildJoinView)
        ViewManager.Inst().OpenView(GuildView)
    }


    OnClickCreate() {
        ViewManager.Inst().OpenView(GuildCreateView);
    }

    OnClickFlush() {
        GuildCtrl.Inst().SendGuildReqSearchGuild(this.viewNode.InputField.text);
    }
}

class GuildJoinViewShowItem extends BaseItem {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        IdShow: <fgui.GTextField>null,
        NumShow: <fgui.GRichTextField>null,
        AvatarShow: <AvatarGuildCell>null,
        BtnJoin: <fgui.GButton>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnJoin.onClick(this.OnClickJoin, this);
    }

    public SetData(data: IPB_SCGuildNode) {
        super.SetData(data);

        this.viewNode.AvatarShow.SetData(new AvatarGuildData(data.guildIcon))
        UH.SetText(this.viewNode.NameShow, TextHelper.Format(Language.Guild.NameShow, DataHelper.BytesToString(data.guildName)))
        UH.SetText(this.viewNode.IdShow, TextHelper.Format(Language.Guild.IdShow, data.guildId))
        UH.SetText(this.viewNode.NumShow, TextHelper.Format(Language.Guild.NumShow, data.guildMemberNum, GuildData.Inst().CfgOtherGuildPopNum(), data.guildMemberNum < GuildData.Inst().CfgOtherGuildPopNum() ? COLORSTR.Green1 : COLORSTR.Red1))
    }

    OnClickJoin() {
        GuildCtrl.Inst().SendGuildReqJoinGuild(this._data.guildId)
    }
}
