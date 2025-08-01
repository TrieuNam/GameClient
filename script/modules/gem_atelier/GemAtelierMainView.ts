import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { Item } from 'modules/bag/ItemData';
import { BaseItemGB } from 'modules/common/BaseItem';
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { QualityColorOLStr } from 'modules/common/ColorEnum';
import { ICON_TYPE } from 'modules/common/CommonEnum';
import { AttrListName, Language } from 'modules/common/Language';
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard5Tab } from 'modules/common_board/CommonBoard5';
import { CommonBoardCC } from 'modules/common_board/CommonBoardCC';
import { GetWayData } from 'modules/getway/GetWayData';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { ItemInfoView } from 'modules/item_info/ItemInfoView';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { RoleAttrView } from 'modules/role/RoleAttrView';
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';
import { AttrHelper } from '../../helpers/AttrHelper';
import { TextHelper } from '../../helpers/TextHelper';
import { UH } from '../../helpers/UIHelper';
import { GemFixIconCfg, GemIconCfg } from './GemAtelierConfig';
import { GemAtelierData } from './GemAtelierData';
import { GemAtelierGemChangeView } from './GemAtelierGemChangeView';
import { GemAtelierGemUpView } from './GemAtelierGemUpView';
import { GemAtelierInsetView } from './GemAtelierInsetView';

//屏蔽以下图纸    图纸id
export let drawingShield = [
    58012, 58013, 58014, 58015,
    58016, 58017, 58018, 58019,
    58020, 58021, 58022, 58013, 58024
]

