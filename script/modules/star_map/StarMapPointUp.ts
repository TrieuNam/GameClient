import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from 'modules/common_board/BoardData';
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { ItemCell  } from "modules/extends/ItemCell";
import { Item } from "modules/bag/ItemData";
import { BagData } from "modules/bag/BagData";
import { AttrListName,Language } from 'modules/common/Language';
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { StarMapCtrl, STAR_MAP_REQ_TYPE} from "modules/star_map/StarMapCtrl";
import { StarMapData } from './StarMapData';
import { TextHelper } from '../../helpers/TextHelper';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { ItemInfoView } from 'modules/item_info/ItemInfoView';
import { AttrHelper } from '../../helpers/AttrHelper';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { COLORSTR } from 'modules/common/ColorEnum';

@BaseView.registView 
export class StarMapPointUpView extends BaseView {
    private attr_cur_list:any;
    private attr_next_list:any;
    private view_param:any
    private level_mark:boolean
    // 大坑：同一个包只能启动唯一一个界面
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "StarMapExtra",
        ViewName: "StarMapPointUp",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        AttrCurList:<fgui.GList>null,
        AttrNextList:<fgui.GList>null,
        ItemCostList:<fgui.GList>null,
        ItemCostShow:<StarMapItem>null,
        OperTitle:<fgui.GLabel>null,
        BtnAct:<StarMapPointUpButton>null,
        empty_cur:<fgui.GLabel>null,
        empty_next:<fgui.GLabel>null,

