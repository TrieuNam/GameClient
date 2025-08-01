import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORS } from "modules/common/ColorEnum";
import { Language } from 'modules/common/Language';
import { Mod } from "modules/common/ModuleDefine";
import { UH } from "../../helpers/UIHelper";
import { FishToolUpGradePanel } from "./FishToolUpGradePanel";
import { FishToolUpLevelPanel } from "./FishToolUpLevelPanel";

@BaseView.registView 
export class FishToolUpView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "FishToolUp",
        ViewName: "FishToolUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected boardCfg: boardCfg = {
        TabberCfg: [
            {panel:FishToolUpLevelPanel,viewName:"FishToolUpLevelPanel",titleName:Language.Fish.TabToolUpLevel,modKey: Mod.FishToolUp.UpLevel},
            {panel:FishToolUpGradePanel,viewName:"FishToolUpGradePanel2",titleName:Language.Fish.TabToolUpGrade,modKey: Mod.FishToolUp.UpGrade},
        ]
    };

    protected extendsCfg = [
        { ResName: "ItemAttr", ExtendsClass: FishToolUpViewAttrItem },
    ]
}

export class FishToolUpViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrCur: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        let index = data.index
        if(index == 2){
            if(data.data == "max"){
                UH.SetText(this.viewNode.AttrName, GetCfgValue(Language.Fish.ItemTypeName, data.type));
                UH.SetText(this.viewNode.AttrCur, "已达到最大等级");
                this.viewNode.AttrCur.color = COLORS.Red5;
                return;
            }else{
                this.viewNode.AttrCur.color = COLORS.Green4;
                this.viewNode.AttrCur.strokeColor = COLORS.Green2;
            }
            
            
        }
        let cur = data.data
        UH.SetText(this.viewNode.AttrName, GetCfgValue(Language.Fish.ItemTypeName, cur.item_type))
        UH.SetText(this.viewNode.AttrCur, `${cur.item_att_num / 100}%`)
        //UH.SetText(this.viewNode.AttrNext, next ? `${next.item_att_num / 100}%` : `${cur.item_att_num / 100}%`)
    }
}