@BaseView.registView
export class GemAtelierMainView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelier",
        ViewName: "GemAtelierMainView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoardCC>null,
        BtnInset: <fgui.GButton>null,
        BtnGemChange: <fgui.GButton>null,
        BtnGemUp: <fgui.GButton>null,
        RecipeList: <fgui.GList>null,
        TagList: <fgui.GList>null,
        BtnRecipeDetail: <fgui.GButton>null,
        RecipeName: <fgui.GLabel>null,
        GemShow: <GemMainGemShow>null,
        RecipeLevel: <fgui.GLabel>null,
        RecipeAttr: <fgui.GList>null,
        eff_pos: <UIEffectShow>null,
        DiscountsTab: <fgui.GLabel>null,
    }

    protected extendsCfg = [
        { ResName: "GemMainAttr", ExtendsClass: GemMainAttr },
        { ResName: "GemFix", ExtendsClass: MainGemFixCell },
        { ResName: "RecipeItem", ExtendsClass: GemMainRecipeItem },
        { ResName: "BtnTag", ExtendsClass: GemMainTagItem },
        { ResName: "GemShow", ExtendsClass: GemMainGemShow },
        { ResName: "GemFixShow", ExtendsClass: MainGemFixShow },
    ];
    private showing_id: number
    private show_type: number
    private show_list: any
    InitData() {
        this.viewNode.Board.SetData(new BoardData(GemAtelierMainView, Language.GemAtelier.Title, 17))
        this.viewNode.Board.SetCoreMark(CoreCrisisType.Gem)
        this.viewNode.TagList.visible = false;//屏蔽特殊宝石
        this.viewNode.TagList.SetData(GemAtelierData.Inst().GetMainTagList())
        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM, this.OnClickTag, this);
        this.viewNode.TagList.selectedIndex = 0
        this.show_type = 0

        this.viewNode.BtnInset.onClick(this.OnClickInset, this);
        this.viewNode.BtnGemChange.onClick(this.OnClickChange, this);
        this.viewNode.BtnGemUp.onClick(this.OnClickUp, this);
        this.viewNode.BtnRecipeDetail.onClick(this.OnClickRecipeDetail, this);
        this.viewNode.RecipeList.on(fgui.Event.CLICK_ITEM, this.OnClickRecipe, this);
        this.flushGemDrawList(true)

        this.viewNode.RecipeList.selectedIndex = 0
        this.showing_id = 0
        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushGemDrawList.bind(this, false), "needflush");
        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.ShowDrawUpEffect.bind(this, false), "show_eff");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        GuideCtrl.Inst().AddGuideUi("GemAtelierMainBtnInset", this.viewNode.BtnInset);

        GemAtelierData.Inst().OpenedView()
        this.flushInfoPanel()
    }
    CloseCallBack() {
        GuideCtrl.Inst().ClearGuideUi("GemAtelierMainBtnInset");
        GuideCtrl.Inst().ForceStop();
    }
    private flushGemDrawList(init_flag: boolean) {
        this.show_list = GemAtelierData.Inst().GetGemDrawingList(this.show_type)
        this.viewNode.RecipeList.SetData(this.show_list)

        let oper_id = GemAtelierData.Inst().flush_info.oper_draw_id
        if (init_flag) {
            this.showing_id = this.show_list[0].drawing_id
            this.viewNode.RecipeList.selectedIndex = 0
        }
        else {
            this.showing_id = oper_id
            for (let i = 0; i < this.show_list.length; i++) {
                if (this.show_list[i].drawing_id == oper_id) {
                    this.viewNode.RecipeList.selectedIndex = i
                    break
                }
            }
        }
    }

    private flushInfoPanel() {
        let detail = GemAtelierData.Inst().GetGemDetail(this.showing_id)
        UH.SetText(this.viewNode.RecipeName, TextHelper.ColorStr(detail.name, QualityColorOLStr[detail.color]))
        UH.SetText(this.viewNode.RecipeLevel, Language.GemAtelier.LevelShow + detail.level)

        this.viewNode.GemShow.SetData({ draw_id: this.showing_id })
        this.viewNode.GemShow.FlushGrid()

        let ret_list = GemAtelierData.Inst().GetDrawsCanedAttrList(this.showing_id)
        this.viewNode.BtnRecipeDetail.grayed = ret_list.length == 0
        this.viewNode.RecipeAttr.SetData(GemAtelierData.Inst().GetDrawsAttrList(this.showing_id))
        // this.viewNode.RecipeAttr.grayed = true

        this.viewNode.Board.FlushCore()

        this.viewNode.BtnInset.visible = !GemAtelierData.Inst().IsDrawMax(this.showing_id);
        this.flushDiscounts();
    }

    private flushDiscounts() {
        this.viewNode.DiscountsTab.visible = GemAtelierData.Inst().IsDiscounts() && !GemAtelierData.Inst().IsDrawMax(this.showing_id); 
    }

    private OnClickInset() {
        let detail = GemAtelierData.Inst().GetGemDetail(this.showing_id)
        if (detail.level == 0) {
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.DrawUnAct)
            return
        }
        // 取即将升上去的等级
        let check_level = detail.level + 1
        if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Gem, check_level)) {
            fgui.DragDropManager.inst.cancel()

            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitForGemTips, Language.CoreCrisis.CoreName[CoreCrisisType.Gem]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.Gem })
            return
        }

        ViewManager.Inst().OpenView(GemAtelierInsetView, {
            show_id: this.showing_id
        })
    }

    private OnClickChange() {
        ViewManager.Inst().OpenView(GemAtelierGemChangeView)
    }

    private OnClickUp() {
        ViewManager.Inst().OpenView(GemAtelierGemUpView)
    }

    private OnClickRecipeDetail() {
        let detail = GemAtelierData.Inst().GetGemDetail(this.showing_id)
        if (detail.level == 0) {
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.DrawUnAct)
            return
        }

        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: GemAtelierData.Inst().GetDrawsCanedAttrList(this.showing_id),
        })

        // GemAtelierData.Inst().ForceShowEff()
    }

    private OnClickTag(item: CommonBoard5Tab) {
        // if(GemAtelierData.Inst().CheckDrawTagEffect(item.GetData().type)) {
        //     PublicPopupCtrl.Inst().Center(Language.GemAtelier.LackSpError)
        //     this.viewNode.TagList.selectedIndex = this.show_type
        //     return 
        // }

        this.viewNode.TagList.selectedIndex = item._data.index
        this.show_type = item._data.index
        this.viewNode.RecipeList.selectedIndex = 0

        this.flushGemDrawList(false)
        if (this.show_list[0].level > 0) {
            this.showing_id = this.show_list[0].drawing_id
        }
        this.flushInfoPanel()
    }

    private OnClickRecipe(item: GemMainRecipeItem) {
        if (item.GetData().level == 0) {
            let co = Item.GetConfig(item.GetData().item_id);
            let list = GetWayData.Inst().GetWayList(co.get_way)

            PublicPopupCtrl.Inst().Center(item.GetData().is_ts == 1 ?
                TextHelper.Format(Language.GemAtelier.LackSpError, co.name, list[0].desc)
                : TextHelper.Format(Language.GemAtelier.LevelError, co.name, list[0].desc))
            // this.viewNode.RecipeList.selectedIndex = this.showing_id
            // return

            let show_call = Item.Create({ item_id: item.GetData().item_id, num: 1 })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
        }

        this.showing_id = item.GetData().drawing_id

        this.flushInfoPanel()
    }

    private ShowDrawUpEffect() {

    }
}

