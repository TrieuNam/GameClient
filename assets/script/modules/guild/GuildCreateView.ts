
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard3 } from 'modules/common_board/CommonBoard3';
import { AvatarGuildCell, AvatarGuildData } from "modules/extends/AvatarCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { BannedWordFilter } from "modules/sensitiveWords/BannedWordFilter";
import { UH } from "../../helpers/UIHelper";
import { GuildConfig } from "./GuildConfig";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildCreateView extends BaseView {
    private guildIcon = 1;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildCreate",
        ViewName: "GuildCreateView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        BtnChange: <fgui.GButton>null,
        BtnCreate: <fgui.GButton>null,

        InputField: <fgui.GTextInput>null,
        InputTips: <fgui.GTextField>null,

        CostIcon: <fgui.GLoader>null,
        CostNum: <fgui.GTextField>null,
        AvatarShow: <AvatarGuildCell>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildCreateView));

        this.viewNode.BtnChange.onClick(this.OnClickChange, this);
        this.viewNode.BtnCreate.onClick(this.OnClickCreate, this);

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");

        this.viewNode.InputField.on(fgui.Event.TEXT_CHANGE, () => {
            this.viewNode.InputTips.visible = "" == this.viewNode.InputField.text
        })
    }

    InitUI() {
        this.FlushCostShow()
        this.FlushIconShow()
    }

    FlushInfo() {
        ViewManager.Inst().CloseView(GuildCreateView);
    }

    FlushCostShow() {
        let found = GuildData.Inst().CfgOtherFound();
        if (found && found[0]) {
            UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(found[0].item_id), ICON_TYPE.ITEM);
            UH.SetText(this.viewNode.CostNum, found[0].num);
        }
    }

    FlushIconShow() {
        this.viewNode.AvatarShow.SetData(new AvatarGuildData(this.guildIcon))
    }

    OnClickChange() {
        this.guildIcon = GuildConfig.ICON_NUM_MAX == this.guildIcon ? 1 : ++this.guildIcon
        this.FlushIconShow()
    }

    OnClickCreate() {
        let str_num = +this.viewNode.InputField.text.length
        if (str_num < 2) {
            PublicPopupCtrl.Inst().Center(Language.Guild.GuildCreate.NameNumTips1)
            return
        }
        if (str_num > 12) {
            PublicPopupCtrl.Inst().Center(Language.Guild.GuildCreate.NameNumTips2)
            return
        }
        let info = BannedWordFilter.ins.filterWord(this.viewNode.InputField.text)
        if (info.has) {
            PublicPopupCtrl.Inst().Center(Language.Common.bannedWordTip)
            return
        }
        PublicPopupCtrl.Inst().DialogTips(Language.Guild.GuildCreate.CreateTips, DialogTipsTypes.guild_create, () => {
            GuildCtrl.Inst().SendGuildReqCreateGuild(this.guildIcon, this.viewNode.InputField.text);
        });
    }
}
