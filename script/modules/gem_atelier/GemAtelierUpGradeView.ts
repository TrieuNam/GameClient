import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { UIObjectFactory, UIPackage } from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ViewManager } from "manager/ViewManager";
import { BoardData } from 'modules/common_board/BoardData';
import { Language } from 'modules/common/Language';
import { GemMainTagItem } from './GemAtelierMainView';
import { GemAtelierData } from './GemAtelierData';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { BagData } from 'modules/bag/BagData';
import { ItemCell } from 'modules/extends/ItemCell';
import { Item } from 'modules/bag/ItemData';
import { UH } from '../../helpers/UIHelper';
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from './GemAtelierCtrl';
import { GemLevelShowCell } from './GemAtelierInsetView';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { GemAtelierMixSureView } from './GemAtelierMixSureView';

@BaseView.registView 
export class GemAtelierUpGradeView extends BaseView {
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "GemAtelierUpGrade",
        ViewName: "GemAtelierUpGradeView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board:<CommonBoard3>null,
        TagList:<fgui.GList>null,
        GemList:<fgui.GList>null,
        BtnSure:<fgui.GButton>null,
        TargetName:<fgui.GLabel>null,
        Target:<UpGradeStuff>null,
        MainStuff:<UpGradeStuff>null,
        SubStuff:<UpGradeStuff>null,
    }

    protected extendsCfg = [
        { ResName: "BtnGradeUpItem", ExtendsClass: BtnGradeUpItem },
        { ResName: "BtnTag" ,ExtendsClass: GemMainTagItem },
        { ResName: "UpGradeStuff",ExtendsClass: UpGradeStuff },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
    //     { ResName: "MountShowCell", ExtendsClass: MountShowCell },
    ];
    private select_list:any
    private show_list:any
    private show_type:number
    private virtual:boolean
    private grade_mark:boolean
    InitData() {
        GemAtelierData.Inst().SetUpGradeView(this)
        this.viewNode.Board.SetData(new BoardData(GemAtelierUpGradeView, Language.GemAtelier.UpGradeTitle ))
        
        this.viewNode.TagList.SetData(GemAtelierData.Inst().GetMainTagList())
        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM,this.OnClickTag,this);
        this.viewNode.TagList.selectedIndex = 0
        this.show_type = 0

        this.select_list = []
        this.viewNode.GemList.on(fgui.Event.CLICK_ITEM,this.OnClickGemItem,this);
        this.viewNode.GemList.setVirtual()
        this.viewNode.BtnSure.onClick(this.OnClickSure, this);
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "GemItemChange");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushGemList.bind(this), "GemItemChange");
        
        this.flushGemList()
        this.flushInfoPanel()
        // this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        // this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushGemList.bind(this), "needflush");

    }

    private flushInfoPanel() {
        let flag_0 = this.select_list[0] != null
        let info_0 = {
            item_id: flag_0 ? this.select_list[0].item_id:0 ,
            selectid:flag_0 ?this.select_list[0].show_index:-1,
            pos:0,
        }
        this.viewNode.Target.SetData(info_0)

        let flag_1 = this.select_list[1] != null
        let info_1 = {
            item_id: flag_1 ? this.select_list[1].item_id:0 ,
            selectid:flag_1 ?this.select_list[1].show_index:-1,
            pos:1,
        }
        this.viewNode.MainStuff.SetData(info_1)

        let flag_2 = this.select_list[2] != null
        let info_2 = {
            item_id: flag_2 ? this.select_list[2].item_id:0 ,
            selectid:flag_2 ?this.select_list[2].show_index:-1,
            pos:2,
        }
        this.viewNode.SubStuff.SetData(info_2)

    }
    
    private flushGemList() {
        for(let i = 0;i<3;i++)
        {
            this.OnClickCha(i)
        }
        this.show_list = GemAtelierData.Inst().GetUpGradeGemsList(this.show_type)
        this.viewNode.GemList.SetData(this.show_list)

        // if(this.grade_mark){
        //     AudioManager.Inst().Play(AudioTag.ShengJi)
        //     this.grade_mark = false
        // }
    }

    private OnClickTag(item:GemMainTagItem) {
        if(GemAtelierData.Inst().CheckUpGradeTagEffect(item.GetData().type)) {
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.GemTagError)
            this.viewNode.TagList.selectedIndex = this.show_type
            return 
        }

        this.viewNode.TagList.selectedIndex = item.GetData().type
        this.show_type = item.GetData().type

        this.flushGemList()
    }

    private OnClickGemItem(item:BtnGradeUpItem) {
        let selects = this.viewNode.GemList.getSelection()

        if(selects.length > 3){
            for(var index in selects)
            {
                if(selects[index] == item.data.show_index)
                {
                    this.viewNode.GemList.removeSelection(selects[index])
                }
            }
            return
        }

        let neo_select = this.show_list[item.GetData().show_index]
        if (this.select_list[0] != null && this.select_list[0].item_id > 0) {
            if (neo_select.level != this.select_list[0].level) {
                PublicPopupCtrl.Inst().Center(Language.GemAtelier.LevelGradeError)

                for (var index in selects) {
                    if (selects[index] == item.data.show_index) {
                        this.viewNode.GemList.removeSelection(selects[index])
                    }
                }
                return
            }
        }

        let oper_type = 1 // 1 抛出，0 放入
        for(var index in selects){
            if(selects[index] == item.data.show_index)
            {
                oper_type = 0
            }
        }

        if(oper_type == 1)
        {
            for(let i = 0;i<3;i++){
                if(this.select_list[i] != null && this.select_list[i].show_index == item.data.show_index){
                    this.select_list[i] = null
                    if(i == 0){
                        for(var index in selects){
                            this.viewNode.GemList.removeSelection(selects[index])
                        }

                        this.select_list[1] = null
                        this.select_list[2] = null
                    }
                    break
                }
            }
        }
        else 
        {
            for(let i = 0;i<3;i++){
                if(this.select_list[i] == null){
                    this.select_list[i] = neo_select
                    break
                }
            }
        }
    
        
        this.flushInfoPanel()
    }

    private OnClickSure() {
        let selects = this.viewNode.GemList.getSelection()
        if(selects.length < 3){
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.LackItemError)
            return 
        }

        // this.grade_mark = true
        let mark = GemAtelierData.Inst().GetupGradeTarget(this.select_list[0])
        let param = {
            ready_item:mark.ready_item,
            target_item:mark.target_item,
            select_list:this.select_list,
        }
        ViewManager.Inst().OpenView(GemAtelierMixSureView,param);
    }

    private OnClickCha(pos:number) {
        let selects = this.viewNode.GemList.getSelection()

        let oper = this.select_list[pos]
        if (oper != null ) {
            if(pos == 0){
                for (let index = 0; index < 3; index++) {
                    for(var s_index in selects){
                        if( this.select_list[index] != null && selects[s_index] == this.select_list[index].show_index){
                            this.viewNode.GemList.removeSelection(selects[s_index])
                            this.select_list[index] = null
                        }
                    }
                }
            }
            else{        
                for(var index in selects)
                {
                    if(selects[index] == oper.show_index){
                        this.viewNode.GemList.removeSelection(selects[index])
                        this.select_list[pos] = null
                    }
                }
            }
        }
        this.flushInfoPanel()
    }
}