export class GemMainGemShow extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        Recipe: <fgui.GLoader>null,
    }
    private GemFixGrids: { [key: string]: any } = []
    private GemGrids: { [key: string]: any } = []
    protected onConstruct() {
        super.onConstruct();

        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) { return }
        this.data = data
        this.InitGemFixGrids(this.data.draw_id)
        // UH.SpriteName(this.viewNode.Recipe,"GemAtelierInset","draw_"+this.data.draw_id)
    }
    protected onDestroy() {
        this.GemFixGrids = undefined
        this.GemGrids = undefined
    }

    private CreateGemFixs(px: number, py: number, mark_x: number, mark_y: number, draw_id: number, map_show: string) {
        let gem_grid = <MainGemFixCell>fgui.UIPackage.createObject("GemAtelier", "GemFix").asCom;
        let child = this.addChild(gem_grid);
        child.setPosition(px, py);
        gem_grid.touchable = false
        gem_grid.SetData({ map_show: map_show, pos_mark: mark_x + "|" + mark_y, draw_mark: draw_id })
        this.GemFixGrids.push(gem_grid)
    }

    private InitGemFixGrids(draw_id: number) {
        // for(var t_index in this.GemFixGrids){
        //     this.GemFixGrids[t_index].ClearShow()
        // }
        let is_init = this.GemFixGrids.length == 0
        let check_list = GemAtelierData.Inst().CheckDrawPos(draw_id, false)
        for (var index in check_list) {
            // if(check_list[index].fix_show>0){
            if (is_init) {
                this.CreateGemFixs(check_list[index].x_pos, check_list[index].y_pos, check_list[index].x, check_list[index].y, draw_id, GemFixIconCfg["fix_" + check_list[index].fix_show])
            }
            else {
                // let flag_with_empty = false
                for (var t_index in this.GemFixGrids) {
                    if (this.GemFixGrids[t_index].GetPosMark() == check_list[index].x + "|" + check_list[index].y) {
                        this.GemFixGrids[t_index].SetData({ map_show: GemFixIconCfg["fix_" + check_list[index].fix_show], pos_mark: check_list[index].x + "|" + check_list[index].y, draw_mark: draw_id })
                        // flag_with_empty = true
                        break
                    }
                }
                // if(!flag_with_empty){
                //     this.CreateGemFixs(check_list[index].x_pos,check_list[index].y_pos,check_list[index].x,check_list[index].y,draw_id,GemFixIconCfg["fix_"+check_list[index].fix_show])
                // }
            }
            // }
        }
    }

    private CreateGrid(px: number, py: number, gem_id: number, icon_name: string, net_index: number, net_pos: number) {
        let gem_grid = <MainGemFixShow>fgui.UIPackage.createObject("GemAtelier", "GemFixShow").asCom;
        let child = this.addChild(gem_grid);
        child.setPosition(px, py);
        gem_grid.SetData({ icon_name: icon_name, is_empty: false, gem_id: gem_id, net_index: net_index, net_pos: net_pos, isInset: false })
        gem_grid.touchable = false
        this.GemGrids.push(gem_grid)
    }

    public AddNewGrid(px: number, py: number, gem_id: number, icon_name: string, net_index: number, net_pos: number) {
        if (this.GemGrids.length == 0) {
            this.CreateGrid(px, py, gem_id, icon_name, net_index, net_pos)
        }
        else {
            let flag_with_empty = false
            for (var index in this.GemGrids) {
                if (this.GemGrids[index].IsEmpty()) {
                    this.GemGrids[index].SetIsEmpty(false)
                    this.GemGrids[index].visible = true
                    this.GemGrids[index].setPosition(px, py)
                    this.GemGrids[index].SetData({ icon_name: icon_name, is_empty: false, gem_id: gem_id, net_index: net_index, net_pos: net_pos, isInset: false })
                    flag_with_empty = true
                    break
                }
            }
            if (!flag_with_empty) {
                this.CreateGrid(px, py, gem_id, icon_name, net_index, net_pos)
            }
        }
    }

    public FlushGrid() {
        for (var str in this.GemGrids) {
            this.GemGrids[str].SetIsEmpty(true)
            this.GemGrids[str].visible = false
        }
        // let net_draw = GemAtelierData.Inst().GetTestSCGemInfo({draw_id:this.data.draw_id})
        let net_draw = GemAtelierData.Inst().GetNetGemInfo({ draw_id: this.data.draw_id })
        for (var index in net_draw) {
            if (net_draw[index].pos > 0) {
                let px = Math.floor(net_draw[index].pos % 100) * GemAtelierData.Inst().CheckSize
                let py = Math.floor(net_draw[index].pos / 100) * GemAtelierData.Inst().CheckSize
                let gem_id = Item.GetConfig(net_draw[index].itemId).param
                this.AddNewGrid(px, py, gem_id, GemIconCfg["id_" + gem_id], Number(index), net_draw[index].pos)
            }
        }
    }
}

