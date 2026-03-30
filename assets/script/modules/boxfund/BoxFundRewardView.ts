import { CfgBoxFundData } from "config/CfgBoxFund";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { LevelFundData } from "modules/levelfund/LevelFundData";
import { ScoreFundData } from "modules/ScoreFund/ScoreFundCtrl";
import { WarOrderData } from "modules/warOrder/WarOrderData";
import { BoxFundData } from "./BoxFundData";

@BaseView.registView 
export class BoxFundRewardView extends BaseView {
    
    
    protected viewRegcfg = {
        UIPackName: "BoxFundRewardShow",
        ViewName: "BoxFundRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };
    
    private list_data_common: any;
    private list_data_senior: any;
    private param : any
    // protected boardCfg = {
        // BoardTitle: Language.Temp.Title,
        // TabberCfg: [
        //     { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        // ]
    // };
    
    protected viewNode = {
        common_list: <fgui.GList>null,
        senior_list: <fgui.GList>null,
        Board: <CommonBoard3>null,
    }; 
    
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    protected extendsCfg = [
        { ResName: "BoxFundRewardItem", ExtendsClass: BoxFundRewardItem }
    ];

    InitData(param:{type:number, pause: number}) {
        this.param = param
        this.viewNode.Board.SetData(new BoardData(BoxFundRewardView));
        this.data = BoxFundData.Inst()
        this.viewNode.common_list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.common_list.setVirtual();
        this.viewNode.senior_list.itemRenderer = this.renderSeniorListItem.bind(this);
        this.viewNode.senior_list.setVirtual();
        this.FlushList()
    }

    private FlushList() {
        switch (this.param.type) {
            case 1:
                this.list_data_common = this.data.GetBoxFundRewardShowList(1, this.param.pause)
                this.list_data_senior = this.data.GetBoxFundRewardShowList(2, this.param.pause)
                break;
            case 2:
                this.list_data_common = LevelFundData.Inst().GetLevelFundRewardShowList(1, this.param.pause)
                this.list_data_senior = LevelFundData.Inst().GetLevelFundRewardShowList(2, this.param.pause)
                break;
            case 3:
                this.list_data_common = ScoreFundData.Inst().GetRewardShowCfg()[this.param.pause][1]??[];
                this.list_data_senior = ScoreFundData.Inst().GetRewardShowCfg()[this.param.pause][2] ?? [];
                break;
            case 4:
                this.list_data_common = WarOrderData.Inst().GetWarOrderRewardShowList(1);
                this.list_data_senior = WarOrderData.Inst().GetWarOrderRewardShowList(2);
                break;
        }
        this.viewNode.common_list.numItems = this.list_data_common.length;
        this.viewNode.senior_list.numItems = this.list_data_senior.length;
        // this.FlushRefreshTimes();
    }


    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    private renderListItem(index: number, item: BoxFundRewardItem) {
        item.SetData(this.list_data_common[index]);
    }
    
    private renderSeniorListItem(index: number, item: BoxFundRewardItem) {
        item.SetData(this.list_data_senior[index]);
    }
}

export class BoxFundRewardItem extends fgui.GComponent {
    private viewNode = {
        cell: <ItemCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.viewNode.cell.SetData(Item.Create(data.item_reward,{ is_num: true}));

    }
}