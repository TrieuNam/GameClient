import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { EQUIP_OP_TYPE, EquipBagCtrl } from "modules/EquipBag/EquipBagCtrl";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UH } from "../../helpers/UIHelper";
import { EnChantData, EnchantCost } from "./EnchantData";

@BaseView.registView
export class EnchantConversView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "EnchantConvers",
        ViewName: "EnchantConversView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    private data: any
    private reward_data: any;
    private cost1: number;
    private cost2: number;
    private cost3: number;

    private pay1 = EnChantData.Inst().GetChangeCostForOne(1).item_num
    private pay2 = EnChantData.Inst().GetChangeCostForOne(2).item_num
    private pay3 = EnChantData.Inst().GetChangeCostForOne(3).item_num



    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // Name: <fgui.GTextField>null,
        BtnZhuanHua: <fgui.GButton>null,
        Board: <CommonBoard3>null,

        itemnum_1: <fgui.GTextField>null,
        itemnum_2: <fgui.GTextField>null,
        itemnum_3: <fgui.GTextField>null,
        itemnum_4: <fgui.GTextField>null,
        cost_num: <fgui.GTextField>null,

        ChangeItem1: <EnchantConversRender>null,
        ChangeItem2: <EnchantConversRender>null,
        ChangeItem3: <EnchantConversRender>null,

    };

    protected extendsCfg = [
        { ResName: "EnchantConversRender", ExtendsClass: EnchantConversRender },
    ];

    InitData() {
        this.data = EnChantData.Inst()
        this.viewNode.BtnZhuanHua.onClick(this.OnClickBtnZhuanhua.bind(this));
        this.viewNode.Board.SetData(new BoardData(EnchantConversView));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemHasShow.bind(this), "OtherChange");
        this.AddSmartDataCare(EnChantData.Inst().ResultData, this.FlushNeedCost.bind(this), "changeflush");
    }

    InitUI() {

        this.FlushAllInfo();
        this.FlushNeedCost()

    }


    private FlushAllInfo() {
        this.FlushItemHasShow();
        this.FlushNeedCostShow();
    }

    private FlushItemHasShow() {
        UH.SetText(this.viewNode.itemnum_1, BagData.Inst().getItemNum(EnchantCost.MOFEN));
        UH.SetText(this.viewNode.itemnum_2, BagData.Inst().getItemNum(EnchantCost.FALI));
        UH.SetText(this.viewNode.itemnum_3, BagData.Inst().getItemNum(EnchantCost.SHENGMING));
        UH.SetText(this.viewNode.itemnum_4, BagData.Inst().getItemNum(EnchantCost.MOHE));
    }

    private OnClickBtnZhuanhua() {
        if (this.cost1 == 0 && this.cost2 == 0 && this.cost3 == 0) {
            PublicPopupCtrl.Inst().Center(Language.Enchant.NoNum)
            return
        }
        // LogError(this.cost1 + "   " + this.cost2 + "   " + this.cost3)
        EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.CHange, this.cost1, this.cost2, this.cost3)
        this.cost1 = 0
        this.cost2 = 0
        this.cost3 = 0
        this.FlushNeedCostShow();
        this.FlushNeedCost()
        // LogError("OnClickBtnZhuanhua")

    }

    private FlushNeedCostShow() {
        this.reward_data = this.data.GetChangeData();
        this.viewNode.ChangeItem1.SetData(this.reward_data[0])
        this.viewNode.ChangeItem2.SetData(this.reward_data[1])
        this.viewNode.ChangeItem3.SetData(this.reward_data[2])
    }

    public FlushNeedCost() {
        this.cost1 = this.viewNode.ChangeItem1.GetChangeNum()
        this.cost2 = this.viewNode.ChangeItem2.GetChangeNum()
        this.cost3 = this.viewNode.ChangeItem3.GetChangeNum()
        let cost = this.cost1 * this.pay1 + this.cost2 * this.pay2 + this.cost3 * this.pay3
        UH.SetText(this.viewNode.cost_num, cost)
        let has_num = BagData.Inst().getItemNum(40900)
        let color = has_num >= cost ? COLORS.White : COLORS.Red1
        this.viewNode.cost_num.color = color
    }

}

export class EnchantConversRender extends fgui.GComponent {
    private viewNode = {
        Cell: <ItemCell>null,
        btn_reduce: <fgui.GButton>null,
        btn_add: <fgui.GButton>null,
        Num: <fgui.GTextInput>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.btn_add.onClick(this.OnClickAdd.bind(this));
        this.viewNode.btn_reduce.onClick(this.OnClickRedce.bind(this));
        this.viewNode.Num.on(fgui.Event.TEXT_CHANGE, this.OnCLockChange, this);

        // this.viewNode.Num.onChanged
    }

    public SetData(data: any) {
        this.data = data;
        this.viewNode.Cell.SetData(Item.Create({ item_id: data.target_item }, { is_click: true }))
        this.viewNode.Num.restrict = "0-9"
        this.viewNode.Num.text = "0";


    }

    private OnClickAdd() {
        let num = Number(this.viewNode.Num.text)
        num = num + 1
        this.viewNode.Num.text = num.toString();
        EnChantData.Inst().SetChangeViewFlush();
    }

    private OnClickRedce() {
        let num = Number(this.viewNode.Num.text)
        num = num - 1
        num = num >= 0 ? num : 0
        this.viewNode.Num.text = num.toString();
        EnChantData.Inst().SetChangeViewFlush();

    }

    public GetChangeNum() {
        return Number(this.viewNode.Num.text)
    }

    public OnCLockChange() {
        if (Number(this.viewNode.Num.text).toString() == "NaN") {
            this.viewNode.Num.text = "0";
        }
        EnChantData.Inst().SetChangeViewFlush();
    }
}