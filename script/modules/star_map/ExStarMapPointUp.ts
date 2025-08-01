import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { AttrListName, Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { ItemCell } from "modules/extends/ItemCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from '../../helpers/TextHelper';
import { UH } from "../../helpers/UIHelper";
import { COLORSTR } from '../common/ColorEnum';
import { StarMapCtrl, STAR_MAP_REQ_TYPE } from "./StarMapCtrl";
import { StarMapData } from "./StarMapData";

@BaseView.registView
export class ExStarMapPointUp extends BaseView {
    private view_param: any
    private level_mark: boolean
    private pop_list: any
    private one_key_param:any
    protected viewRegcfg = {
        UIPackName: "StarMapExtra",
        ViewName: "ExStarMapPointUp",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        SpTitle: <fgui.GTextField>null,
        SpTitleShow: <fgui.GGroup>null,
        CostDesc: <fgui.GTextField>null,
        CostCount: <fgui.GTextField>null,
        BtnUp: <fgui.GButton>null,
        CostCell: <ItemCell>null,
        AttrList1: <fgui.GList>null,
        AttrList2: <fgui.GList>null,
        NoNext: <fgui.GTextField>null,
        Name: <fgui.GTextField>null,
        CurType: <fgui.GTextField>null,
        NextType: <fgui.GTextField>null,
        CurAdd: <fgui.GTextField>null,
        NextAdd: <fgui.GTextField>null,
        MaxLevel: <fgui.GTextField>null,
        NextGroup: <fgui.GGroup>null,
        GgLvupDetails: <fgui.GGroup>null,
        ImgMaxLv: <fgui.GImage>null,
        BtnClose: <fgui.GButton>null,

        OneKeyCheck:<fgui.GGraph> null,
        OneKey:<fgui.GGroup> null,
        is_one_key:<fgui.GImage> null,
    };


    InitData(param: any) {
        this.viewNode.Board.SetData(new BoardData(ExStarMapPointUp, param.is_special ? null : param.name));
        this.view_param = param

        this.viewNode.BtnUp.onClick(this.OnClickUp.bind(this));
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this));
        this.viewNode.OneKeyCheck.onClick(this.OnClickOneKeyCheck.bind(this));
        this.viewNode.BtnUp.title = param.btn_name

        this.viewNode.Board.SetTitleShow(!param.is_special)
        this.viewNode.SpTitleShow.visible = param.is_special
        UH.SetText(this.viewNode.CostDesc, param.btn_name + Language.StarMap.Cost)


        GuideCtrl.Inst().AddGuideUi("StarMapPointBtnAct", this.viewNode.BtnUp);

        this.viewNode.OneKey.visible = this.view_param.is_super
        this.AddSmartDataCare(StarMapData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "OtherChange");
        this.flushInfoPanel()
    }

    flushInfoPanel() {
        let net_info = this.view_param.is_super ? StarMapData.Inst().GetSuperStarNetInfo(this.view_param.index) : StarMapData.Inst().GetStarMapNetInfo(this.view_param.type, this.view_param.grade)

        if (this.view_param.is_super) {
            let param = StarMapData.Inst().GetSuperStarPointUpParam(this.view_param.index)
            if(this.IsOneKey())
            {
                this.one_key_param = StarMapData.Inst().GetSuperStarPointUpOneKeyParam(this.view_param.index)
            }
            
            this.view_param = param
            this.viewNode.BtnUp.title = param.btn_name
            let cur_attr = param.cur_attr_list[0]
            let nexr_attr = param.next_attr_list[0]
            let is_init = cur_attr == null
            let is_max = nexr_attr == null
            if (is_init) {
                cur_attr = {
                    attr_name: nexr_attr.attr_name,
                    attr_value: 0,
                    is_special: nexr_attr.is_special,
                    value: 0
                }
            }
            UH.SetText(this.viewNode.CurType, AttrListName[cur_attr.attr_name] + ":")
            UH.SetText(this.viewNode.CurAdd, cur_attr.attr_value);

            if (is_max) {
                cur_attr = {
                    attr_name: cur_attr.attr_name,
                    attr_value: cur_attr.attr_value,
                    is_special: cur_attr.is_special,
                    value: cur_attr.value
                }
            } else {
                UH.SetText(this.viewNode.NextType, AttrListName[nexr_attr.attr_name] + ":")
                UH.SetText(this.viewNode.NextAdd, nexr_attr.attr_value);
            }

            this.viewNode.MaxLevel.visible = is_max
            this.viewNode.NextGroup.visible = !is_max

            UH.SetText(this.viewNode.CostDesc, param.btn_name + Language.StarMap.Cost)
            if (param.is_special) {
                UH.SetText(this.viewNode.SpTitle, param.name)
            }
            else {
                this.viewNode.Board.SetTitle(param.name)
            }
            
        }
        else {
            let param = StarMapData.Inst().GetStarMapPointUpParam(
                this.view_param.type,
                this.view_param.grade,
                this.view_param.id,
                net_info[this.view_param.id].level
            )

            this.view_param = param
            this.viewNode.BtnUp.title = param.btn_name
            let cur_attr = param.cur_attr_list[0]
            let nexr_attr = param.next_attr_list[0]
            let is_init = cur_attr == null
            let is_max = nexr_attr == null
            if (is_init) {
                cur_attr = {
                    attr_name: nexr_attr.attr_name,
                    attr_value: 0,
                    is_special: nexr_attr.is_special,
                    value: 0
                }
            }
            UH.SetText(this.viewNode.CurType, AttrListName[cur_attr.attr_name] + ":")
            UH.SetText(this.viewNode.CurAdd, cur_attr.attr_value);

            if (is_max) {
                cur_attr = {
                    attr_name: cur_attr.attr_name,
                    attr_value: cur_attr.attr_value,
                    is_special: cur_attr.is_special,
                    value: cur_attr.value
                }
            } else {
                UH.SetText(this.viewNode.NextType, AttrListName[nexr_attr.attr_name] + ":")
                UH.SetText(this.viewNode.NextAdd, nexr_attr.attr_value);
            }

            this.viewNode.MaxLevel.visible = is_max
            this.viewNode.NextGroup.visible = !is_max

            UH.SetText(this.viewNode.CostDesc, param.btn_name + Language.StarMap.Cost)
            this.viewNode.Board.SetTitle(param.name)
        }

        this.view_param.cost_list = this.view_param.cost_list
        this.view_param.send_data = this.view_param.send_data

        this.viewNode.BtnUp.grayed = this.CheckCanAct()
        if (this.view_param.cost_list[0]) {
            this.viewNode.CostCell.SetData(Item.Create({ item_id: this.view_param.cost_list[0].item_id }, { is_click: true }))
            let item_num = Item.GetNum(this.view_param.cost_list[0].item_id)
            let cost_num = this.IsOneKey() && this.one_key_param != null ? this.one_key_param.cost_num : this.view_param.cost_list[0].cost_num
            let item_color = item_num >= cost_num ? COLORSTR.Green4 : COLORSTR.Red1
            
            UH.SetText(this.viewNode.Name, Item.GetName(this.view_param.cost_list[0].item_id))
            UH.SetText(this.viewNode.CostCount, TextHelper.ColorStr(item_num + "/" + cost_num, item_color))
        }


        if (this.level_mark) {
            if (this.view_param.is_super) {
                if (net_info > 1) {
                    AudioManager.Inst().Play(AudioTag.ShengJi)
                }
                else {
                    AudioManager.Inst().Play(AudioTag.JiHuo)
                }
            }
            else {
                if (net_info[this.view_param.id].level > 1) {
                    AudioManager.Inst().Play(AudioTag.ShengJi)
                }
                else {
                    AudioManager.Inst().Play(AudioTag.JiHuo)
                }
            }


            for (var index in this.pop_list) {
                let info = this.pop_list[index]
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[info.att_type]} ${info.fuhao}${AttrHelper.Percent(info.att_type, info.att_add)}`, info.type)
            }
            this.level_mark = false
        }
    }
    OnClickClose() {
        ViewManager.Inst().CloseView(ExStarMapPointUp)
    }
    OnClickUp() {
        let check_param = this.ItemCheck(this.view_param.cost_list)
        if (!check_param.enough) {
            let show_call = Item.Create({ item_id: check_param.item_id, num: check_param.need })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.StarMap.ItemLack)
            return
        }
        if (this.view_param.level >= 10) {
            PublicPopupCtrl.Inst().Center(Language.StarMap.StarPointMax)
            return
        }


        let check_level = this.view_param.level + 1
        if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level)) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips, Language.CoreCrisis.CoreName[CoreCrisisType.StarMap]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.StarMap })
            return
        }

        if (!this.view_param.is_super) {
            if (!StarMapData.Inst().GetCanLevelUp(this.view_param.type, this.view_param.grade, this.view_param.level)) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.StarMap.PointUpLevelError, this.view_param.level))
                return
            }

            if (!StarMapData.Inst().GetStarMapPointCanOper(this.view_param.type, this.view_param.grade, this.view_param.id)) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.StarMap.LinkLevelError, this.view_param.level + 1));
                return
            }

        } else {
            if (!StarMapData.Inst().GetSuperStarPointCanOper(this.view_param.index) && !this.IsOneKey()) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(
                    Language.StarMap.LinkLevelError, this.view_param.level + 1));
                return
            }
        }


        this.level_mark = true

        if (this.IsOneKey() && this.one_key_param != null) {
            for (var i in this.one_key_param.point_list) {
                StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.BIG_LEVEL_UP,
                    { param1: this.one_key_param.point_list[i], })
            }
        }
        else 
        {
            StarMapCtrl.Inst().SendCSStarMapReq(this.view_param.is_super ? STAR_MAP_REQ_TYPE.BIG_LEVEL_UP : STAR_MAP_REQ_TYPE.LEVEL_UP, {
                param1: this.view_param.send_data.param1,
                param2: this.view_param.send_data.param2,
                param3: this.view_param.send_data.param3,
            })
        }


        if(!this.IsOneKey())
        {
            let fuhao = "+"
            let type = 1
            this.pop_list = []
            for (let i = 0; i < this.view_param.next_attr_list.length; i++) {
                let att_type = this.view_param.next_attr_list[i].attr_name;
                let att_add = this.view_param.next_attr_list[i].value
                if (this.view_param.cur_attr_list[i]) {
                    att_add = this.view_param.next_attr_list[i].value - this.view_param.cur_attr_list[i].value
                }
                let info = {
                    att_type: att_type,
                    fuhao: fuhao,
                    att_add: att_add,
                    type: type,
                }
                this.pop_list.push(info)
            }
        }
        else{
            StarMapData.Inst().JumpAttrFromOneKeyBySuper(this.one_key_param.point_list)
        }

        if (!this.view_param.is_super) {
            ViewManager.Inst().CloseView(ExStarMapPointUp)
        }
    }

    private OnClickOneKeyCheck()
    {
        this.viewNode.is_one_key.visible = !this.viewNode.is_one_key.visible

        this.flushInfoPanel()
    }

    public IsOneKey()
    {
        return this.viewNode.is_one_key.visible
    }

    private CheckCanAct() {
        if (!this.view_param.is_super) {
        
            if (!StarMapData.Inst().GetCanLevelUp(this.view_param.type, this.view_param.grade, this.view_param.level)) {
                return true
            }

            if (!StarMapData.Inst().GetStarMapPointCanOper(this.view_param.type, this.view_param.grade, this.view_param.id)) {
                return true
            }

        } else {
            if (!StarMapData.Inst().GetSuperStarPointCanOper(this.view_param.index) && !this.IsOneKey()) {
                return true
            }
        }
        return false
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    private ItemCheck(data: any) {
        for (let i = 0; i < data.length; i++) {
            let num = BagData.Inst().getItemNum(data[i].item_id)
            let cost_num = i == 0 ? (this.IsOneKey() ?this.one_key_param.cost_num : data[i].cost_num) :data[i].cost_num

            if (num < cost_num) {
                return {
                    enough: false,
                    item_id: data[i].item_id,
                    need: cost_num - num,
                }
            }
        }

        return {
            enough: true,
            item_id: 0,
            need: 0,
        }
    }

    CloseCallBack() {
        GuideCtrl.Inst().ClearGuideUi("StarMapPointBtnAct");
        GuideCtrl.Inst().ForceStop();
    }
}