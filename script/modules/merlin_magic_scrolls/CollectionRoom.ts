import { BasePanel } from "modules/common/BasePanel";
import * as fgui from "fairygui-cc";
import { MerlinMagicData } from "./MerlinMagicData";
import { Language } from "modules/common/Language";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { ViewManager } from "manager/ViewManager";
import { math } from "cc";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";

export class CollectionRoom extends BasePanel {
    data = MerlinMagicData.Inst()
    temp_list: number[] = []
    protected viewNode = {
        TabList: <fgui.GList>null,
        List: <fgui.GList>null,
        TopTab: <fgui.GGroup>null,
        NoneData: <fgui.GGroup>null,
    };
    tabCfg = [{ index: 0, title: Language.MerlinMagic.Title2[0] }, { index: 1, title: Language.MerlinMagic.Title2[1] }]
    InitPanelData() {
        this.AddSmartDataCare(this.data.FlushData, this.FlushItemList.bind(this), "flush_list")
    }

    InitPanel() {
        this.viewNode.TabList.onClick(this.OnClickTab.bind(this))
        for (let index = 0; index < 4; index++) {
            this.temp_list.push(1)
        }
    }
    index = 0
    FlushItemList() {
        if (this.index == 0) {
            //品质排
            let temp_list: any[] = []
            this.data.scroll_list.forEach(element => {
                const item = Item.GetConfig(element.itemId)
                if (item) {
                    if (!temp_list[item.color]) {
                        temp_list[item.color] = []
                    }
                    temp_list[item.color].push(element)
                }
            });
            temp_list = Object.values(temp_list)
            console.log(temp_list);
            this.viewNode.List.SetData(temp_list)
        } else {
            //主被动排
            let temp_list: any[] = []
            this.data.scroll_list.forEach(element => {
                const item = Item.GetConfig(element.itemId)
                if (item) {
                    if (!temp_list[item.type]) {
                        temp_list[item.type] = []
                    }
                    temp_list[item.type].push(element)
                }
            });
            temp_list = Object.values(temp_list)
            this.viewNode.List.SetData(temp_list)
        }
        if (this.data.scroll_list) {
            this.viewNode.TopTab.visible = this.data.scroll_list.length != 0
            this.viewNode.NoneData.visible = this.data.scroll_list.length == 0
        } else {
            this.viewNode.TopTab.visible = false
            this.viewNode.NoneData.visible = true
        }
    }
    OnClickTab() {
        //根据tabindex显示对应列表
        this.FlushItemList()
    }
    DoOpenWaitHandle() {

    }

    OpenPanel() {
        //在这做逻辑

        this.viewNode.TabList.SetData(this.tabCfg)
        this.FlushItemList()
    }

    ClosePanel() {

    }

    OnVisible() {

    }

    OnUnVisible() {

    }
}
export class CollectionRoomTabItem extends BaseItemGB {
    protected viewNode = {
        title: <fgui.GTextField>null,
        title2: <fgui.GTextField>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        UH.SetText(this.viewNode.title, data.title)
        UH.SetText(this.viewNode.title2, data.title)
    }
    public GetData() {
        return this._data;
    }
}
export class CollectionRoomItem extends BaseItem {
    protected viewNode = {
        Name: <fgui.GRichTextField>null,
        ItemList: <fgui.GList>null,
        BoardList: <fgui.GList>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    init_hight = 305
    public SetData(data: any) {
        this._data = data;
        let num = data.length
        this.viewNode.ItemList.SetData(data)
        let temp_list2 = []
        let num2 = Math.ceil(num / 3)
        for (let index = 0; index < num2; index++) {
            temp_list2.push(1)
        }
        this.viewNode.BoardList.SetData(temp_list2)
        this.height = this.initHeight + (num2 - 1) * 240
    }
    public GetData() {
        return this._data;
    }
}