export class UpGradeStuff extends fgui.GComponent {
    private viewNode = {
        ItemCall:<ItemCell>null,
        BtnCha:<fgui.GButton>null,
        TargetName:<fgui.GLabel>null,
        plus:<fgui.GImage>null,
        Empty:<fgui.GImage>null,
        EmptyTips:<fgui.GLabel>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnCha.onClick(this.ClickCha,this);
    }
    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data
        this.viewNode.ItemCall.SetData(Item.Create({item_id:data.item_id }, { is_num: false, is_click: false }))
        let flag = data.item_id > 0 
        UH.SetText(this.viewNode.TargetName,flag ? Item.GetName(data.item_id): "" )

        this.viewNode.Empty.visible = !flag
        this.viewNode.plus.visible = !flag
        this.viewNode.BtnCha.visible = flag
        this.viewNode.EmptyTips.visible = !flag
    }

    private ClickCha() {
        GemAtelierData.Inst().GetUpGradeView().OnClickCha(this.data.pos)
    }

}

export class BtnGradeUpItem extends fgui.GButton {
    private viewNode = {
        ItemCall:<ItemCell>null,
        // LevelStr:<fgui.GLabel>null,
        NumStr:<fgui.GLabel>null,
        level_list:<fgui.GList>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data
        this.viewNode.ItemCall.SetData(Item.Create({item_id:data.item_id }, { is_num: false, is_click: false }))
        // UH.SetText(this.viewNode.LevelStr,Language.GemAtelier.LvShow + data.level)
        UH.SetText(this.viewNode.NumStr,Item.GetNum(data.item_id))
        let levels = GemAtelierData.Inst().GetGemLevelList(data.level)
        this.viewNode.level_list.SetData(levels)
    }
    public GetData() {
        return this.data
    }
}