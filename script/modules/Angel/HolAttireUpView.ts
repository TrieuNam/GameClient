import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell, ItemCellAngel } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { AngelData, AttChangeData } from "./AngelData";
import { Item } from "modules/bag/ItemData";
import { UH } from "../../helpers/UIHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { AngelCtrl, AngelReqType } from "./AngelCtrl";
import { CfgItem } from "config/CfgCommon";
import { BagData } from "modules/bag/BagData";
import { HuanHuaAttCell } from "./HuanHuaComp";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";


@BaseView.registView
export class HolAttireUpView extends BaseView {
    private position: number;
    private angel_data: AngelData;
    private lack_item_id: number;
    private isMax = false;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "AngelHolAttire",
        ViewName: "HolAttireUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        ListAtt: <fgui.GList>null,
        ItemCost1: <HolAttireCostCell>null,
        ItemCost2: <HolAttireCostCell>null,
        BtnUp: <fgui.GButton>null,
        HolAttireCell: <ItemCellAngel>null,
        GpUp: <fgui.GGroup>null,
        ImgMax: <fgui.GImage>null,
        EffectShow: <UIEffectShow>null,
    }

    protected extendsCfg = [
        { ResName: "HolAttireCell", ExtendsClass: HuanHuaAttCell },
        { ResName: "HolAttireCostCell", ExtendsClass: HolAttireCostCell },
    ];

    InitData(position: number) {
        this.position = position;
        this.angel_data = AngelData.Inst();
        this.viewNode.BtnUp.onClick(this.onUp, this);
        this.viewNode.Board.SetData(new BoardData(HolAttireUpView));
        this.viewNode.ListAtt.itemRenderer = this.renderListItem.bind(this);
        this.AddSmartDataCare(this.angel_data.result_info, this.FlushAll.bind(this), "is_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCurr.bind(this), "OtherChange");
        this.FlushAll();
    }

    InitUI() {
    }

    private level: number;
    private FlushAll() {
        this.list_data = this.angel_data.GetNextEquipAttList(this.position);
        this.viewNode.ListAtt.numItems = this.list_data.length;
        let item = this.angel_data.GetEquipCellData(this.position)
        this.viewNode.HolAttireCell.SetData(item, { is_click: false });
        this.isMax = this.angel_data.IsEquipMax(this.position);
        let item_name = Item.GetName(item.itemId);
        let color = Item.QuaColor(item.itemId);
        let otline_color = Item.QuaColorOL(item.itemId);
        this.viewNode.Board.SetTitle(item_name)
        if (this.isMax) {
            this.viewNode.ImgMax.visible = true;
            this.viewNode.GpUp.visible = false;
        } else {
            let cost_data = this.angel_data.GetEquipUpCost(this.position);
            let cost_data1 =  cost_data[0];
            let cost_data2 =  cost_data[1];
            this.viewNode.ItemCost1.visible = cost_data1.itemId != 0;
            this.viewNode.ItemCost2.visible = cost_data2.itemId != 0;
            if (cost_data1.itemId)
                this.viewNode.ItemCost1.SetData({ item_id: cost_data1.itemId, cost_num: cost_data1.num });
            if (cost_data2.itemId)
                this.viewNode.ItemCost2.SetData({ item_id: cost_data2.itemId, cost_num: cost_data2.num });
            this.FlushCurr();
        }
        let level = Item.GetConfig(item.item_id).level;
        if (!this.level) {
            this.level = level
        }
        if (this.level != level) {
            this.level = level;
            this.viewNode.EffectShow.PlayEff(4164014);
            AudioManager.Inst().Play(AudioTag.ShengJi);
        }
    }

    private FlushCurr() {
        if (!this.isMax) {
            let lack_id1= this.viewNode.ItemCost1.FlushNum();
            let lack_id2 =this.viewNode.ItemCost2.FlushNum();
            this.lack_item_id = lack_id1 ?? lack_id2;
        }
    }

    private onUp() {
        if (!this.lack_item_id) {
            AngelCtrl.Inst().SendAngelReq(AngelReqType.EQUIP_LEVEL_UP, this.position);
        } else {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this.lack_item_id);
        }
    }

    private list_data: AttChangeData[];
    private renderListItem(index: number, item: HuanHuaAttCell) {
        item.SetData(this.list_data[index]);
    }
}

export class HolAttireCostCell extends BaseItem {
    protected viewNode = {
        ItemCost: <ItemCell>null,
        TxtCost: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: {item_id:number,cost_num:number}) {
        this._data=data;
        let cell_data = this.viewNode.ItemCost.GetData();
        if (!cell_data || cell_data.ItemId() != data.item_id)
            this.viewNode.ItemCost.SetData(Item.Create(new CfgItem(data.item_id)));
    }

    public FlushNum(){
        if (this._data && this._data.item_id){
            let cost_num = this._data.cost_num;
            let has_num= +Item.GetNum(this._data.item_id);
            let has_cost = has_num >= cost_num;
            let color = AngelData.Inst().GetCostColor(has_cost);
            this.viewNode.TxtCost.color = color.txt_color;
            this.viewNode.TxtCost.strokeColor = color.stroke_color;
            UH.SetText(this.viewNode.TxtCost, has_num + "/" + cost_num);
            if (!has_cost){
                return this._data.item_id;
            }
        }
    }
}