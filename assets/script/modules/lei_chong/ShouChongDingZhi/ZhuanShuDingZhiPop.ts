import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import * as fgui from "fairygui-cc";
import { PetCtrl, PET_OP_TYPE } from "modules/Pet/PetCtrl";
import { PetData } from "modules/Pet/PetData";
import { Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ItemCell } from "modules/extends/ItemCell";
import { ShouChongDingZhiData } from "./ShouChongDingZhiCtrl";
import { Item } from "modules/bag/ItemData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { sys } from "cc";
import { RoleData } from "modules/role/RoleData";
import { LeiChongView } from "../LeiChongView";

@BaseView.registView 
export class ZhuanShuDingZhiPop extends BaseView{
    protected viewRegcfg = {
        UIPackName: "ZhuanShuDingZhi",
        ViewName: "ZhuanShuDingZhiPop",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
   
    protected viewNode = {
        CloseBtn: <fgui.GButton>null,
        Cell: <ItemCell>null,
        BtnGoTo: <fgui.GButton>null,
     };

     InitUI() {
        
      
     }

    InitData(data: any) {
        this.viewNode.CloseBtn.onClick(this.OnBtnClick.bind(this,"CloseBtn"))
         this.viewNode.BtnGoTo.onClick(this.OnBtnClick.bind(this,"BtnGoTo"))
        let itemData = ShouChongDingZhiData.Inst().GetGiftData();
        this.viewNode.Cell.SetData(Item.Create(itemData[itemData.length-1].reward_item[0],{ is_click: true, is_gray: false, is_num: true}))
        sys.localStorage.setItem("DingZhiPopTime" + RoleData.Inst().GetRoleId(),TimeCtrl.Inst().tomorrowStarTime+"")
     }
     closeView(){
        ViewManager.Inst().CloseView(ZhuanShuDingZhiPop);
     }
     CloseCallBack(): void {
        
     }
     OnBtnClick(name: string){
        switch(name){
            case "CloseBtn":
                ViewManager.Inst().CloseView(ZhuanShuDingZhiPop);
                break;
            case "BtnGoTo":
                ViewManager.Inst().OpenView(LeiChongView,2078);
                break;
        }
     }
}
