import { CfgPetTreasure } from "config/CfgPet";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { tabberInfo } from "modules/common_board/CommonBoard5";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class BoxDrawRateView extends BaseView {
    private param_t: { ad_type: AdType, draw_func: Function, price: number[], rate_func: Function }
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxDrawRate",
        ViewName: "BoxDrawRateView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        TabList: <fgui.GList>null,
    }
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Pet.RateTag[0], index: 0, modKey: null, isRemind: false },
        { panel: null, viewName: "", titleName: Language.Pet.RateTag[1], index: 1, modKey: null, isRemind: false },
        { panel: null, viewName: "", titleName: Language.Pet.RateTag[2], index: 2, modKey: null, isRemind: false }
    ]
    protected extendsCfg = [
        { ResName: "BoxDrawRateItem", ExtendsClass: BoxDrawRateItem },
        { ResName: "BoxDrawSpecialItem", ExtendsClass: BoxDrawSpecialItem },
    ];
    select_index = 0
    InitData(param_t: any): void {
        this.param_t = param_t
        this.viewNode.Board.SetData(new BoardData(this, Language.Pet.RateTitle))
        this.viewNode.List.setVirtual()
        this.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.TabList.onClick(this.OnClickTag.bind(this))
        this.viewNode.TabList.SetData(this.tabbarCfg)
        this.viewNode.TabList.selectedIndex = 0
    }

    private showList: any[]
    private GetListItemResource(index: number) {
        let data = this.showList[index];
        if (data[0]) {
            return fgui.UIPackage.getItemURL("BoxDrawRate", "BoxDrawSpecialItem");
        }
        else {
            return fgui.UIPackage.getItemURL("BoxDrawRate", "BoxDrawRateItem");
        }
    }

    OnClickTag() {
        this.showList = this.param_t.rate_func(this.viewNode.TabList.selectedIndex)
        if(AdType.inscription_tower_draw == this.param_t.ad_type){
            if(2 == this.viewNode.TabList.selectedIndex){
                let showList =this.showList.splice(2,this.showList.length)
                let specials = this.showList.splice(0, 2)
                showList.unshift(specials)
                this.showList = showList
            }
            this.viewNode.List.columnGap = 103
        }
        

        this.viewNode.List.SetData(this.showList)
    }
    InitUI(): void {

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.OnClickTag()
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}

class BoxDrawRateItem extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Name: <fgui.GRichTextField>null,
        Rate: <fgui.GTextField>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: CfgPetTreasure) {
        this._data = data;
        let item = Item.Create(data.win[0], { is_num: true })
        this.viewNode.Cell.SetData(item)
        UH.SetText(this.viewNode.Name, item.QuaName())
        UH.SetText(this.viewNode.Rate, data.rate / 100 + "%")
    }
    public GetData() {
        return this._data;
    }
}

class BoxDrawSpecialItem extends BaseItem {
    protected viewNode = {
        ShowList: <fgui.GList>null,
    };
    protected _data: any = null;
    public SetData(data: CfgPetTreasure[]) {
        this.viewNode.ShowList.SetData(data)
    }
}