        superstar_bg:<fgui.GGraph>null,
        starmap_bg:<fgui.GGraph>null,
        super_empty_cur:<fgui.GLabel>null,
        super_empty_next:<fgui.GLabel>null,
    }
    protected extendsCfg = [
        { ResName: "BtnAct", ExtendsClass: StarMapPointUpButton },
        { ResName: "StarMapAttr", ExtendsClass: StarMapAttr },
        { ResName: "StarMapItem", ExtendsClass: StarMapItem },
    ];

    InitData(param:any){

        this.viewNode.Board.SetData(new BoardData(StarMapPointUpView, param.name));
        this.view_param = param

        this.viewNode.BtnAct.onClick(this.OnClickAct.bind(this));
        this.viewNode.BtnAct.ReName(param.btn_name)
        this.viewNode.BtnAct.visible = param.level < 10 // 目前写死为最大10级
        this.viewNode.AttrCurList.SetData(param.cur_attr_list)
        this.viewNode.AttrNextList.SetData(param.next_attr_list)
        this.viewNode.ItemCostList.visible = param.cost_list.length > 1
        this.viewNode.ItemCostList.visible = param.cost_list.length > 1
        this.viewNode.ItemCostShow.visible = param.cost_list.length <= 1
        this.viewNode.superstar_bg.visible = param.is_special
        this.viewNode.starmap_bg.visible = !param.is_special
        // LogError("?f ",param.cost_list.length > 1,param.cost_list.length,param.cost_list)
        
        // 
        UH.SetText(this.viewNode.OperTitle,param.btn_name+Language.StarMap.Cost)

        GuideCtrl.Inst().AddGuideUi("StarMapPointBtnAct", this.viewNode.BtnAct);

        this.AddSmartDataCare(StarMapData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "OtherChange");
        this.flushInfoPanel()

    }
    CloseCallBack(){
        GuideCtrl.Inst().ClearGuideUi("StarMapPointBtnAct");
        GuideCtrl.Inst().ForceStop();
    }

    private flushInfoPanel() {
        let net_info = this.view_param.is_super ? StarMapData.Inst().GetSuperStarNetInfo(this.view_param.index) : StarMapData.Inst().GetStarMapNetInfo(this.view_param.type,this.view_param.grade)
        if(this.view_param.is_super){
            let param = StarMapData.Inst().GetSuperStarPointUpParam(this.view_param.index)

            // this.viewNode.Board.SetData(new BoardData(StarMapPointUpView, param.name));
            this.view_param = param
            this.viewNode.Board.SetTitle(param.name)
            this.viewNode.BtnAct.ReName(param.btn_name)
            this.viewNode.AttrCurList.SetData(param.cur_attr_list)
            this.viewNode.AttrNextList.SetData(param.next_attr_list)
            this.viewNode.ItemCostList.SetData(param.cost_list)
            UH.SetText(this.viewNode.OperTitle,param.btn_name+Language.StarMap.Cost)

            this.viewNode.super_empty_cur.visible = param.cur_attr_list.length == 0 && param.is_special
            this.viewNode.super_empty_next.visible = param.next_attr_list.length == 0 && param.is_special
            this.viewNode.empty_cur.visible =  param.cur_attr_list.length == 0 && !param.is_special
            this.viewNode.empty_next.visible = param.next_attr_list.length == 0 && !param.is_special

            this.view_param.cost_list = param.cost_list
            this.view_param.send_data = param.send_data
        }
        else 
        {
            let param = StarMapData.Inst().GetStarMapPointUpParam(
                this.view_param.type,
                this.view_param.grade,
                this.view_param.id,
                net_info[this.view_param.id].level
                )
            
            // this.viewNode.Board.SetData(new BoardData(StarMapPointUpView, param.name));
            this.view_param = param
            this.viewNode.Board.SetTitle(param.name)
            this.viewNode.BtnAct.ReName(param.btn_name)
            this.viewNode.AttrCurList.SetData(param.cur_attr_list)
            this.viewNode.AttrNextList.SetData(param.next_attr_list)

            this.viewNode.ItemCostList.SetData(param.cost_list)
            UH.SetText(this.viewNode.OperTitle,param.btn_name+Language.StarMap.Cost)

            this.viewNode.super_empty_cur.visible = param.cur_attr_list.length == 0 && param.is_special
            this.viewNode.super_empty_next.visible = param.next_attr_list.length == 0 && param.is_special
            this.viewNode.empty_cur.visible =  param.cur_attr_list.length == 0 && !param.is_special
            this.viewNode.empty_next.visible = param.next_attr_list.length == 0 && !param.is_special
 
            this.view_param.cost_list = param.cost_list
            this.view_param.send_data = param.send_data
        }

        this.viewNode.BtnAct.grayed = this.CheckCanAct()
        if(this.view_param.cost_list.length > 1)
        {
            this.viewNode.ItemCostList.SetData(this.view_param.cost_list)
        }
        else{
            this.viewNode.ItemCostShow.SetData(this.view_param.cost_list[0])
        }

        if(this.level_mark){
            if(this.view_param.is_super){
                if(net_info > 1){
                    AudioManager.Inst().Play(AudioTag.ShengJi)
                }
                else {
                    AudioManager.Inst().Play(AudioTag.JiHuo)
                }
            }
            else {
                if(net_info[this.view_param.id].level > 1){
                    AudioManager.Inst().Play(AudioTag.ShengJi)
                }
                else {
                    AudioManager.Inst().Play(AudioTag.JiHuo)
                }
            }
            
            
            this.level_mark = false
        }
    }

    private CheckCanAct() {
        if(!this.view_param.is_super)
        {
            if(!StarMapData.Inst().GetCanLevelUp(this.view_param.type,this.view_param.grade,this.view_param.level)){
                return true
            }

            if(!StarMapData.Inst().GetStarMapPointCanOper(this.view_param.type,this.view_param.grade,this.view_param.id)){
                return true
            }

        }else{
            if(!StarMapData.Inst().GetSuperStarPointCanOper(this.view_param.index)){
                return true
            }
        }
        return false
    }

    private OnClickAct() {
        let check_param = this.ItemCheck(this.view_param.cost_list)
        if(! check_param.enough){
            let show_call = Item.Create({item_id:check_param.item_id,num:check_param.need})
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.StarMap.ItemLack)
            return 
        }
        if(this.view_param.level >= 10)
        {
            PublicPopupCtrl.Inst().Center(Language.StarMap.StarPointMax)
            return 
        }


        let check_level = this.view_param.level + 1 
        if(CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level))
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips,Language.CoreCrisis.CoreName[CoreCrisisType.StarMap]))
            ViewManager.Inst().OpenView(CoreCrisisView,{mark_type:CoreCrisisType.StarMap})
            return 
        }

        if(!this.view_param.is_super)
        {
            if(!StarMapData.Inst().GetCanLevelUp(this.view_param.type,this.view_param.grade,this.view_param.level)){
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.StarMap.PointUpLevelError, this.view_param.level) )
                return 
            }

            if(!StarMapData.Inst().GetStarMapPointCanOper(this.view_param.type,this.view_param.grade,this.view_param.id)){
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.StarMap.LinkLevelError,this.view_param.level+1));
                return 
            }

        }else{
            if(!StarMapData.Inst().GetSuperStarPointCanOper(this.view_param.index)){
                PublicPopupCtrl.Inst().Center(TextHelper.Format(
                    Language.StarMap.LinkLevelError,this.view_param.level+1));
                return 
            }
        }


        this.level_mark = true

        StarMapCtrl.Inst().SendCSStarMapReq(this.view_param.is_super?STAR_MAP_REQ_TYPE.BIG_LEVEL_UP:STAR_MAP_REQ_TYPE.LEVEL_UP,{
            param1:this.view_param.send_data.param1,
            param2:this.view_param.send_data.param2,
            param3:this.view_param.send_data.param3,
        })

        let fuhao = "+"
        let type = 1
        for (let i = 0; i < this.view_param.next_attr_list.length; i++) {
            let att_type = this.view_param.next_attr_list[i].attr_name;
            let att_add = this.view_param.next_attr_list[i].value 
            if(this.view_param.cur_attr_list[i])
            {
                att_add = this.view_param.next_attr_list[i].value -this.view_param.cur_attr_list[i].value
            }
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type,att_add)}`, type)
        }

        if(!this.view_param.is_super){
            ViewManager.Inst().CloseView(StarMapPointUpView)
        }
    }

    private ItemCheck(data:any) {
        for(let i=0;i<data.length;i++){
            let num = BagData.Inst().getItemNum(data[i].item_id)
            if(num < data[i].cost_num){
                return {
                    enough:false,
                    item_id:data[i].item_id,
                    need:data[i].cost_num - num,
                }
            }
        }

        return {
            enough:true,
            item_id:0,
            need:0,
        }
    }
}

class StarMapPointUpButton extends fgui.GButton {
    private viewNode = {
        title: <fgui.GLabel>null,
    };
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public ReName(name:any) {
        UH.SetText(this.viewNode.title,name)
    }
}

class StarMapAttr extends fgui.GComponent {
    private viewNode = {
        attr_name:<fgui.GLabel>null,
        attr_value:<fgui.GLabel>null,
        starmap_line:<fgui.GImage>null,
        superstar_line:<fgui.GImage>null,
    };
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data:any) {
        UH.SetText(this.viewNode.attr_name, TextHelper.ColorStr( AttrListName[data.attr_name],data.is_special ? COLORSTR.Blue4 : COLORSTR.Yellow2));
        UH.SetText(this.viewNode.attr_value, data.attr_value);
        this.viewNode.starmap_line.visible = !data.is_special
        this.viewNode.superstar_line.visible = data.is_special
    }
}

class StarMapItem extends fgui.GComponent {
    private viewNode = {
        ItemCell:<ItemCell>null,
        enough_num:<fgui.GLabel>null,
        no_enough_num:<fgui.GLabel>null,
        ItemName:<fgui.GLabel>null,
    };
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data:any) {
        if(data == null)
        {
            return 
        }
        this.data = data
        this.viewNode.ItemCell.SetData(Item.Create({item_id:data.item_id}))
        let num = BagData.Inst().getItemNum(data.item_id)

        this.viewNode.enough_num.visible = num >= data.cost_num
        this.viewNode.no_enough_num.visible = num < data.cost_num

        UH.SetText(this.viewNode.enough_num, num+"/"+data.cost_num);
        UH.SetText(this.viewNode.no_enough_num, num +"/"+data.cost_num);
        UH.SetText(this.viewNode.ItemName,Item.GetName(data.item_id))
    }
}