import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ViewManager } from "manager/ViewManager";
import { AttrListName,Language } from 'modules/common/Language';
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { ICON_TYPE } from 'modules/common/CommonEnum';
import { MountData } from 'modules/mount/MountData';
import { MountEnterAttr, MountEnterView } from 'modules/mount/MountEnterView';
import { MountMainView } from 'modules/mount/MountMainView';
import { StarMapData } from 'modules/star_map/StarMapData';
import { StarMapEnterView } from 'modules/star_map/StarMapEnter';
import { StarMapMainView } from 'modules/star_map/StarMapMainView';
import { GemAtelierMainView } from './GemAtelierMainView';
import { GemAtelierData } from './GemAtelierData';
import { GuideCtrl } from 'modules/guide/GuideCtrl';

@BaseView.registView 
export class GemAtelierEnterView extends BaseView {
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "GemAtelier",
        ViewName: "GemAtelierEnter",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "GemAtelierEnterAttr", ExtendsClass: GemAtelierEnterAttr },
    ];

    protected viewNode = {
        BtnClose: <fgui.GButton> null,
        BtnEnter: <fgui.GButton> null,
        attr_3_list: <fgui.GList>null,
        empty: <fgui.GLabel>null,
    }
    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        
        let param = GemAtelierData.Inst().GetEnterParam();
        this.viewNode.attr_3_list.SetData(param.attr_list)

        this.viewNode.BtnEnter.onClick(this.BtnEnterMain.bind(this));
        // this.viewNode.empty.visible = false

        GuideCtrl.Inst().AddGuideUi("GemAtelierEnterBtnEnter", this.viewNode.BtnEnter);
    }

    private CloseView(){
        ViewManager.Inst().CloseView(GemAtelierEnterView)
    }

    private BtnEnterMain() {
        this.CloseView()
        ViewManager.Inst().OpenView(GemAtelierMainView);
    }
}

export class GemAtelierEnterAttr extends fgui.GComponent {
    private viewNode = {
        attr_name_1 : <fgui.GLabel>null,
        attr_name_2 : <fgui.GLabel>null,
        attr_name_3 : <fgui.GLabel>null,
        attr_value_1 : <fgui.GLabel>null,
        attr_value_2: <fgui.GLabel>null,
        attr_value_3 : <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        
        this.viewNode.attr_name_1.visible = data[0]!= null
        this.viewNode.attr_value_1.visible = data[0]!= null
        if(data[0]!= null){
            UH.SetText(this.viewNode.attr_name_1,  data[0].name );
            UH.SetText(this.viewNode.attr_value_1,  AttrHelper.Percent(data[0].type,data[0].value));
        }

        this.viewNode.attr_name_2.visible = data[1]!= null
        this.viewNode.attr_value_2.visible = data[1]!= null
        if(data[1]!= null){
            UH.SetText(this.viewNode.attr_name_2,   data[1].name );
            UH.SetText(this.viewNode.attr_value_2,  AttrHelper.Percent(data[1].type,data[1].value));
        }
        
        this.viewNode.attr_name_3.visible = data[2]!= null
        this.viewNode.attr_value_3.visible = data[2]!= null
        if(data[2]!= null){
            UH.SetText(this.viewNode.attr_name_3,   data[2].name );
            UH.SetText(this.viewNode.attr_value_3,  AttrHelper.Percent(data[2].type,data[2].value) );
        }
    }
}