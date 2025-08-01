import { UI } from "cc";
import * as fgui from "fairygui-cc";
import { ListLayoutType } from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { OtherRoleCtrl, OTHER_ROLE_REQ_TYPE } from "modules/OtherRole/OtherRoleCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class EscortRankView extends BaseView {
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Escort.TabbarName1, index: 1 },
        { panel: null, viewName: "", titleName: Language.Escort.TabbarName2, index: 2 }
    ]
    select_index = 0
    protected viewRegcfg = {
        UIPackName: "EscortRank",
        ViewName: "EscortRankView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard2>null,
        TabList: <fgui.GList>null,
        List: <fgui.GList>null,
        NoneObj: <fgui.GObject>null,
        MyItem: <EscortRankItem>null,
        WenZiDi: <fgui.GObject>null,
    };

    protected extendsCfg = [
        { ResName: "EscortRankItem", ExtendsClass: EscortRankItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(EscortRankView, Language.Escort.Title5))
        this.viewNode.TabList.SetData(this.tabbarCfg);
        this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        this.viewNode.TabList.OnSelectedItem(0)
        //请求排行榜并刷新
        RankCtrl.Inst().SendRankReq(RANK_TYPE.EscortScore)
        RankCtrl.Inst().SendRankReq(RANK_TYPE.InterceptScore)
        this.viewNode.List.setVirtual()
        this.AddSmartDataCare(RankData.Inst().result_info, this.OnRankChange.bind(this), "is_change")
    }
    OnRankChange() {
        //算了我妥协
        let data
        if (this.select_index == 1) {
            data = RankData.Inst().GetRankList(RANK_TYPE.InterceptScore)
        } else {
            data = RankData.Inst().GetRankList(RANK_TYPE.EscortScore)
        }
        if (data.list.length == 0) {
            //this.viewNode.WenZiDi.height = 900
            //this.viewNode.MyItem.visible = false
            this.viewNode.NoneObj.visible = true
            this.viewNode.List.SetData(data.list)
        } else {
            //this.viewNode.WenZiDi.height = 763
            //this.viewNode.MyItem.visible = true
            this.viewNode.NoneObj.visible = false
            this.viewNode.List.SetData(data.list)
        }
        //console.log(data.my_info);

        if (data.my_info != null && data.my_info != undefined) {
            this.viewNode.MyItem.SetData(data.my_info)
        }
    }
    OnClickListItem(item: CommonBoard5Tab) {
        this.select_index = item._data.index
        if (item._data.index == 1) {
            RankCtrl.Inst().SendRankReq(RANK_TYPE.InterceptScore)
            this.OnRankChange()
        } else {
            RankCtrl.Inst().SendRankReq(RANK_TYPE.EscortScore)
            this.OnRankChange()
        }
    }
    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }
}

export class EscortRankItem extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        NameShow: <fgui.GTextField>null,
        LevelShow: <fgui.GTextField>null,
        LayerShow: <fgui.GTextField>null,
        RankTxt: <fgui.GTextField>null,
        RankImg: <fgui.GLoader>null,
        Head: <AvatarCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Head.onClick(this.OtherRoleInfo.bind(this));
    }

    SetData(data: { info: PB_SCRankNode, rank: number, value_show: string, name: string, server_id: number }) {
        this._data = data;
        if (data && data.info) {
            this.viewNode.Head.SetData(new AvatarData(undefined, undefined, data.info.roleinfo.headChar))
        }

        if (typeof (data) == "number") {

        } else {
            UH.SetText(this.viewNode.NameShow, Format(Language.Common.NameServer, data.name, data.server_id))
            UH.SetText(this.viewNode.LayerShow, Format(Language.Escort.JiFen, data.info.value))
            UH.SetText(this.viewNode.LevelShow, Format(Language.Common.LevelShow, data.info.roleinfo.level))
            if (data.info.roleinfo.roleId != null && data.info.roleinfo.roleId != undefined) {
                let is_my = data.info.roleinfo.roleId == RoleData.Inst().GetRoleId()
                UH.SpriteName(this.viewNode.icon, "EscortRank", is_my ? "WenZiDi3" : "WenZiDi2")
            } else {
                UH.SpriteName(this.viewNode.icon, "EscortRank", "WenZiDi3")
            }

            if (data.rank != 0 && data.rank < 4) {
                this.viewNode.RankImg.visible = true
                UH.SpriteName(this.viewNode.RankImg, "EscortRank", "ShiLianZhiTa" + data.rank)
                UH.SetText(this.viewNode.RankTxt, data.rank)
            } else {
                this.viewNode.RankImg.visible = false
                if (data.rank == 0) {
                    UH.SetText(this.viewNode.RankTxt, "--")

                } else {

                    UH.SetText(this.viewNode.RankTxt, data.rank)
                }
            }
        }
    }

    private OtherRoleInfo() {
        if (this._data) {
            OtherRoleCtrl.Inst().SendGetOtherRoleInfo(OTHER_ROLE_REQ_TYPE.Escort, this._data.info.value, this._data.info.roleinfo.roleId);
        }
    }
}