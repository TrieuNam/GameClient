import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { UIObjectFactory, UIPackage, GRoot } from 'fairygui-cc';
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ViewManager } from "manager/ViewManager";
import { BoardData } from 'modules/common_board/BoardData';
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { GemAtelierUpGradeView } from './GemAtelierUpGradeView';
import { GemAtelierData } from './GemAtelierData';
import { UH } from '../../helpers/UIHelper';
import { Item } from 'modules/bag/ItemData';
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from './GemAtelierCtrl';
import { GemFixIconCfg, GemIconCfg } from './GemAtelierConfig';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { MysteryShopView } from 'modules/shop/mystery_shop/MysteryShopView';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { QualityColorOLStr, QualityColorStr } from 'modules/common/ColorEnum';
import { TextHelper } from '../../helpers/TextHelper';
import { Timer } from 'modules/time/Timer';
import { BagData } from 'modules/bag/BagData';
import { ShopView } from 'modules/shop/ShopView';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { GemInsetOneKeyOper } from './GemInsetOneKeyOper';
import { GemAtelierDrawOneKeyView } from './GemAtelierDrawOneKeyView';

@BaseView.registView
export class GemAtelierInsetView extends BaseView {
    private show_list: any
    private view_param: any
    private offset = { x: 150, y: 150 } // x:180/2 y:180+30(一格是30)
    private o_screen = { x: 800, y: 1500 }
    private draging_item: any
    public grid_num: number
    private time_timer: any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierInset",
        ViewName: "GemAtelierInsetView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnGemUp: <fgui.GButton>null,
        RecipeName: <fgui.GRichTextField>null,
        GemList: <fgui.GList>null,
        Drager: <fgui.GLoader>null,
        GemShow: <InsetOperGemShow>null,
        checker: <fgui.GImage>null,
        real_checker: <fgui.GImage>null,
        Fullchecker: <fgui.GGraph>null,
        DragOther: <fgui.GGraph>null,
        DragGem: <fgui.GGraph>null,
        DragLimit: <fgui.GGraph>null,
        EmptyShow: <fgui.GGroup>null,
        checkpanel: <fgui.GImage>null,
        total_check: <fgui.GImage>null,
        fix_checker: <fgui.GImage>null,
        BtnShop: <fgui.GButton>null,
        testTxt: <fgui.GLabel>null,
        OneKeyGemOper: <GemInsetOneKeyOper>null,
        BtnOneKey: <fgui.GButton>null,
        DiscountsTab: <fgui.GLabel>null,
    }


    protected extendsCfg = [
        { ResName: "GemInsetItem", ExtendsClass: GemInsetItem },
        { ResName: "OperGemShow", ExtendsClass: InsetOperGemShow },
        { ResName: "GemFixShow", ExtendsClass: InsetGemFixShow },
        { ResName: "DragTrigger", ExtendsClass: DragTrigger },
        { ResName: "GemFix", ExtendsClass: InsetGemFixCell },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
        { ResName: "OneKeyGemOper", ExtendsClass: GemInsetOneKeyOper },
        //     { ResName: "MountShowCell", ExtendsClass: MountShowCell },
    ];

    InitData(param: any) {
        GemAtelierData.Inst().SetInsetView(this)
        this.viewNode.Board.SetData(new BoardData(GemAtelierInsetView, Language.GemAtelier.InsetTitle))
        this.viewNode.Board.SetTitleShow(false);

        this.viewNode.BtnGemUp.onClick(this.OnClickGemUp, this);
        this.viewNode.BtnShop.onClick(this.OnClickShop, this);
        this.viewNode.BtnOneKey.onClick(this.OnClickOneKey, this);
        this.view_param = param

        // this.viewNode.GemList.on(fgui.Event.DRAG_START, this.OnDragGem, this);

        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.flushGemList.bind(this), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushGemList.bind(this), "GemItemChange");

        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.OnClickOneKey.bind(this), "onekey_change");

        this.viewNode.GemShow.on(fgui.Event.DROP, this.onDrop, this);
        this.viewNode.GemShow.SetData({ draw_id: this.view_param.show_id })

        this.flushGemList()
        this.flushInfoPanel()
        this.flushDiscounts()
        this.viewNode.checker.visible = false
        this.viewNode.real_checker.visible = false
        this.viewNode.Fullchecker.visible = false
        this.viewNode.checkpanel.visible = false
        this.viewNode.total_check.visible = false
        this.viewNode.fix_checker.visible = false
        this.viewNode.testTxt.visible = false
        // this.viewNode.GemShow.CheckGrid()
        this.grid_num = 0
    }

    CloseCallBack() {
        GuideCtrl.Inst().ForceStop();

        fgui.DragDropManager.inst.cancel()
        GemAtelierData.Inst().SetInsetView(null)
        GemAtelierData.Inst().ChangeLock(false)
    }

    private flushInfoPanel() {
        let detail = GemAtelierData.Inst().GetGemDetail(this.view_param.show_id)
        let color_ol = QualityColorOLStr[detail.color];
        // UH.SetText(this.viewNode.RecipeName, TextHelper.ColorStr(detail.name,QualityColorStr[detail.color]))
        UH.SetText(this.viewNode.RecipeName, TextHelper.RichTextOutLine(TextHelper.ColorStr(detail.name, QualityColorStr[detail.color]), color_ol, 2));

        this.viewNode.GemShow.FlushGrid()

        this.viewNode.DragOther.visible = false
        this.viewNode.DragGem.visible = false
    }

    private flushGemList() {
        this.show_list = GemAtelierData.Inst().GetGemsList(this.view_param.show_id)
        this.viewNode.GemList.SetData(this.show_list)

        this.viewNode.EmptyShow.visible = this.show_list.length == 0
    }
    private flushDiscounts(){
        this.viewNode.DiscountsTab.visible = GemAtelierData.Inst().IsDiscounts()
    }

    private OnClickGemUp() {
        ViewManager.Inst().OpenView(GemAtelierUpGradeView)
    }

    private OnClickShop() {
        // ViewManager.Inst().OpenView(ShopView)
    }

    private OnClickOneKey() {
        let detail =  GemAtelierData.Inst().GetGemDetail(this.view_param.show_id)

        // if(detail.level == 1)
        // {
        //     PublicPopupCtrl.Inst().Center(Language.GemAtelier.OneKeyLevelLow)
        //     return 
        // }

        if(GemAtelierData.Inst().CheckCanOneKey(this.view_param.show_id,detail.level))
        {
            GemAtelierData.Inst().OperOnekeyRemove(this.view_param.show_id)

            let check_detail = GemAtelierData.Inst().GetDrawUpNeedDetail(this.view_param.show_id,detail.level)
            if(check_detail.need_num > 0)
            {
                PublicPopupCtrl.Inst().Center(Language.GemAtelier.OneKeyGemLack)
            }
            ViewManager.Inst().OpenView(GemAtelierDrawOneKeyView, {draw_id:this.view_param.show_id,level:detail.level})
            return 
        }

        this.viewNode.GemShow.HideGrids()
        GemAtelierData.Inst().TryOneKeySend(this.view_param.show_id,detail.level)
        this.viewNode.OneKeyGemOper.PlayEff(this.view_param.show_id,detail.level)
    }

    // 从列表拖拽到图纸上
    private OnDragGem() {
        if (fgui.DragDropManager.inst.dragging || GemAtelierData.Inst().GetInsetView() == null) {
            fgui.DragDropManager.inst.cancel()
            return
        }

        let detail = GemAtelierData.Inst().GetGemDetail(this.view_param.show_id)
        // 取即将升上去的等级
        if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Gem, detail.level)) {
            fgui.DragDropManager.inst.cancel()

            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitForGemTips, Language.CoreCrisis.CoreName[CoreCrisisType.Gem]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.Gem })
            return
        }

        this.draging_item = GemAtelierData.Inst().GetInsetDraging()

        let icon = fgui.UIPackage.getItemURL("GemAtelierInset", GemIconCfg["id_" + this.draging_item.gem_id])

        var rect = this.viewNode.DragLimit.localToGlobalRect(0, 0, this.viewNode.DragLimit.width, this.viewNode.DragLimit.height);
        rect = fgui.GRoot.inst.globalToLocalRect(rect.x, rect.y, rect.width, rect.height, rect);

        // // LogError("?ASD ", rect)
        // this.viewNode.Drager.dragBounds = rect
        // LogError("?sdf ",<fgui.GLoaderfgui.DragDropManager.inst.dragAgent.texture)
        (fgui.DragDropManager.inst.dragAgent as fgui.GLoader).texture = undefined
        fgui.DragDropManager.inst.startDrag(this.viewNode.Drager, icon, {});

        fgui.DragDropManager.inst.dragAgent.dragBounds = rect

        this.viewNode.GemList.draggable = false
    }


    // 放进了图纸区
    private onDrop(target: fgui.GObject, data: any) {
        //LogError("?drop in repice")
        //放置位置
        // let set_x = fgui.DragDropManager.inst.dragAgent.x - this.viewNode.GemShow.x //- fgui.DragDropManager.inst.dragAgent.width//- this.offset.x
        // let set_y = fgui.DragDropManager.inst.dragAgent.y - this.viewNode.GemShow.y //- fgui.DragDropManager.inst.dragAgent.height//- this.offset.y

        // let tex_x = (target as any)['_hitTestPt'].x+this.viewNode.GemShow.x
        // let tex_y = (target as any)['_hitTestPt'].y+this.viewNode.GemShow.y

        let set_x = (target as any)['_hitTestPt'].x - this.offset.x
        let set_y = (target as any)['_hitTestPt'].y - this.offset.y

        // 有明确的注入值的情况下为置入图纸
        // 没有的场合调取data，有明确的信息则为图纸内移动
        if (this.draging_item) {
            let gem_id = this.draging_item.gem_id
            let item_id = this.draging_item.item_id
            let pos = GemAtelierData.Inst().CheckGridTryEnterDraw(this.view_param.show_id, set_x, set_y, gem_id, true)
            this.viewNode.checker.setPosition(pos.mark_x + this.viewNode.GemShow.x, pos.mark_y + this.viewNode.GemShow.y)
            this.viewNode.real_checker.setPosition(set_x, set_y)// this.viewNode.GemShow.x,this.viewNode.GemShow.y)
            this.viewNode.total_check.setPosition(this.viewNode.GemShow.x, this.viewNode.GemShow.y)
            this.viewNode.fix_checker.setPosition((target as any)['_hitTestPt'].x + this.viewNode.GemShow.x, (target as any)['_hitTestPt'].y + this.viewNode.GemShow.y)

            UH.SetText(this.viewNode.testTxt, "set_" + Math.floor(set_x) + "," + Math.floor(set_y) + " hitTestPt_" + Math.floor((target as any)['_hitTestPt'].x) + "," + Math.floor((target as any)['_hitTestPt'].y) +
                " fixpos_" + Math.floor((target as any)['_hitTestPt'].x + this.viewNode.GemShow.x) + "," + Math.floor((target as any)['_hitTestPt'].y + this.viewNode.GemShow.y))

            this.viewNode.Fullchecker.setPosition(pos.mark_x + this.viewNode.GemShow.x, pos.mark_y + this.viewNode.GemShow.y)
            let full_flag = GemAtelierData.Inst().GetGemDrawIsFull(this.view_param.show_id)
            if (!full_flag) {
                PublicPopupCtrl.Inst().Center(Language.GemAtelier.FullDrawTips)
                return
            }

            if (pos.flag && full_flag) {
                GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.INLAY,
                    {
                        param1: this.view_param.show_id,
                        param2: item_id,
                        param3: pos.send_y,
                        param4: pos.send_x,
                    })
            }

            this.draging_item = null
        }
        else {
            let draging = GemAtelierData.Inst().GetInsetDraging()
            if (draging.net_index != null) {
                let gem_id = draging.gem_id
                let pos = GemAtelierData.Inst().CheckGridTryEnterDraw(this.view_param.show_id, set_x, set_y, gem_id, true, draging.net_index)

                this.viewNode.checker.setPosition(pos.mark_x + this.viewNode.GemShow.x, pos.mark_y + this.viewNode.GemShow.y)
                this.viewNode.real_checker.setPosition(set_x, set_y)// this.viewNode.GemShow.x,this.viewNode.GemShow.y)
                this.viewNode.total_check.setPosition(this.viewNode.GemShow.x, this.viewNode.GemShow.y)
                if(pos.fail_cache != null){
                    this.viewNode.fix_checker.setPosition(pos.mark_x + this.viewNode.GemShow.x + pos.fail_cache.y*40, 
                        pos.mark_y + this.viewNode.GemShow.y+ pos.fail_cache.x*40)
                }
                
                // this.viewNode.fix_checker.setPosition((target as any)['_hitTestPt'].x + this.viewNode.GemShow.x, (target as any)['_hitTestPt'].y + this.viewNode.GemShow.y)

                UH.SetText(this.viewNode.testTxt, "set_" + Math.floor(set_x) + "," + Math.floor(set_y) + " hitTestPt_" + Math.floor((target as any)['_hitTestPt'].x) + "," + Math.floor((target as any)['_hitTestPt'].y) +
                    " fixpos_" + Math.floor((target as any)['_hitTestPt'].x + this.viewNode.GemShow.x) + "," + Math.floor((target as any)['_hitTestPt'].y + this.viewNode.GemShow.y))

                this.viewNode.Fullchecker.setPosition(pos.mark_x + this.viewNode.GemShow.x, pos.mark_y + this.viewNode.GemShow.y)

                let px = Math.floor(draging.net_pos / 100)
                let py = Math.floor(draging.net_pos % 100)

                if (pos.flag && (px != pos.send_y || py != pos.send_x)) {
                    GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.MOVE,
                        {
                            param1: this.view_param.show_id,
                            param2: draging.net_index,
                            param3: pos.send_y,
                            param4: pos.send_x,
                        })

                    // this.flushInfoPanel()
                }
                else {
                    this.flushInfoPanel()
                }
            }
        }

        // this.viewNode.GemShow.CheckGemGrid(set_x,set_y)
        // this.flushDraging()
    }

    private flushDraging() {
        // this.viewNode.GemShow.FlushGrid()

    }
}