export class GemMainAttr extends fgui.GComponent {
    private viewNode = {
        attr_name: <fgui.GLabel>null,
        attr_value: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();

        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        UH.SetText(this.viewNode.attr_name, AttrListName[data.att_type]);
        UH.SetText(this.viewNode.attr_value, AttrHelper.Percent(data.att_type, data.att_value));
    }
}

// 转作图纸拼块
export class MainGemFixCell extends fgui.GComponent {
    private pos_mark: string
    private draw_mark: number
    private viewNode = {
        Loader: <fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.pos_mark = data.pos_mark
        this.draw_mark = data.draw_mark

        let flag = data.map_show != null
        this.viewNode.Loader.visible = flag
        if (flag) {
            UH.SpriteName(this.viewNode.Loader, "GemAtelier", data.map_show)
        }

    }

    public GetPosMark() { return this.pos_mark }
    public GetDrawMark() { return this.draw_mark }
    public ClearShow() { this.viewNode.Loader.url = null }
}

export class MainGemFixShow extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        Loader: <fgui.GLoader>null,
    }
    private is_empty = true
    private gem_id = 0
    private net_index = 0
    private net_pos = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        this.data = data
        this.SetGridPic(data.icon_name)
        this.SetIsEmpty(data.is_empty)
        this.SetGemId(data.gem_id)
        this.SetNetIndex(data.net_index)
        this.SetNetPos(data.net_pos)
    }
    public SetGridPic(icon_name: string) { // LogError("asd ",this.data.isInset)
        UH.SpriteName(this.viewNode.Loader, (this.data.isInset ? "GemAtelierInset" : "GemAtelier"), icon_name)
    }
    public SetIsEmpty(flag: boolean) { this.is_empty = flag }
    public SetGemId(gem_id: number) { this.gem_id = gem_id }
    public GetGemId() { return this.gem_id }
    public IsEmpty() { return this.is_empty }
    public SetNetIndex(net_index: number) { this.net_index = net_index }
    public GetNetIndex() { return this.net_index }
    public SetNetPos(net_pos: number) { this.net_pos = net_pos }
    public GetNetPos() { return this.net_pos }
}

export class GemMainTagItem extends BaseItemGB {
    protected viewNode = {
        title: <fgui.GLabel>null,
        selecttitle: <fgui.GLabel>null,
    };
    public SetData(data: any) {
        this._data = data;
        if (data == null) { return }
        UH.SetText(this.viewNode.title, data.name);
        UH.SetText(this.viewNode.selecttitle, data.name);
    }
}

export class GemMainRecipeItem extends BaseItemGB {
    private mark_level: number
    private mark_id: number
    protected viewNode = {
        Selected: <fgui.GImage>null,
        Locked: <fgui.GGroup>null,
        LevelShow: <fgui.GGroup>null,
        LevelStr: <fgui.GLabel>null,
        Name: <fgui.GLabel>null,
        DrawQua: <fgui.GLoader>null,
        DrawIcon: <fgui.GLoader>null,
        eff: <UIEffectShow>null,
        // ItemCall:<ItemCell>null,
    };
    public SetData(data: any) {
        this._data = data;
        if (data == null) { return }

        if (this.mark_level == null && this.mark_id == null) {
            this.mark_level = data.level
            this.mark_id = data.item_id
        }
        else if (data.level > this.mark_level && this.mark_id == data.item_id) {
            this.EffShow()
        }
        else if (this.mark_id != data.item_id) {
            this.mark_level = data.level
            this.mark_id = data.item_id
        }


        this.viewNode.Locked.visible = data.level == 0
        this.viewNode.LevelShow.visible = data.level > 0
        UH.SetText(this.viewNode.LevelStr, Language.GemAtelier.LvShow + data.level);
        let name = Item.GetName(data.item_id)
        UH.SetText(this.viewNode.Name, name);
        UH.SpriteName(this.viewNode.DrawQua, "CommonAtlas", "PinZhi" + data.color)
        UH.SetIcon(this.viewNode.DrawIcon, Item.GetIconId(data.item_id), ICON_TYPE.ITEM)
        // this.viewNode.ItemCall.SetData(Item.Create({item_id:data.item_id }, { is_num: false, is_click: false }))
    }

    public EffShow() {
        this.viewNode.eff.PlayEff(4164015)
    }
    public SetSelect(flag: boolean) { this.viewNode.Selected.visible = flag }
}


