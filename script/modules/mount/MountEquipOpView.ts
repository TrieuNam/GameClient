import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { CommonConfirmTipView, CommonConfirmTipData } from "modules/common_help/CommonConfirmTipView";
import { RedPoint } from "modules/extends/RedPoint";
import { PetGemData } from "modules/Pet/PetData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { MountCtrl, MOUNR_REQ_TYPE } from "./MountCtrl";
import { MountData } from "./MountData";
import { MountEquipDetailView } from "./MountEquipDetailView";
import { MountEquipSelectView } from "./MountEquipSelectView";
import { MountEquipWashView } from "./MountEquipWashView";
import { Item } from "modules/bag/ItemData";

@BaseView.registView
export class MountEquipOpView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipOp",
        ViewName: "MountEquipOpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.None,
    };

    protected viewNode = {
        EquipOp: <fgui.GGroup>null,
        BagOp: <fgui.GGroup>null,
        SelectOp: <fgui.GGroup>null,

        EquipBg: <fgui.GImage>null,
        BtnDetailE: <fgui.GButton>null,
        BtnWashE:<fgui.GButton>null,
        BtnExchangeE:<fgui.GButton>null,

        BtnDetailB: <fgui.GButton>null,
        BtnWashB:<fgui.GButton>null,
        BtnSmelt:<fgui.GButton>null,

        BtnDetailS: <fgui.GButton>null,
        BtnExchangeS:<fgui.GButton>null,

        Block:<fgui.GGraph>null,
        RedPointEx:<RedPoint>null,
        RedPointW:<RedPoint>null,
    }

    private oper_type = -1
    private open_index = -1
    // 这个坐标点直接传那个被点击对象的x,y即可 show_type == 1 右
    InitData(param:  {index:number,oper_type: number, pos: {x:number,y:number},show_type:number,ex_param:boolean}) {

        this.open_index = param.index
        this.oper_type = param.oper_type
        this.viewNode.EquipOp.visible = param.oper_type == 0
        this.viewNode.BagOp.visible = param.oper_type == 1
        this.viewNode.SelectOp.visible = param.oper_type == 2

        if(param.oper_type == 0)
        {
            this.viewNode.EquipOp.setPosition(param.pos.x+(param.show_type == 1 ? 120 : -150) ,param.pos.y)

            this.viewNode.BtnWashE.visible = param.ex_param
            this.viewNode.BtnDetailE.visible = param.ex_param

            this.viewNode.RedPointEx.SetNum(MountData.Inst().GetTypeEquipRed(this.open_index))
            this.viewNode.RedPointW.SetNum(MountData.Inst().GetTypeWashRed(this.open_index))

            this.viewNode.EquipBg.height = param.ex_param ? 200 : 70
        }
        else if(param.oper_type == 1)
        {
            this.viewNode.BagOp.setPosition(param.pos.x+(param.show_type == 1 ? 120 : -150),param.pos.y)
        }
        else if(param.oper_type == 2)
        {
            this.viewNode.SelectOp.setPosition(param.pos.x+(param.show_type == 1 ? 120 : -150),param.pos.y)
        }

        this.viewNode.BtnDetailE.onClick(this.OnDetail.bind(this));
        this.viewNode.BtnWashE.onClick(this.OnWash.bind(this));
        this.viewNode.BtnExchangeE.onClick(this.OnChange.bind(this));

        this.viewNode.BtnDetailB.onClick(this.OnDetail.bind(this));
        this.viewNode.BtnWashB.onClick(this.OnWash.bind(this));
        this.viewNode.BtnSmelt.onClick(this.OnResolve.bind(this));

        this.viewNode.BtnDetailS.onClick(this.OnDetail.bind(this));
        this.viewNode.BtnExchangeS.onClick(this.OnChange.bind(this));

        this.viewNode.Block.onClick(this.closeView.bind(this));
    }

    private OnChange() {
        // 这里填发协议
        if(this.oper_type == 0)
        {
            ViewManager.Inst().OpenView(MountEquipSelectView, {bag_index:this.open_index});
        }
        else if(this.oper_type == 1 || this.oper_type == 2)
        {

            MountData.Inst().JumpAttrChangeByEquip(this.open_index)
            MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.WEAR, this.open_index)
            ViewManager.Inst().CloseView(MountEquipSelectView)
            MountData.Inst().SetEquipEffPos(this.open_index)
        }

        this.closeView();
    }

    private OnWash() {
        if(this.oper_type == 0)
        {
            let list = MountData.Inst().GetHarnessWeakList()
            ViewManager.Inst().OpenView(MountEquipWashView, {bag_index:list[this.open_index].index});
        }
        else{
            ViewManager.Inst().OpenView(MountEquipWashView, {bag_index:this.open_index});    
        }
        
        this.closeView();
    }

    private OnResolve()
    {
        let oper = MountData.Inst().GetDetailHarnessInfo(this.open_index)
        let item_cfg = Item.GetConfig(oper.item_id)
        let name_sell = Item.GetName(item_cfg.sell_item_id)
        let num_sell = item_cfg.sell_item_num
        // 这里填发协议
        ViewManager.Inst().OpenView(CommonConfirmTipView, 
            new CommonConfirmTipData(Language.Mount.ResolveTitle, 
                TextHelper.Format( Language.Mount.ResolveContent,oper.name,name_sell,num_sell), () => {
                    MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.DECOMPOSE, this.open_index)
                    PublicPopupCtrl.Inst().Center(Language.Mount.ResolveSuccess);
                }));


        
        this.closeView();
    }

    private OnDetail()
    {
        if(this.oper_type == 0)
        {
            let list = MountData.Inst().GetHarnessWeakList()
            ViewManager.Inst().OpenView(MountEquipDetailView, {bag_index:list[this.open_index].index});
        }
        else {
            ViewManager.Inst().OpenView(MountEquipDetailView, {bag_index:this.open_index});
        }
        
        this.closeView();
    }
}