export class DragTrigger extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {}
    private pos_mark: string
    private draw_mark: number
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) { this.pos_mark = data.pos_mark, this.draw_mark = data.draw_mark }
    public GetPosMark() { return this.pos_mark }
    public GetDrawMark() { return this.draw_mark }
}

// 转作图纸拼块
export class InsetGemFixCell extends fgui.GComponent {
    private viewNode = {
        Loader: <fgui.GLoader>null,
    }
    private pos_mark: string
    private draw_mark: number
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
        if(data.map_show == GemFixIconCfg.fix_1)
        {
            UH.SpriteName(this.viewNode.Loader, "GemAtelierInset", data.map_show)
        }
    }

    public GetPosMark() { return this.pos_mark }
    public GetDrawMark() { return this.draw_mark }
}

export class InsetGemFixShow extends fgui.GComponent {
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

export class InsetOperGemShow extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        // Recipe:<fgui.GLoader>null,
        DragArea: <fgui.GGraph>null,
    }
    // 勘误：使用{}而不是使用[] 
    private GemFixGrids: { [key: string]: any } = []
    private GemGrids: { [key: string]: any } = []
    private DragTriggers: { [key: string]: any } = []
    private init = false
    private DragingStr: string
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return }
        this.data = data
        this.InitGemFixGrids(this.data.draw_id)
        this.InitDragTrigger(this.data.draw_id)
        // UH.SpriteName(this.viewNode.Recipe,"GemAtelierInset","draw_"+this.data.draw_id)
        if (!this.init && GemAtelierData.Inst().GetInsetView() != null) {
            GemAtelierData.Inst().GetInsetView().viewNode.GemList.on(fgui.Event.DROP, this.onDrop, this);
            GemAtelierData.Inst().GetInsetView().viewNode.DragOther.on(fgui.Event.DROP, this.onOtherDrop, this);
            GemAtelierData.Inst().GetInsetView().viewNode.DragGem.on(fgui.Event.DROP, this.onDrop, this);
            this.init = true
        }
    }

    protected onDestroy() {
        this.GemFixGrids = undefined
        this.DragTriggers = undefined
        this.GemGrids = undefined
    }

    private CreateGemFixs(px: number, py: number, mark_x: number, mark_y: number, draw_id: number, map_show: string) {
        let gem_grid = <InsetGemFixCell>fgui.UIPackage.createObject("GemAtelierInset", "GemFix").asCom;
        let child = this.addChild(gem_grid);
        child.setPosition(px, py);
        gem_grid.touchable = false
        gem_grid.SetData({ map_show: map_show, pos_mark: mark_x + "|" + mark_y, draw_mark: draw_id })
        this.GemFixGrids.push(gem_grid)
    }

    private InitGemFixGrids(draw_id: number) {
        let check_list = GemAtelierData.Inst().CheckDrawPos(draw_id, true)
        for (var index in check_list) {
            if (check_list[index].fix_show > 0) {
                if (this.GemFixGrids.length == 0) {
                    this.CreateGemFixs(check_list[index].x_pos, check_list[index].y_pos, check_list[index].x, check_list[index].y, draw_id, GemFixIconCfg["fix_" + check_list[index].fix_show])
                }
                else {
                    let flag_with_empty = false
                    for (var t_index in this.GemFixGrids) {
                        if (this.GemFixGrids[t_index].GetDrawMark() != draw_id) {
                            this.GemFixGrids[t_index].SetData({ map_show: GemFixIconCfg["fix_" + check_list[index].fix_show], pos_mark: check_list[index].x + "|" + check_list[index].y, draw_mark: draw_id })
                            flag_with_empty = true
                            break
                        }
                    }
                    if (!flag_with_empty) {
                        this.CreateGemFixs(check_list[index].x_pos, check_list[index].y_pos, check_list[index].x, check_list[index].y, draw_id, GemFixIconCfg["fix_" + check_list[index].fix_show])
                    }
                }
            }
        }
    }

    private CreateTrigger(px: number, py: number, mark_x: number, mark_y: number, draw_id: number) {
        let gem_grid = <DragTrigger>fgui.UIPackage.createObject("GemAtelierInset", "DragTrigger").asCom;
        let child = this.addChild(gem_grid);
        child.setPosition(px, py);
        gem_grid.draggable = true
        gem_grid.on(fgui.Event.DRAG_START, this.OnDragGem, this)
        gem_grid.SetData({ pos_mark: mark_x + "|" + mark_y, draw_mark: draw_id })
        this.DragTriggers.push(gem_grid)
    }

    private InitDragTrigger(draw_id: number) {
        let check_list = GemAtelierData.Inst().CheckDrawPos(draw_id, true)
        for (var index in check_list) {
            if (check_list[index].is_eff_pos) {
                if (this.DragTriggers.length == 0) {
                    this.CreateTrigger(check_list[index].x_pos, check_list[index].y_pos, check_list[index].x, check_list[index].y, draw_id)
                }
                else {
                    let flag_with_empty = false
                    for (var t_index in this.DragTriggers) {
                        if (this.DragTriggers[t_index].GetDrawMark() != draw_id) {
                            this.DragTriggers[t_index].SetData({ pos_mark: check_list[index].x + "|" + check_list[index].y, draw_mark: draw_id })
                            flag_with_empty = true
                            break
                        }
                    }
                    if (!flag_with_empty) {
                        this.CreateTrigger(check_list[index].x_pos, check_list[index].y_pos, check_list[index].x, check_list[index].y, draw_id)
                    }
                }
            }
        }
    }

    private CreateGrid(px: number, py: number, gem_id: number, icon_name: string, net_index: number, net_pos: number) {
        let gem_grid = <InsetGemFixShow>fgui.UIPackage.createObject("GemAtelierInset", "GemFixShow").asCom;
        let child = this.addChild(gem_grid);
        child.setPosition(px, py);
        gem_grid.SetData({ icon_name: icon_name, is_empty: false, gem_id: gem_id, net_index: net_index, net_pos: net_pos, isInset: true })
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
                    this.GemGrids[index].visible = true
                    this.GemGrids[index].setPosition(px, py)
                    this.GemGrids[index].SetData({ icon_name: icon_name, is_empty: false, gem_id: gem_id, net_index: net_index, net_pos: net_pos, isInset: true })
                    flag_with_empty = true
                    break
                }
            }
            if (!flag_with_empty) {
                this.CreateGrid(px, py, gem_id, icon_name, net_index, net_pos)
            }
        }
    }

    // 起拽瞬间判断拽起来的是什么
    // 从图纸拖拽到列表上
    public OnDragGem(evt: fgui.Event) {
        if (fgui.DragDropManager.inst.dragging || GemAtelierData.Inst().GetInsetView() == null) {
            fgui.DragDropManager.inst.cancel()
            return
        }

        var btn: fgui.GObject = fgui.GObject.cast(evt.currentTarget);
        btn.stopDrag();

        // LogError(btn.x, btn.y)
        let trigger = null
        for (var str in this.DragTriggers) {
            if (this.DragTriggers[str].x == btn.x && this.DragTriggers[str].y == btn.y) {
                trigger = this.DragTriggers[str]
                break
            }
        }

        let poses = trigger.GetPosMark().split("|")
        for (var str in this.GemGrids) {
            if (!this.GemGrids[str].IsEmpty()) {
                // 需要取图纸坐标对比 CheckGridPos提取的是宝石坐标
                let poslist = GemAtelierData.Inst().CheckGridPos(this.GemGrids[str].x, this.GemGrids[str].y, this.GemGrids[str].GetGemId(), true)
                let start_x = Math.floor(this.GemGrids[str].GetNetPos() / 100)
                let start_y = Math.floor(this.GemGrids[str].GetNetPos() % 100)
                for (var index in poslist) {
                    if (poslist[index].is_eff_pos && (poslist[index].x + start_x) == Number(poses[0]) && (poslist[index].y + start_y) == Number(poses[1])) {
                        this.GemGrids[str].visible = false
                        let icon = fgui.UIPackage.getItemURL("GemAtelierInset", GemIconCfg["id_" + this.GemGrids[str].GetGemId()])

                        var rect = GemAtelierData.Inst().GetInsetView().viewNode.DragLimit.localToGlobalRect(0, 0,
                            GemAtelierData.Inst().GetInsetView().viewNode.DragLimit.width,
                            GemAtelierData.Inst().GetInsetView().viewNode.DragLimit.height);
                        rect = fgui.GRoot.inst.globalToLocalRect(rect.x, rect.y, rect.width, rect.height, rect);

                        // GemAtelierData.Inst().GetInsetView().viewNode.Drager.dragBounds = rect
                        // LogError("?ASDfr ",rect)

                        // dragdropmanager 不会对其下的dragAgent进行释放操作，置空可使其初始化
                        (fgui.DragDropManager.inst.dragAgent as fgui.GLoader).texture = undefined
                        fgui.DragDropManager.inst.startDrag(GemAtelierData.Inst().GetInsetView().viewNode.Drager, icon, {});

                        // 下面注释的为测试代码
                        // fgui.DragDropManager.inst.dragAgent.off(fgui.Event.DROP,this.OffCallBack, this )
                        // fgui.DragDropManager.inst.dragAgent.off(fgui.Event.DRAG_END,this.OffCallBack, this )
                        // fgui.DragDropManager.inst.dragAgent.off(fgui.Event.DRAG_MOVE,this.OffCallBack, this )
                        // fgui.DragDropManager.inst.dragAgent.off(fgui.Event.DRAG_START,this.OffCallBack, this )
                        // fgui.DragDropManager.inst.dragAgent.off(fgui.Event.TOUCH_END,this.OffCallBack, this )

                        // fgui.DragDropManager.inst.dragAgent.on(fgui.Event.DRAG_END,this.OffCallBack, this )
                        fgui.DragDropManager.inst.dragAgent.on(fgui.Event.TOUCH_END,this.OffCallBack, this )

                        fgui.DragDropManager.inst.dragAgent.dragBounds = rect

                        this.DragingStr = str

                        GemAtelierData.Inst().SetInsetDraging(this.GemGrids[str].data)


                        // 抓到了才启动拖拽器
                        GemAtelierData.Inst().GetInsetView().viewNode.DragOther.visible = true
                        GemAtelierData.Inst().GetInsetView().viewNode.DragGem.visible = true
                        break
                    }
                }
            }
        }
    }

    // 松拽时落在gemlist上
    private onDrop(target: fgui.GObject, data: any) {
        // LogError("?drop in gemlist")
        if (this.DragingStr == null) {
            GemAtelierData.Inst().GetInsetView().viewNode.DragOther.visible = false
            GemAtelierData.Inst().GetInsetView().viewNode.DragGem.visible = false
            return
        }

        GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.REMOVE,
            {
                param1: this.data.draw_id,
                param2: this.GemGrids[this.DragingStr].GetNetIndex(),
                param3: 0, param4: 0,
            })
        // let net_draw = GemAtelierData.Inst().GetTestSCGemInfo({draw_id:this.data.draw_id})
        // net_draw.splice(this.GemGrids[this.DragingStr].GetNetIndex(),1)
        // GemAtelierData.Inst().SetTestSCGemInfo(
        //     {
        //         draw_id:this.data.draw_id, 
        //         drawing_list:net_draw
        //     }
        // )

        GemAtelierData.Inst().GetInsetView().viewNode.DragOther.visible = false
        GemAtelierData.Inst().GetInsetView().viewNode.DragGem.visible = false
        this.DragingStr = null
    }

    // 松拽到别的地方上
    private onOtherDrop(target: fgui.GObject, data: any) {
        // LogError("?drop in other")
        if (this.DragingStr == null) {
            GemAtelierData.Inst().GetInsetView().viewNode.DragOther.visible = false
            GemAtelierData.Inst().GetInsetView().viewNode.DragGem.visible = false
            return
        }

        this.GemGrids[this.DragingStr].visible = true
        GemAtelierData.Inst().GetInsetView().viewNode.DragOther.visible = false
        GemAtelierData.Inst().GetInsetView().viewNode.DragGem.visible = false
        this.DragingStr = null
    }

    private OffCallBack() {
        this.onOtherDrop(null,null)
    }

    public HideGrids()
    {
        for (var str in this.GemGrids) {
            this.GemGrids[str].SetIsEmpty(true)
            this.GemGrids[str].SetGridPic("-1")
        }
    }

    public FlushGrid() {
        this.HideGrids()

        // let net_draw = GemAtelierData.Inst().GetTestSCGemInfo({draw_id:this.data.draw_id})
        let net_draw = GemAtelierData.Inst().GetNetGemInfo({ draw_id: this.data.draw_id })
        // let length = 0
        // for (var index in net_draw) {
        //     if (net_draw[index].pos > 0) {
        //         length = length + 1
        //     }
        // }

        // if (GemAtelierData.Inst().GetInsetView().grid_num > 0 && length == 0) {

        // }
        // GemAtelierData.Inst().GetInsetView().grid_num = length

        for (var index in net_draw) {
            if (net_draw[index].pos > 0) {
                let px = Math.floor(net_draw[index].pos % 100) * GemAtelierData.Inst().InsetCheckSize
                let py = Math.floor(net_draw[index].pos / 100) * GemAtelierData.Inst().InsetCheckSize
                let gem_id = Item.GetConfig(net_draw[index].itemId).param
                this.AddNewGrid(px, py, gem_id, GemIconCfg["id_" + gem_id], Number(index), net_draw[index].pos)
            }
        }
    }

    // 测试 检查图纸
    public TestDrawGrid() {
        let check_list = GemAtelierData.Inst().CheckDrawPos(0, true)
        for (var index in check_list) {
            if (check_list[index].is_eff_pos) {
                let gem_grid = <fgui.GImage>fgui.UIPackage.createObject("GemAtelierInset", "ZiBaoShi");
                let child = this.addChild(gem_grid);
                child.setPosition(check_list[index].x_pos, check_list[index].y_pos);
            }
        }
    }

    // 测试 检查宝石
    public TestGemGrid(set_x: number, set_y: number) {
        let check_list = GemAtelierData.Inst().CheckGridPos(set_x, set_y, 3, true)
        for (var index in check_list) {
            if (check_list[index].is_eff_pos) {
                let gem_grid = <fgui.GImage>fgui.UIPackage.createObject("GemAtelierInset", "HongBaoShi");
                let child = this.addChild(gem_grid);
                child.setPosition(check_list[index].x_pos, check_list[index].y_pos);
            }
            if (check_list[index].x == 0 && check_list[index].y == 0) {
                let gem_grid = <fgui.GImage>fgui.UIPackage.createObject("GemAtelierInset", "ZiBaoShi");
                let child = this.addChild(gem_grid);
                child.setPosition(check_list[index].x_pos, check_list[index].y_pos);
            }
        }
    }
}

