import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonContext } from "modules/common/CommonContext";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { BaseItem } from "modules/common/BaseItem";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { msgType, OPEM_PARAM } from "modules/common/CommonEnum";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";

@BaseView.registView
export class FriendsRankView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FriendsRank",
        ViewName: "FriendsRankView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnShare: <fgui.GButton>null,
        Context: <CommonContext>null,
        //HeadCell: <AvatarCell>null,
    }
    /* protected extendsCfg = [
        { ResName: "FriendsRankItem", ExtendsClass: FriendsRankItem },
    ] */
    InitData(param: any): void {
        this.viewNode.Board.SetData(new BoardData(FriendsRankView, Language.FriendsRank.Title))
        this.viewNode.BtnShare.onClick(this.OnClickShare, this)
    }
    OnClickShare() {
        ChannelAgent.Inst().OnMessage(GameToChannel.arouseShare,"")
    }

    InitUI(): void {
    }

    OpenCallBack(): void {
        let param = new OPEM_PARAM()
        param.type = msgType.friendScore
        this.viewNode.Context.postMessage(param)
    }

    CloseCallBack(): void {

    }

}
