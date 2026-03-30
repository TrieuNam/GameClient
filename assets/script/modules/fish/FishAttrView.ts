import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { BATTLE_ATTR } from "modules/common/CommonEnum";
import { AttrListName } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { RoleData } from "modules/role/RoleData";
import { Timer } from "modules/time/Timer";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";


@BaseView.registView 
export class FishAttrView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Role",
        ViewName: "FishAttrView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board: <CommonBoard4>null,
        AttrList: <fgui.GList>null,
        BtnArrow: <fgui.GButton>null,
        empty: <fgui.GLabel>null,
    };

    protected extendsCfg = [
        { ResName: "FishAttrItem", ExtendsClass: FishAttrItem },
    ]

    InitData(param_t?:any) {
        //this.viewNode.AttrList.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.BtnArrow.visible = false;
        param_t = param_t ?? []
        let attrShow = []
        let attrList = param_t.attrList ?? [];
        let is_show_hiding = param_t.is_show_hiding ??false;
        for(let i = 0; i < attrList.length; i ++) {
            if (is_show_hiding || RoleData.Inst().GetRoleAttrIsShow(attrList[i].attrType)){
                attrShow.push(attrList[i])
            }
        }
        this.viewNode.Board.SetData(new BoardData(FishAttrView, param_t.name, param_t.help));
        this.attrList = attrShow
        this.viewNode.AttrList.SetData( this.attrList)
        this.viewNode.BtnArrow.onClick(this.OnClickArrow.bind(this));
        this.viewNode.empty.visible = attrShow.length == 0
    }

    private attrList :any[]

    // private GetListItemResource(index: number) {
    //     let data = this.attrList[index];
    //     if (undefined != data.attrDesc){
    //         return fgui.UIPackage.getItemURL("Role", "AttrDesc");
    //     }
    //     else
    //     {
    //         return fgui.UIPackage.getItemURL("Main", "AttrItem");
    //     }
    // }

    OnClickArrow() {
        this.viewNode.AttrList.scrollPane.scrollDown()
    }

}
export class FishAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
        AttrDesc: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrDesc, data.attrDesc);
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType] + "：");
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
    }
}
// export class RoleAttrDesc extends BaseItem {
//     protected viewNode = {
//         AttrDesc: <fgui.GTextField>null,
//     };

//     public SetData(data: any) {
//         UH.SetText(this.viewNode.AttrDesc, data.attrDesc);
//     }
// }protected viewNode = {
    
