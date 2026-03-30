import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGL } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { OtherRoleCtrl, RANK_TO_OTHER } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";


@BaseView.registView
export class TrialRankView extends BaseView {
    private rank_type: RANK_TYPE;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialRank",
        ViewName: "TrialRankView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        ShowList: <fgui.GList>null,
        MyRank: <TrialTrialTowerPanelRankItem>null,
        EmptyObj: <fgui.GComponent>null,
    };

    protected extendsCfg = [
        { ResName: "TrialRankItem", ExtendsClass: TrialTrialTowerPanelRankItem },
    ];

    InitData(type: RANK_TYPE) {
        this.rank_type = type;
        RankData.Inst().CurRankType = type;
        this.viewNode.ShowList.setVirtual();
        this.viewNode.ShowList.on(fgui.Event.SCROLL_END, this.OnScrollEnd, this);
        this.viewNode.Board.SetData(new BoardData(TrialRankView, RankData.Inst().GetTitle(type)));
        this.AddSmartDataCare(RankData.Inst().result_info, this.FlushShow.bind(this), "is_change");
        this.FlushShow();
        RankCtrl.Inst().SendRankReq(type)
    }

    private FlushShow() {
        let data = RankData.Inst().GetRankList(this.rank_type);
        this.viewNode.ShowList.SetData(data.list);
        this.viewNode.EmptyObj.visible = 0 == data.list.length;
        this.viewNode.MyRank.SetData(data.my_info);
    }

    CloseCallBack() {
        RankData.Inst().CurRankType = null;
        RankData.Inst().clearRankData(this.rank_type);
    }

    private OnScrollEnd() {
        RankCtrl.Inst().SendRankReq(this.rank_type)
    }
}

export class TrialTrialTowerPanelRankItem extends BaseItemGL {
    protected viewNode = {
        RankImg: <fgui.GLoader>null,
        RankTxt: <fgui.GTextField>null,
        NameShow: <fgui.GTextField>null,
        LevelShow: <fgui.GTextField>null,
        LayerShow: <fgui.GTextField>null,
        Head: <AvatarCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Head.onClick(this.OtherRoleInfo.bind(this));
    }

    public SetData(data?: { info: PB_SCRankNode, rank: number, value_show: string, name: string }) {
        this._data = data;
        if (data) {
            let role_level = data.info.roleinfo.level
            let role_name = data.name
            let role_rank = data.rank
            let role_layer = data.info.value
            this.viewNode.RankImg.visible = role_rank <= 3 && role_rank > 0
            this.viewNode.RankTxt.visible = !this.viewNode.RankImg.visible;
            UH.SetText(this.viewNode.RankTxt, 0 == role_rank ? Language.Arena.no_rank : (role_rank > 3 ? role_rank : ""))
            UH.SetText(this.viewNode.NameShow, role_name)
            UH.SetText(this.viewNode.LevelShow, `Lv.${role_level}`);
            UH.SetText(this.viewNode.LayerShow, TextHelper.Format(data.value_show, role_layer))
            if (role_rank <= 3 && role_rank > 0) {
                UH.SpriteName(this.viewNode.RankImg, "CommonAtlas", `ShiLianZhiTa${role_rank}`)
            }
            this.viewNode.Head.SetData(new AvatarData(data.info.roleinfo.headPicId, null, data.info.roleinfo.headChar));
            this.viewNode.Head.visible = true;
        }
    }

    private OtherRoleInfo() {
        let type = RankData.Inst().CurRankType;
        if (this._data && RANK_TO_OTHER[type]) {
            if (this._data.role_id < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(RANK_TO_OTHER[type], this._data.info.value, this._data.info.roleinfo.roleId);
        }
    }
}