import { CfgAttrUp } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { CommonGetView2 } from "modules/CommonGet2/CommonGetView2";
import { CommGetData, CommGetType } from "modules/common_account/CommonGetView";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from 'modules/extends/RedPoint';
import { ItemInfoView } from 'modules/item_info/ItemInfoView';
import { MountConfigQuaBgName } from "modules/mount/MountConfig";
import { MOUNR_REQ_TYPE, MountCtrl } from "modules/mount/MountCtrl";
import { MountData } from "modules/mount/MountData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';
import { UIModelShow } from 'modules/scene_obj_spine/UIModelShow';
import { ResPath } from 'utils/ResPath';
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class MountAwakeView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountExtra",
        ViewName: "MountAwake",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected extendsCfg = [
        { ResName: "AttrChange", ExtendsClass: AttrChange },
        { ResName: "MountShowCell", ExtendsClass: MountShowCell },
    ];

    private showing_id: number
    private mount_list: any;
    private grade_up_item_id: number
    private grade_up_limit: number
    private awake_mark: boolean
    private detail_mark:any
    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        MountSelect: <fgui.GList>null,
        MountName: <fgui.GLabel>null,
        WakeShow: <fgui.GLabel>null,
        MountPic: <fgui.GLoader>null,
        ItemCall: <ItemCell>null,
        CostNum: <fgui.GLabel>null,
        BtnWake: <fgui.GButton>null,
        attr_list: <fgui.GList>null,
        AwakeMax: <fgui.GGroup>null,
        AwakeUp: <fgui.GGroup>null,
        uiModelShow: <UIModelShow>null,
        uiEffectShow: <UIEffectShow>null,
        RedPoint: <RedPoint>null,
    }
    InitData(data: any) {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        this.viewNode.MountSelect.on(fgui.Event.CLICK_ITEM, this.ClickMount, this);
        this.showing_id = data.link_id
        this.flushMountList(true, data.link_id)

        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushMountList.bind(this, false), "needflush");

        this.viewNode.BtnWake.onClick(this.BtnWakeUp.bind(this));

        this.flushInfoPanel()
    }

    private ClickMount(item: MountShowCell) {
        this.showing_id = item.data.id

        this.flushInfoPanel()
    }

    private flushMountList(init_flag: boolean, link_id: number) {
        this.mount_list = MountData.Inst().GetMainMountList()
        this.viewNode.MountSelect.SetData(this.mount_list);

        // let oper_id = init_flag ? (link_id == null? 0 :link_id) : MountData.Inst().flush_info.operid

        // this.showing_id = link_id;
        for (let i = 0; i < this.mount_list.length; i++) {
            if (this.mount_list[i].id == this.showing_id) {
                this.viewNode.MountSelect.selectedIndex = i
                break
            }
        }
    }

    private flushInfoPanel() {
        if (this.showing_id == undefined) { return }
        let detail = MountData.Inst().GetMountDetail(this.showing_id)

        UH.SetText(this.viewNode.MountName, detail.name)
        UH.SetText(this.viewNode.WakeShow, DataHelper.GetDaXie(detail.grade) + Language.Mount.GradeTitle)
        //UH.SpriteName(this.viewNode.MountPic)
        this.viewNode.ItemCall.SetData(Item.Create({ item_id: detail.cur_g_cfg.up_id }))

        this.grade_up_limit = detail.cur_g_cfg.up_num;
        this.grade_up_item_id = detail.cur_g_cfg.up_id;

        let num = BagData.Inst().getItemNum(this.grade_up_item_id);
        let color = num >= this.grade_up_limit ? COLORSTR.Green3 : COLORSTR.Red1
        UH.SetText(this.viewNode.CostNum, TextHelper.ColorStr(num, color) + "/" + this.grade_up_limit)

        let grade_change = MountData.Inst().GetMountGradeChange(this.showing_id)
        this.viewNode.attr_list.SetData(grade_change)

        this.viewNode.AwakeMax.visible = detail.is_max_grade
        this.viewNode.AwakeUp.visible = !detail.is_max_grade

        this.viewNode.uiModelShow.setPath(ResPath.Ride(detail.mount_res));

        this.viewNode.RedPoint.SetNum(detail.awake_red)

        if (this.awake_mark) {
            AudioManager.Inst().Play(AudioTag.JiHuo)
            this.awake_mark = false

            let fuhao = "+"
            let type = 1
            for (let i = 0; i < grade_change.length; i++) {
                let att_type = grade_change[i].att_type;
                let att_add = grade_change[i].att_2_value > 0 ? grade_change[i].att_2_value - grade_change[i].att_1_value : grade_change[i].att_1_value ;
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
            }
        }

        if(this.detail_mark == null || this.detail_mark.name != detail.name)
        {
            this.detail_mark = detail
        }
        else if(this.detail_mark.grade < detail.grade)
        {
            
            let list:CfgAttrUp[] = []
            let length_num = this.detail_mark.is_max_grade ? this.detail_mark.cur_g_cfg.up_att.length : this.detail_mark.next_g_cfg.up_att.length

            for (let i = 0; i < length_num; i++) {
                let vp = new CfgAttrUp(
                    this.detail_mark.is_max_grade ? this.detail_mark.cur_g_cfg.up_att[i].type : this.detail_mark.next_g_cfg.up_att[i].type
                    ,(this.detail_mark.is_max_grade ? this.detail_mark.cur_g_cfg.up_att[i].add : this.detail_mark.next_g_cfg.up_att[i].add)
                     -(this.detail_mark.cur_g_cfg.up_att[i] == null ? 0 : this.detail_mark.cur_g_cfg.up_att[i].add)) 
                
                list.push(vp);
            }

            let get_data = new CommGetData(
                detail.name, 
                list, 
                detail.color, 
                detail.mount_res, 
                CommGetType.Ride, 
                1, 
                detail.cur_g_cfg.up_id,
                null,
                false)

            ViewManager.Inst().OpenView(CommonGetView2,get_data)
            this.detail_mark = detail
        }
    }

    private CloseView() {
        ViewManager.Inst().CloseView(MountAwakeView)
    }

    private BtnWakeUp() {
        let num = BagData.Inst().getItemNum(this.grade_up_item_id);
        if (num < this.grade_up_limit) {
            let show_call = Item.Create({ item_id: this.grade_up_item_id, num: this.grade_up_limit - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.Mount.LackItem);
            return
        }
        this.viewNode.uiEffectShow.PlayEff("4164015");
        this.awake_mark = true
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.GRADE_UP, this.showing_id)
    }
}
export class AttrChange extends fgui.GComponent {
    private viewNode = {
        attr_max: <fgui.GGroup>null,
        attr_change: <fgui.GGroup>null,

        attr_name_max: <fgui.GLabel>null,
        attr_value_max: <fgui.GLabel>null,
        attr_special_max: <fgui.GLabel>null,

        attr_name_1: <fgui.GLabel>null,
        attr_value_1: <fgui.GLabel>null,
        attr_special_1: <fgui.GLabel>null,

        attr_name_2: <fgui.GLabel>null,
        attr_value_2: <fgui.GLabel>null,
        attr_special_2: <fgui.GLabel>null,
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
        this.viewNode.attr_special_max.visible = data.is_special
        this.viewNode.attr_special_1.visible = data.is_special
        this.viewNode.attr_special_2.visible = data.is_special

        this.viewNode.attr_value_1.visible = !data.is_special
        this.viewNode.attr_value_2.visible = !data.is_special

        this.viewNode.attr_max.visible = data.is_max
        this.viewNode.attr_change.visible = !data.is_max

        if (data.is_max) {
            if (data.is_special) {
                UH.SetText(this.viewNode.attr_name_max, data.att_type_str);
                UH.SetText(this.viewNode.attr_value_max, AttrHelper.Percent(data.att_type, data.att_1_value));
            }
            else {
                UH.SetText(this.viewNode.attr_name_max, AttrListName[data.att_type]);
                UH.SetText(this.viewNode.attr_value_max, AttrHelper.Percent(data.att_type, data.att_1_value));
            }
        }
        else {
            if (data.is_special) {
                UH.SetText(this.viewNode.attr_name_1, data.att_type_str);
                UH.SetText(this.viewNode.attr_name_2, data.att_type_str);

                UH.SetText(this.viewNode.attr_special_1, AttrHelper.Percent(data.att_type, data.att_1_value));
                UH.SetText(this.viewNode.attr_special_2, AttrHelper.Percent(data.att_type, data.att_2_value));
            }
            else {
                UH.SetText(this.viewNode.attr_name_1, AttrListName[data.att_type]);
                UH.SetText(this.viewNode.attr_name_2, AttrListName[data.att_type]);

                UH.SetText(this.viewNode.attr_value_1, AttrHelper.Percent(data.att_type, data.att_1_value));
                UH.SetText(this.viewNode.attr_value_2, AttrHelper.Percent(data.att_type, data.att_2_value));
            }

        }
    }
}


export class MountShowCell extends fgui.GButton {
    private viewNode = {
        QuaIcon: <fgui.GLoader>null,
        MountIcon: <fgui.GLoader>null,
        Selected: <fgui.GImage>null,
        locked: <fgui.GGroup>null,
        TST: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
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
        this.viewNode.locked.visible = true
        UH.SetText(this.viewNode.TST, "")//data.id);
        this.viewNode.locked.visible = this.data.grade == 0
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", MountConfigQuaBgName[data.color]);

        var cfg = MountData.Inst().GetHeChengCfg(this.data.id);
        let item_cfg = Item.GetConfig(cfg.hecheng_item_id)
        UH.SetIcon(this.viewNode.MountIcon, cfg.hecheng_item_id, ICON_TYPE.ITEM)

        let num = data.awake_red_num != null ? data.awake_red_num : 0
        this.viewNode.RedPoint.SetNum(num)
    }
}