export class GemInsetItem extends fgui.GComponent {
    private viewNode = {
        lock: <fgui.GGroup>null,
        ItemCall: <ItemCell>null,
        DragArea: <fgui.GComponent>null,
        Itemshow: <fgui.GLabel>null,
        NumStr: <fgui.GLabel>null,
        level_list: <fgui.GList>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.DragArea.on(fgui.Event.DRAG_START, this.OnDragGem, this)
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.viewNode.ItemCall.SetData(Item.Create({ item_id: data.item_id }, { is_num: false, is_click: false }))
        this.viewNode.lock.visible = data.num == 0

        // LogError("?ASdf",data.num > 0)
        UH.SetText(this.viewNode.Itemshow, "")//data.item_id +"|" +data.gem_id)
        // UH.SetText(this.viewNode.LevelStr,Language.GemAtelier.LvShow + data.level)
        UH.SetText(this.viewNode.NumStr, Item.GetNum(data.item_id))
        let levels = GemAtelierData.Inst().GetGemLevelList(data.level)
        this.viewNode.level_list.SetData(levels)

        this.viewNode.DragArea.draggable = data.num > 0;
        this.data = data
    }

    private OnDragGem(evt: fgui.Event) {
        var btn: fgui.GObject = fgui.GObject.cast(evt.currentTarget);
        btn.stopDrag();

        if (GemAtelierData.Inst().GetInsetView() == null) {
            return
        }


        GemAtelierData.Inst().SetInsetDraging(this.data)
        GemAtelierData.Inst().GetInsetView().OnDragGem()
    }
}

export class GemLevelShowCell extends fgui.GComponent {
    private viewNode = {
        loader: <fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        UH.SpriteName(this.viewNode.loader, "GemAtelier", data.num)
    }

}