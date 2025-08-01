import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { BoardData } from "modules/common_board/BoardData";
import { ManualCtrl, ManualData, MANUAL_OP_TYPE } from "./ManualCtrl";
import { UH } from "../../helpers/UIHelper";
import { AttrListDesc, AttrListName, Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Item } from "modules/bag/ItemData";
import { COLORS } from "modules/common/ColorEnum";
import { RoleTitleItem1 } from "modules/common_item/RoleTitleItems";
import { BaseItem } from "modules/common/BaseItem";
import { CfgItem } from "config/CfgCommon";
import { CfgTitleCfgData } from "config/CfgTitleCfg";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RedPoint } from "modules/extends/RedPoint";
import { TextHelper } from "../../helpers/TextHelper";


@BaseView.registView
export class ManualView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Manual",
        ViewName: "ManualView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        TxtCurAddMoney: <fgui.GTextField>null,
        TxtNextAddMoney: <fgui.GTextField>null,
        Title: <RoleTitleItem1>null,
        BtnDetail: <fgui.GButton>null,
        BtnFetched: <fgui.GButton>null,
        ListReward: <fgui.GList>null,
        RedPoint: <RedPoint>null,
    }

    protected extendsCfg = [
        { ResName: "ManualCell", ExtendsClass: ManualCell },
        { ResName: "ManualRewardCell", ExtendsClass: ManualRewardCell },
    ];

    private manual_data: ManualData;
    private help_key = 2;//配置的说明文字字段
    private add_money:number;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }


    InitData() {
        this.manual_data = ManualData.Inst();
        this.viewNode.Board.SetData(new BoardData(ManualView, null, this.help_key));
        this.viewNode.BtnDetail.onClick(this.onDetail.bind(this));
        this.viewNode.BtnFetched.onClick(this.onFetched.bind(this));
        this.AddSmartDataCare(this.manual_data.result_data, this.FulshAll.bind(this), "info");
        this.AddSmartDataCare(this.manual_data.result_data, this.FulshAll.bind(this), "show_level");
        this.AddSmartDataCare(this.manual_data.result_data, this.FulshAll.bind(this), "condition_info");
        this.FulshAll();
    }

    private FulshAll() {
        let level = this.manual_data.GetLevel();
        // if (this.manual_data.result_data.show_level != level) {
        //     return;
        // }
        this.viewNode.List.SetData(this.manual_data.GetListData());
        let add_money = this.manual_data.GetAddMoney();
        UH.SetText(this.viewNode.TxtCurAddMoney, TextHelper.Format(Language.Manual.add_money, add_money[0])  );
        this.add_money = add_money[1];
        UH.SetText(this.viewNode.TxtNextAddMoney, this.add_money + "%");
        this.viewNode.Title.SetData({ title: CfgTitleCfgData.titile[level - 1].for_item_id, level: level });
        let reward_cfg = this.manual_data.GetLvRewardData(level);
        this.viewNode.ListReward.SetData(reward_cfg.reward);
        let is_can_fetch = this.manual_data.IsRewardCanFetch();
        this.viewNode.BtnFetched.grayed = !is_can_fetch;
        if (!this.manual_data.IsMaxLevel() || is_can_fetch){
            this.viewNode.BtnFetched.title=Language.ActCommon.LingQu;
        }else{
            this.viewNode.BtnFetched.title = Language.ActCommon.YiLingQu;
        }
        // this.viewNode.BtnFetched.visible = !this.manual_data.IsMaxLevel() || is_can_fetch;
        this.viewNode.RedPoint.SetNum(is_can_fetch ? 1 : 0)
    }

    private onDetail() {
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: this.manual_data.GetAllAdd(), is_show_hiding: true
        })
    }

    private onFetched() {
        let is_can_fetch = this.manual_data.IsRewardCanFetch();
        if (is_can_fetch ){
            ManualCtrl.Inst().SendGetReq(MANUAL_OP_TYPE.LEVEL_UP, this.manual_data.GetLevel());
            // PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Manual.add_money, this.add_money))
        }
    }
}

class ManualCell extends BaseItem {
    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtDesc: <fgui.GTextField>null,
        BtnGet: <fgui.GButton>null,
        ProBar: <fgui.GProgressBar>null,
        ImgFetched: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.onGet.bind(this));
    }

    public SetData(data: any) {
        this.viewNode.ImgFetched.visible = data.isFinish;
        UH.SetText(this.viewNode.TxtName, data.name);
        UH.SetText(this.viewNode.TxtDesc, data.desc);
        this.viewNode.TxtDesc.color = data.flag == 1 ? COLORS.Green3 : COLORS.Gray1;
        this.viewNode.ProBar.max = data.param;
        this.viewNode.ProBar.value = data.pro;
        this.viewNode.BtnGet.visible = data.flag != 1;
        this.viewNode.BtnGet.grayed = !data.isFinish;
        this.viewNode.ImgFetched.visible = data.flag == 1;
        this._data = data;
        this.viewNode.RedPoint.SetNum(data.isFinish && data.flag != 1 ? 1 : 0)
    }

    private onGet() {
        if (this._data) {
            // if (this._data && this._data.flag == 1)
            //     PublicPopupCtrl.Inst().Center(Language.Manual.tip)
            // else 
            if (this._data.isFinish) {
                ManualCtrl.Inst().SendGetReq(MANUAL_OP_TYPE.FETCH, this._data.seq);
                // PublicPopupCtrl.Inst().Center(this.viewNode.TxtDesc.text)
            }
        }

    }
}


class ManualRewardCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        TxtName: <fgui.GTextField>null,
    };
    public SetData(data: CfgItem) {
        this.viewNode.Cell.SetData(Item.Create(data, { is_num: true }));
        UH.SetText(this.viewNode.TxtName, Item.GetName(data.item_id), Item.QuaColor(data.item_id));
        this.viewNode.TxtName.strokeColor = Item.QuaColorOL(data.item_id);
    }
}