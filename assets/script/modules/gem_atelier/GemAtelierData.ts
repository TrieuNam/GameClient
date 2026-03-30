
import { LogError } from 'core/Debugger';
import { view, _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { DataBase } from "data/DataBase";
import { CfgMountData } from "config/CfgMount";
import { CreateSMD, smartdata } from "data/SmartData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { AttrListName, Language } from 'modules/common/Language';
import { CfgGemDrawData, CfgGemDrawItemData } from 'config/CfgGemDraw';
import { CfgGemData, CfgGemItemData } from 'config/CfgGem';
import { BagData } from 'modules/bag/BagData';
import { CfgDrawingSet, CfgGemCfgData } from 'config/CfgGemCfg';
import { Item } from 'modules/bag/ItemData';
import { ViewManager } from 'manager/ViewManager';
import { FishView } from 'modules/fish/FishView';
import { GemAtelierInsetView } from './GemAtelierInsetView';
import { FunOpen } from 'modules/guide/FunOpen';
import { Mod } from 'modules/common/ModuleDefine';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { TextHelper } from '../../helpers/TextHelper';
import { GemAtelierPicUpView } from './GemAtelierPicUpView';
import { tabberInfo } from 'modules/common_board/CommonBoard5';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { AttrHelper } from '../../helpers/AttrHelper';
import { CommonId } from 'modules/common/CommonEnum';
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from './GemAtelierCtrl';
import { drawingShield } from './GemAtelierMainView';
import { GemDrawMaxLevel } from './GemAtelierConfig';

class GemAtelierFlushInfo {
    @smartdata 
    needflush:number;

    @smartdata 
    is_draging:boolean;

    @smartdata
    oper_draw_id:number = 0;

    @smartdata
    show_eff:number;

    @smartdata
    show_red:number;

    @smartdata
    flush_change:number;

    @smartdata
    onekey_change:number;
}

export class GemAtelierData extends DataBase{
    public flush_info: GemAtelierFlushInfo;
    private gem_info:any
    private InsetView:any
    private UpGradeView:any
    private InsetDraging:any
    private ChangeSelect:any

    public CheckSize = 30
    public InsetCheckSize = 60

    public lock_flush = false

    public exPicUpParam:any
    constructor() {
        super();

        this.createSmartData();
        this.gem_info = []
    }

    private createSmartData() {
        this.flush_info = CreateSMD(GemAtelierFlushInfo);
        this.flush_info.needflush = 0
        this.flush_info.onekey_change = 0
    }

    public SetSCGemInfo(protocol:any){
        if(protocol.drawingId == -1){
            for(let i = 0;i<protocol.drawingList.length;i++){
                this.gem_info[i] = protocol.drawingList[i]
            }
        }
        else 
        {
            let mark = this.gem_info[protocol.drawingId ].level 

            this.gem_info[protocol.drawingId ] = protocol.drawingList[0]
            this.flush_info.oper_draw_id = protocol.drawingId

            // 更新而产生了等级提升的场合
            if(this.gem_info[protocol.drawingId ].level > mark && !this.lock_flush)
            {
                if(ViewManager.Inst().IsOpen(GemAtelierInsetView))
                {
                    PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.GemAtelier.DrawUpDateSuccess,this.gem_info[protocol.drawingId ].level))            
                    ViewManager.Inst().CloseView(GemAtelierInsetView)

                    this.ForceShowEff()
                    AudioManager.Inst().Play(AudioTag.ShengJi)

                    let item_cfg = this.GetGemDrawItem(protocol.drawingId)
                    let n_m_cfg = this.GetGemDrawUpCfgWithLevel(protocol.drawingId,mark)
                    let l_m_cfg = this.GetGemDrawUpCfgWithLevel(protocol.drawingId,mark-1)

                    let list = []
                    for(var index in n_m_cfg.gem_drawing){
                        let info = {
                            att_type:n_m_cfg.gem_drawing[index].type,
                            att_value:l_m_cfg == null ? 0 :l_m_cfg.gem_drawing[index].add,
                            next_value:n_m_cfg.gem_drawing[index].add,
                        }
                        list.push(info)
                    }
                    // let attr_list = 

                    let param = {
                        item_id:item_cfg.id,
                        name:item_cfg.name,
                        a_color:n_m_cfg.color,
                        a_level:this.gem_info[protocol.drawingId ].level,
                        b_color:l_m_cfg == null ? n_m_cfg.color : l_m_cfg.color,
                        b_level:this.gem_info[protocol.drawingId ].level-1,
                        attrList:list,
                    }

                    let fuhao = "+"
                    let type = 1
                    for (let i = 0; i < list.length; i++) {
                        let att_type = list[i].att_type;
                        let att_add = list[i].next_value - list[i].att_value
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
                    }

                    ViewManager.Inst().OpenView(GemAtelierPicUpView,param)
                }
            }
            else if(this.lock_flush)
            {
                if(ViewManager.Inst().IsOpen(GemAtelierInsetView))
                {
                    let info = {
                        drawingId:protocol.drawingId,
                        mark:mark,
                    }
                    this.exPicUpParam = info
                }
            }
        }

        if(!this.lock_flush){
            this.flush_info.needflush = this.flush_info.needflush + 1
        }
    }

    public UnShiftPicUp()
    {
        PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.GemAtelier.DrawUpDateSuccess, this.gem_info[this.exPicUpParam.drawingId].level))
        ViewManager.Inst().CloseView(GemAtelierInsetView)

        this.ForceShowEff()
        AudioManager.Inst().Play(AudioTag.ShengJi)

        let item_cfg = this.GetGemDrawItem(this.exPicUpParam.drawingId)
        let n_m_cfg = this.GetGemDrawUpCfgWithLevel(this.exPicUpParam.drawingId, this.exPicUpParam.mark)
        let l_m_cfg = this.GetGemDrawUpCfgWithLevel(this.exPicUpParam.drawingId, this.exPicUpParam.mark - 1)

        let list = []
        for (var index in n_m_cfg.gem_drawing) {
            let info = {
                att_type: n_m_cfg.gem_drawing[index].type,
                att_value: l_m_cfg == null ? 0 : l_m_cfg.gem_drawing[index].add,
                next_value: n_m_cfg.gem_drawing[index].add,
            }
            list.push(info)
        }
        // let attr_list = 

        let param = {
            item_id: item_cfg.id,
            name: item_cfg.name,
            a_color: n_m_cfg.color,
            a_level: this.gem_info[this.exPicUpParam.drawingId].level,
            b_color: l_m_cfg == null ? n_m_cfg.color : l_m_cfg.color,
            b_level: this.gem_info[this.exPicUpParam.drawingId].level - 1,
            attrList: list,
        }

        let fuhao = "+"
        let type = 1
        for (let i = 0; i < list.length; i++) {
            let att_type = list[i].att_type;
            let att_add = list[i].next_value - list[i].att_value
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
        }

        ViewManager.Inst().OpenView(GemAtelierPicUpView,param)
    }

    // 测试代码
    public SetTestSCGemInfo(data:any){

        this.gem_info[data.draw_id] = data.drawing_list
        // LogError("?SetTestSCGemInfo",data.draw_id,this.gem_info[data.draw_id])
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    // 测试代码
    public GetTestSCGemInfo(data:any){
        // LogError("?GetTestSCGemInfo",data)
        // if(this.gem_info[data.draw_id] == null){
        //     LogError("?wentyasdf ")
        //     this.gem_info[data.draw_id] = []
        // }
        // LogError("?GetTestSCGemInfo",data.draw_id,this.gem_info[data.draw_id])
        return this.gem_info[data.draw_id]
    }

    public GetNetGemInfo(data:any){
        return this.gem_info[data.draw_id].gemList
    }

    public GetGemDrawUpCfg(gem_draw_type:number){
        var config = CfgGemCfgData.drawing_up ;

        for (const info of config) {
            let level = this.GetDrawLevel(gem_draw_type);
            if(info.gem_drawing_id == gem_draw_type && 
                (level == 0 || level == info.gem_drawing_level)){
                return info
            }
        }
    }

    public GetGemDrawUpCfgWithLevel(gem_draw_type:number,level:number){
        var config = CfgGemCfgData.drawing_up ;

        for (const info of config) {
            if(info.gem_drawing_id == gem_draw_type && info.gem_drawing_level == level){
                return info
            }
        }
    }

    public GetGemCompoundCfg(gem_type:number,gem_level:number)
    {
        var config = CfgGemCfgData.compound ;
        for(var index in config)
        {
            if(config[index].gem_type == gem_type && config[index].level == gem_level)
            {
                return config[index]
            }
        }

        return null
    }

    public GetGemDrawItem(gem_draw_type:number)
    {
        var config = CfgGemDrawData 
        for (var index in config) {
            if(config[index].param == gem_draw_type){
                return config[index]
            }
        }
    }

    public GetGemItem(gem_type:number,gem_level:number){
        var config = CfgGemData ;
        for (var index in config) {
            if(config[index].param == gem_type && config[index].gem_level == gem_level){
                return config[index]
            }
        }
    }

    public GetGemItemBagList(gem_level:number,is_ts:number){
        var config = CfgGemData ;
        let ready_list = []
        for (var index in config) {
            if(config[index].gem_level == gem_level && is_ts == config[index].ts_gem){
                ready_list.push(config[index])
            }
        }

        let fix_list = []
        for (var index in ready_list){
            let num = BagData.Inst().getItemNum(ready_list[index].id)
            // let total_num = num > 0 ? num : 1
            // for(let i = 0;i<total_num;i++){
                let info = {
                    item_id:ready_list[index].id,
                    num:num,
                    // index:i,
                    gem_id:ready_list[index].param,
                    level:gem_level,
                }
                if(num > 0 ){
                    fix_list.push(info)
                }
            // }
        }

        return fix_list
    }

    public GetGemDrawingList(type:number)
    {
        let fix_list = []
        for(let i = 0;i<this.gem_info.length;i++){
        // for(let i = 0;i<25;i++){
            let cfg = this.GetGemDrawItem(i)
            if(drawingShield.indexOf(cfg.id) != -1)continue;//屏蔽58012-58024号图纸
            let m_cfg = this.GetGemDrawUpCfg(i)
            let info = {
                level:this.GetDrawLevel(i),
                gem_list:this.gem_info[i].gemList,
                item_id:cfg.id,
                num:BagData.Inst().getItemNum(cfg.id),
                is_ts:m_cfg.is_ts_drawing,
                drawing_id:i,
                color:m_cfg.color,
            }
            if(info.is_ts == type){
                fix_list.push(info)
            }   
        }

        fix_list.sort((a, b) => b.level == a.level ? b.num - a.num : b.level - a.level );
        return fix_list
    }

    GetDrawLevel(type:number){
        let level = this.gem_info[type].level;
        if(level > GemDrawMaxLevel){
            return GemDrawMaxLevel;
        }
        return level;
    }

    IsDrawMax(type:number){
        let level = this.gem_info[type].level;
        if(level >= GemDrawMaxLevel){
            return true;
        }
        return false;
    }

    public GetGemDetail(draw_id:number){
        let net_info = this.gem_info[draw_id]
        let level = this.GetDrawLevel(draw_id);
        let cfg = this.GetGemDrawItem(draw_id)
        let base_cfg = this.GetGemCfgDrawing(draw_id,level)
        let info = {
            item_id:cfg.id,
            name:cfg.name,
            level:level,
            is_ts:base_cfg == null ? 0 : base_cfg.is_ts_drawing,
            color:base_cfg == null ? 2 : base_cfg.color,
        }
        return info 
    }

    public GetGemCfgDrawing(draw_id:number,level:number){
        let cfg = CfgGemCfgData.drawing_up 
        for(var index in cfg){
            if(cfg[index].gem_drawing_id == draw_id && level == cfg[index].gem_drawing_level ){
                return cfg[index]
            }
        }
        return null
    }

    public GetMainTagList(){
        let fix: tabberInfo[] = [
            { panel: null, viewName: "", titleName: Language.GemAtelier.TagName[0], index: 0, modKey: 0, isRemind: false },
            { panel: null, viewName: "", titleName: Language.GemAtelier.TagName[1], index: 1, modKey: 0, isRemind: false }
        ]

        return fix
    }

    // 获取可获得的属性
    public GetDrawsAttrList(draw_id:number){
        var config = CfgGemCfgData.drawing_up ;
        let net_info = this.gem_info[draw_id]
        let attr_list = []
        let check_level = this.GetDrawLevel(draw_id);
        check_level = check_level > 0 ? check_level : 1
        // LogError("?fdg ",net_info.level )
        for(var index in config){
            if(draw_id == config[index].gem_drawing_id && check_level == config[index].gem_drawing_level)
            {
                attr_list = config[index].gem_drawing
            }
        }

        let fix_list = []
        for(var index in attr_list){
            let info = {
                att_type:attr_list[index].type,
                att_value:attr_list[index].add,
            }
            fix_list.push(info)
        }

        return fix_list
    }

    // 获取已获得的属性
    public GetDrawsCanedAttrList(draw_id:number){
        var config = CfgGemCfgData.drawing_up ;
        let net_info = this.gem_info[draw_id]
        let attr_list = []
        for(var index in config){
            if(draw_id == config[index].gem_drawing_id && net_info.level-1 >= config[index].gem_drawing_level)
            {
                for(var g_index in config[index].gem_drawing){
                    let plus_flag = true
                    for(var a_index in attr_list){
                        if(attr_list[a_index].attrType == config[index].gem_drawing[g_index].type)
                        {
                            plus_flag = false
                            attr_list[a_index].attrValue = attr_list[a_index].attrValue + config[index].gem_drawing[g_index].add
                        }
                    }
                    if(plus_flag){
                        let info = {
                            attrType:config[index].gem_drawing[g_index].type,
                            attrValue:config[index].gem_drawing[g_index].add,
                        }
                        attr_list.push(info)
                    }
                }
                
                // attr_list = config[index].gem_drawing
            }
        }

        return attr_list
    }

    public GetGemsList(draw_id:number){
        let detail = this.GetGemDetail(draw_id)
        let ready_list = this.GetGemItemBagList(detail.level,detail.is_ts)

        ready_list.sort((a, b) => b.num - a.num);

        return ready_list
    }

    public GetUpGradeGemsList(type:number)
    {
        var config = CfgGemData ;
        let ready_list = []
        for (var index in config) {
            // 满级宝石不作数
            if(config[index].ts_gem == type && config[index].gem_level < 6){
                ready_list.push(config[index])
            }
        }

        let fix_list = []
        let show_index = 0
        for(var index in ready_list) {
            let num = BagData.Inst().getItemNum(ready_list[index].id)
            for(let i = 0;i<num;i++){
                let info = {
                    item_id:ready_list[index].id,
                    num:num,
                    index:i,
                    show_index:show_index,
                    gem_id:ready_list[index].param,
                    level:ready_list[index].gem_level,
                }
                show_index = 0//show_index + 1
                fix_list.push(info)
            }
        }

        fix_list.sort((a, b) =>  b.level == a.level ? b.num - a.num : a.level - b.level );
        for(var index in fix_list)
        {
            fix_list[index].show_index = show_index 
            show_index = show_index + 1
        }

        return fix_list
    }

    public GetGemUpList()
    {
        var config = CfgGemData ;
        let ready_list = []
        for (var index in config) {
            // 满级宝石不作数
            if( config[index].gem_level < 6 ){
                ready_list.push(config[index])
            }
        }

        let fix_list = []
        let show_index = 0
        for (var index in ready_list) {
            let num = BagData.Inst().getItemNum(ready_list[index].id)
            if (num > 0) {
                let info = {
                    item_id: ready_list[index].id,
                    num: num,
                    show_index: show_index,
                    gem_id: ready_list[index].param,
                    level: ready_list[index].gem_level,
                    is_num: true,
                }
                show_index = 0
                fix_list.push(info)
            }
        }

        fix_list.sort((a, b) =>  b.level == a.level ? b.num - a.num : a.level - b.level );
        for(var index in fix_list)
        {
            fix_list[index].show_index = show_index 
            show_index = show_index + 1
        }

        return fix_list
    }

    public SetChangeSelect(item:any){
        this.ChangeSelect = item
        this.flush_info.flush_change = this.flush_info.flush_change + 1
    }

    public GetChangeSelect()
    {
        return this.ChangeSelect
    }

    public GetChangeSelectList(item_id:number){
        let item_cfg = Item.GetConfig(item_id);

        var config = CfgGemData ;
        let ready_list = []
        for (var index in config) {
            if( config[index].gem_level == item_cfg.gem_level && config[index].ts_gem == item_cfg.ts_gem  && item_cfg.id != config[index].id){
                ready_list.push(config[index])
            }
        }

        let fix_list = []
        let show_index = 0
        for(var index in ready_list) {
            let num = BagData.Inst().getItemNum(ready_list[index].id)
                let info = {
                    item_id:ready_list[index].id,
                    num:num,
                    show_index:show_index,
                    gem_id:ready_list[index].param,
                    level:ready_list[index].gem_level,
                    is_num:false,
                }
                show_index = 0
                fix_list.push(info)
            
        }

        fix_list.sort((a, b) =>  b.level == a.level ? a.num - b.num : a.level - b.level );
        for(var index in fix_list)
        {
            fix_list[index].show_index = show_index 
            show_index = show_index + 1
        }

        return fix_list
    }

    public GetOnekeyList()
    {
        var config = CfgGemData ;
        let ready_list = []
        for (var index in config) {
            // 满级宝石不作数
            if( config[index].gem_level < 6 ){
                ready_list.push(config[index])
            }
        }

        let fix_list = []
        let show_index = 0
        for (var index in ready_list) {
            let num = BagData.Inst().getItemNum(ready_list[index].id)
            if (num > 0) {
                let info = {
                    item_id: ready_list[index].id,
                    num: num,
                    show_index: show_index,
                    gem_id: ready_list[index].param,
                    level: ready_list[index].gem_level,
                    is_num: true,
                }
                show_index = 0
                fix_list.push(info)
            }
        }

        fix_list.sort((a, b) =>  b.level == a.level ? b.num - a.num : a.level - b.level );
        for(var index in fix_list)
        {
            fix_list[index].show_index = show_index 
            show_index = show_index + 1
        }

        return fix_list
    }

    public SetInsetView(view:any) { this.InsetView = view }
    public GetInsetView() { return this.InsetView }

    public SetUpGradeView(view:any) { this.UpGradeView = view }
    public GetUpGradeView() { return this.UpGradeView }


    public SetInsetDraging(item:any){ this.InsetDraging = item }
    public GetInsetDraging(){ return this.InsetDraging }


    // 获取提取了联网信息的图纸信息
    public CheckNetDrawGridPos(){

    }

    // 检查tag能否开启(主界面)
    public CheckDrawTagEffect(type:number)
    {
        let show_list = this.GetGemDrawingList(type)
        return show_list[0].level == 0
    }

    // 检查tag能否开启（宝石合成界面）
    public CheckUpGradeTagEffect(type:number)
    {
        let show_list = this.GetUpGradeGemsList(type)
        return show_list.length == 0
    }

    public CheckGridTryEnterDraw(draw_id:number,set_x:number,set_y:number,gem_id:number,isInset:boolean, ignoreIndex?:number){
        
        let draw_poses = this.CheckDrawPosWithNet(draw_id,ignoreIndex)

        // 着点修正 
        let scan_x = set_x // + Math.floor((isInset ?this.InsetCheckSize :this.CheckSize)/2)
        let scan_y = set_y // + Math.floor((isInset ?this.InsetCheckSize :this.CheckSize)/2)

        let scaned_x = 0
        let scaned_y = 0
        let send_x = 0
        let send_y = 0
        // 着点检查
        for(var index_d in draw_poses){
            if(scan_x >= draw_poses[index_d].y_pos && 
                scan_x <= draw_poses[index_d].y_pos+(isInset ? this.InsetCheckSize :this.CheckSize) &&
                scan_y >= draw_poses[index_d].x_pos &&
                scan_y <= draw_poses[index_d].x_pos+(isInset ? this.InsetCheckSize :this.CheckSize) )
                {
                    scaned_x = draw_poses[index_d].y_pos
                    scaned_y = draw_poses[index_d].x_pos

                    send_x = draw_poses[index_d].x
                    send_y = draw_poses[index_d].y
                    
                    break 
                }
        }

        let gem_poses = this.CheckGridPos(scaned_x,scaned_y,gem_id,true)
        let flag_enter = true

        // 重叠检查
        let fail_cache = null
        for(var index in gem_poses){
                if(gem_poses[index].is_eff_pos){
                    let flag_scan = false
                    let cache = null 
                    let cache_pos = null 

                    let gem_check_x = gem_poses[index].x_pos
                    let gem_check_y = gem_poses[index].y_pos

                    for(var index_d in draw_poses){
                        // 取中心格点，更准确判断
                         //+ ((isInset ?this.InsetCheckSize :this.CheckSize)/2)
                         //+ ((isInset ?this.InsetCheckSize :this.CheckSize)/2)
                         
                        if(draw_poses[index_d].is_eff_pos && draw_poses[index_d].net_inset == undefined){
                                // 宝石有效格成功放入图纸有效格
                            if(gem_check_x == draw_poses[index_d].x_pos && 
                                //gem_check_x <= draw_poses[index_d].x_pos+(isInset ?this.InsetCheckSize :this.CheckSize) &&
                                gem_check_y == draw_poses[index_d].y_pos //&&
                                //gem_check_y <= draw_poses[index_d].y_pos+(isInset ?this.InsetCheckSize :this.CheckSize) 
                                ){
                                    flag_scan = true
                                    cache_pos = gem_poses[index]
                                    cache = draw_poses[index_d]
                            }
                        }
                    }

                    if(!flag_scan){
                        flag_enter = false
                        fail_cache = gem_poses[index]
                        break
                    }
                }
        }

        let checked = {
            x:gem_poses["0|0"].x_pos,
            y:gem_poses["0|0"].y_pos,

            mark_x:scaned_x,
            mark_y:scaned_y,
            send_x:send_x,
            send_y:send_y,
            flag:flag_enter,
            fail_cache:fail_cache,
        }

        // 容错
        if(!flag_enter && isInset)
        {
            let right_scan_x = scan_x + this.InsetCheckSize
            let right_check = this.ExtraCheckGridTryEnterDraw(draw_id,right_scan_x,scan_y,gem_id,ignoreIndex)

            if(right_check.flag)
            {
                return right_check
            }

            let down_scan_y = scan_y + this.InsetCheckSize
            let down_check = this.ExtraCheckGridTryEnterDraw(draw_id,scan_x,down_scan_y,gem_id,ignoreIndex)

            if(down_check.flag)
            {
                return down_check
            }
        }
        
        return checked
    }

    // 仅限镶嵌使用
    public ExtraCheckGridTryEnterDraw(draw_id:number,scan_x:number,scan_y:number,gem_id:number,ignoreIndex?:number)
    {
        let draw_poses = this.CheckDrawPosWithNet(draw_id,ignoreIndex)

        let scaned_x = 0
        let scaned_y = 0
        let send_x = 0
        let send_y = 0
        // 着点检查
        for(var index_d in draw_poses){
            if(scan_x >= draw_poses[index_d].y_pos && 
                scan_x <= draw_poses[index_d].y_pos+this.InsetCheckSize &&
                scan_y >= draw_poses[index_d].x_pos &&
                scan_y <= draw_poses[index_d].x_pos+this.InsetCheckSize )
                {
                    scaned_x = draw_poses[index_d].y_pos
                    scaned_y = draw_poses[index_d].x_pos

                    send_x = draw_poses[index_d].x
                    send_y = draw_poses[index_d].y
                    
                    break 
                }
        }

        let gem_poses = this.CheckGridPos(scaned_x,scaned_y,gem_id,true)
        let flag_enter = true

        // 重叠检查
        let fail_cache = null
        for(var index in gem_poses){
                if(gem_poses[index].is_eff_pos){
                    let flag_scan = false
                    let cache = null 
                    let cache_pos = null 
                    let gem_check_x = gem_poses[index].x_pos
                    let gem_check_y = gem_poses[index].y_pos

                    for(var index_d in draw_poses){
                        // 取中心格点，更准确判断
                         //+ ((isInset ?this.InsetCheckSize :this.CheckSize)/2)
                         //+ ((isInset ?this.InsetCheckSize :this.CheckSize)/2)
                         
                        if(draw_poses[index_d].is_eff_pos && draw_poses[index_d].net_inset == undefined){
                                // 宝石有效格成功放入图纸有效格
                            if(gem_check_x == draw_poses[index_d].x_pos && 
                                //gem_check_x <= draw_poses[index_d].x_pos+(isInset ?this.InsetCheckSize :this.CheckSize) &&
                                gem_check_y == draw_poses[index_d].y_pos //&&
                                //gem_check_y <= draw_poses[index_d].y_pos+(isInset ?this.InsetCheckSize :this.CheckSize) 
                                ){
                                    flag_scan = true
                                    cache_pos = gem_poses[index]
                                    cache = draw_poses[index_d]
                            }
                        }
                    }

                    if(!flag_scan){
                        flag_enter = false
                        fail_cache = gem_poses[index]
                    }
                }
        }

        let checked = {
            x:gem_poses["0|0"].x_pos,
            y:gem_poses["0|0"].y_pos,

            mark_x:scaned_x,
            mark_y:scaned_y,
            send_x:send_x,
            send_y:send_y,
            flag:flag_enter,
            fail_cache:fail_cache,
        }

        return checked
    }

    // 配置中的X为实际坐标的Y，配置中的Y为实际坐标的X
    // 检查宝石的有效格位置（pos
    public CheckGridPos(set_x:number,set_y:number,gem_id:number,isInset:boolean)
    {
        if(CfgGemCfgData.gem[gem_id] == null){return} 
        let fix_list:{[key:string]:any} = []
        for(var index in CfgGemCfgData.gem){
            if (CfgGemCfgData.gem[index].gem_id == gem_id){
                let str_x = CfgGemCfgData.gem[index].x_axle.toString()
                for(let y = 0;y<6;y++){
                    let info = {
                        y:y,
                        x:CfgGemCfgData.gem[index].x_axle,
                        x_pos:set_x+y*(isInset ?this.InsetCheckSize :this.CheckSize) ,
                        y_pos:set_y+(isInset ?this.InsetCheckSize :this.CheckSize)*CfgGemCfgData.gem[index].x_axle,
                        is_eff_pos:CfgGemCfgData.gem[index]["y_"+y] == 1
                    }

                    fix_list[str_x+"|"+y.toString()] = info
                }
            }
        }
        return fix_list
    }

    // 检查图纸的有效格位置
    public CheckDrawPos(pic:number,isInset:boolean)
    {
        if(CfgGemCfgData.drawing[pic] == null){return}

        let fix_list:{[key:string]:any} = []
        for(var index in CfgGemCfgData.drawing){
            if (CfgGemCfgData.drawing[index].gem_drawing_id == pic){
                let str_x = CfgGemCfgData.drawing[index].x_axle.toString()
                for(let y = 0;y<12;y++){
                    let fix_show = CfgGemCfgData.drawing[index]["y_"+y]
                    let info = {
                        x:CfgGemCfgData.drawing[index].x_axle,
                        y:y,
                        x_pos:y*(isInset ?this.InsetCheckSize :this.CheckSize),
                        y_pos:(isInset ?this.InsetCheckSize :this.CheckSize)*CfgGemCfgData.drawing[index].x_axle,
                        fix_show:fix_show,
                        is_eff_pos:CfgGemCfgData.drawing[index]["y_"+y] == 1,
                        is_empty:true,
                    }
                    fix_list[str_x+"|"+y.toString()] = info
                }
            }
            
        }
        
        return fix_list
    }

    // 检查图纸有效点格——追加协议检查
    public CheckDrawPosWithNet(pic:number,ignoreIndex:number){
        let list = this.CheckDrawPos(pic,true)
        let net_list = this.GetNetGemInfo({draw_id:pic})

        for(var index in net_list){
            if(net_list[index].itemId > 0 && ignoreIndex != Number(index))
            {
                let px = Math.floor(net_list[index].pos/100)
                let py = Math.floor(net_list[index].pos%100)
                let gem_id = Item.GetConfig(net_list[index].itemId).param
                let gem_poses = this.CheckGridPos(px,py,gem_id,true)


                for(var g_index in gem_poses)
                {
                    let draw_x = px + gem_poses[g_index].x
                    let draw_y = py + gem_poses[g_index].y

                    for(var d_index in list)
                    {
                        if(list[d_index].x == draw_x && list[d_index].y == draw_y
                            && gem_poses[g_index].is_eff_pos && list[d_index].is_eff_pos
                            && list[d_index].net_inset == undefined){
                                list[d_index].net_inset = true
                        }
                    }
                    // if( gem_poses[index].is_eff_pos && )
                }
            }
            
            // for(var pos in list){
            //     if(list[pos].is_eff_pos){
                    
            //     }
            // }
        }
        return list
    }

    public GetEnterParam()
    {
        let attr_list = []
        let temp_cell = []
        // 属性汇总
        for(let i = 0;i<2;i++){
            let show_list = this.GetGemDrawingList(i)
            for(var s_index in show_list){
                let attrs = this.GetDrawsCanedAttrList(show_list[s_index].drawing_id)

                for(var a_index in attrs){
                    let plus_flag = true
                    for(var c_index in attr_list){
                        if(attr_list[c_index].type == attrs[a_index].attrType)
                        {
                            plus_flag = false
                            attr_list[c_index].value = attr_list[c_index].value + attrs[a_index].attrValue
                        }
                    }

                    if(plus_flag){
                        let info = {
                            type:attrs[a_index].attrType,
                            name:AttrListName[attrs[a_index].attrType],
                            value:attrs[a_index].attrValue,
                        }
                        attr_list.push(info)
                    }
                }
            }
            
        }
        
        // 属性整理
        let plus_list = []
        for (var index in attr_list) {
            if( temp_cell.length < 3 ) {
                temp_cell.push(attr_list[index]);
            }

            if( temp_cell.length >= 3) {
                plus_list.push(temp_cell);
                temp_cell = []
            }
        }
        if(temp_cell.length>0){
            plus_list.push(temp_cell);
        }

        return {
            attr_list:plus_list,
        }
    }

    public GetIsShowEnter()
    {
        let param = this.GetEnterParam()
        return param.attr_list.length > 0
    }

    public ForceShowEff()
    {
        this.flush_info.show_eff = this.flush_info.show_eff + 1
    }

    public OpenedView()
    {
        this.flush_info.show_red = 1

        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public GetRedNum()
    {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.GemAtelier.View));
        if(!open_t.is_open){
            return 0
        }

        // LogError("?ficnle",this.flush_info.show_red,(this.flush_info.show_red == 0 || this.flush_info.show_red == undefined) ? 1 : 0)

        // LogError("?return ",this.flush_info.show_red,(this.flush_info.show_red == 0 || this.flush_info.show_red == undefined) ? 1 : 0)
        return 0 //(this.flush_info.show_red == 0 || this.flush_info.show_red == undefined) ? 1 : 0
    }

    public GetCoreRedNum()
    {
        if(CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.Gem) == 1){
            return 1
        }

        return 0
    }

    public GetMaxQua()
    {
        let level = 0
        let mark = 0
        for(var index in this.gem_info){
            let oper = this.gem_info[index]
            if(level <oper.level){
                level = oper.level
                mark = Number(index)
            }
        }

        if(level > 0){
            var config = CfgGemCfgData.drawing_up ;
            for (const info of config) {
                if(info.gem_drawing_id == mark && 
                    level == info.gem_drawing_level){
    
                    return info.color
                }
            }
        }
        

        return 1
    }

    public GetGemLevelList(level:number){
        let num_ten = Math.floor(level/10)
        let num_s = Math.floor(level%10)
        let list = []
        if(num_ten >0){
            let info = {
                num : num_ten
            }
            list.push(info)
        }

        let s_info = {
            num : num_s
        }
        list.push(s_info)
        return list
    }

    public GetGemDrawIsFull(pic:number){
        let net_list = this.GetNetGemInfo({draw_id:pic})
        for(var index in net_list){
            if(net_list[index].pos == -1){
                return true
            }
        }
        return false
    }

    public GetupGradeTarget(start:any){
        let item_cfg = Item.GetConfig(start.item_id);
        let cfg = CfgGemData
        let start_info = {
            item_id:item_cfg.id,
            level:item_cfg.gem_level
        }

        let target = null
        for(var index in cfg){
            if(cfg[index].param == item_cfg.param 
                && item_cfg.gem_level+1 == cfg[index].gem_level){
                    let info = {
                        item_id:cfg[index].id,
                        level:cfg[index].gem_level
                    }
                target = info
            }
        }

        return {
            ready_item:start_info,
            target_item:target,
        }
    }

    public GetDrawingSetCfg(draw_id:number,level:number):CfgDrawingSet
    {
        let cfg = CfgGemCfgData.drawing_set
        for(var index in cfg)
        {
            if(cfg[index].gem_drawing_level == level && cfg[index].id == draw_id)
            {
                return cfg[index]
            }
        }
        
    return null
    }

    public GetOneKeyOperDetail(draw_id:number,level:number)
    {
        let group: any[] = []
        let result = {
            jump_group: group
        }
        let item_cfg = this.GetGemDrawItem(draw_id)
        let cfg = this.GetDrawingSetCfg(item_cfg.id,level)
        
        if(cfg == null){
            return result
        }

        let draw_pos = this.CheckDrawPos(draw_id,true)

        let pos_1s = cfg.position_1.split("|")
        let d_1_cfg = draw_pos[cfg.position_1]
        let info_1 = {
            item_id:cfg.item_id_1,
            x:pos_1s[0],
            y:pos_1s[1],
            pos_x:d_1_cfg.x_pos,
            pos_y:d_1_cfg.y_pos,
        }

        let pos_2s = cfg.position_2.split("|")
        let d_2_cfg = draw_pos[cfg.position_2]
        let info_2 = {
            item_id:cfg.item_id_2,
            x:pos_2s[0],
            y:pos_2s[1],
            pos_x:d_2_cfg.x_pos,
            pos_y:d_2_cfg.y_pos,
        }

        let pos_3s = cfg.position_3.split("|")
        let d_3_cfg = draw_pos[cfg.position_3]
        let info_3 = {
            item_id:cfg.item_id_3,
            x:pos_3s[0],
            y:pos_3s[1],
            pos_x:d_3_cfg.x_pos,
            pos_y:d_3_cfg.y_pos,
        }
        
        let pos_4s = cfg.position_4.split("|")
        let d_4_cfg = draw_pos[cfg.position_4]
        let info_4 = {
            item_id:cfg.item_id_4,
            x:pos_4s[0],
            y:pos_4s[1],
            pos_x:d_4_cfg.x_pos,
            pos_y:d_4_cfg.y_pos,
        }
        
        let pos_5s = cfg.position_5.split("|")
        let d_5_cfg = draw_pos[cfg.position_5]
        let info_5 = {
            item_id:cfg.item_id_5,
            x:pos_5s[0],
            y:pos_5s[1],
            pos_x:d_5_cfg.x_pos,
            pos_y:d_5_cfg.y_pos,
        }    

        group.push(info_1)
        group.push(info_2)
        group.push(info_3)
        group.push(info_4)
        group.push(info_5)
        
        if(cfg.item_id_6 > 0)
        {
            let pos_6s = cfg.position_6.split("|")
            let d_6_cfg = draw_pos[cfg.position_6]
            let info_6 = {
                item_id:cfg.item_id_6,
                x:pos_6s[0],
                y:pos_6s[1],
                pos_x:d_6_cfg.x_pos,
                pos_y:d_6_cfg.y_pos,
            }
            
            group.push(info_6)
        }

        result.jump_group = group
        return result
    }

    // 以这个方法为起点，区分成功与否
    public CheckCanOneKey(draw_id:number,level:number)
    {
        let param = this.GetOneKeyOperDetail(draw_id,level)
        for(var index in param.jump_group)
        {
            let oper = param.jump_group[index]
            let num = Item.GetNum(oper.item_id)
            if(num == 0){
                return true
            }
        }
        return false
    }

    // 
    public GetDrawUpNeedDetail(draw_id:number,level:number)
    {
        let g_list: any[] = []
        let send_list : any[] = []
        let checked_list : any[] = []
        let result = {
            list:g_list,
            need_item:0,
            need_num:0,
            send_list:send_list,
        }

        // 整理需求
        let param = this.GetOneKeyOperDetail(draw_id,level)
        let need_list = []
        for(var index in param.jump_group)
        {
            let oper = param.jump_group[index]
            let num = Item.GetNum(oper.item_id)
            if(num == 0){
                need_list.push(oper.item_id)
            }

            let info = {
                name:Item.GetName(oper.item_id),
                item_info:{item_id:oper.item_id},
                is_low_enough:false,
                is_enough:false,
                un_enough_t:"",
                need_num:0,
                need_cast:0,
                need_item:CommonId.Diamond,
            }
            checked_list.push(info)
        }

        // 这里放进去的不足的item_id 
        g_list = this.CheckGemUpNeedNum(need_list)

        // 针对递归结果进行需求数统算-- 当然是需求购买数
        for(var index in g_list)
        {
            for(var checked in checked_list)
            {
                let cfg = Item.GetConfig(checked_list[checked].item_info.item_id) //.ori_id
                if(g_list[index] == cfg.ori_id)
                {
                    checked_list[checked].need_num = checked_list[checked].need_num + 1
                    break
                }
            }
        }

        for(var index in checked_list)
        {
            let stuff_id = this.GetGemStuffItem(checked_list[index].item_info.item_id)
            let num = Item.GetNum(checked_list[index].item_info.item_id)
            let cfg = Item.GetConfig(checked_list[index].item_info.item_id)
            let stuff_cfg = Item.GetConfig(cfg.ori_id)
            let cfg_com = this.GetGemCompoundCfg(stuff_cfg.ts_gem,stuff_cfg.gem_level)
            // 持有数为0但是没有需求数
            checked_list[index].is_low_enough = num == 0 && checked_list[index].need_num == 0
            // 持有数不为0
            checked_list[index].is_enough = num > 0
            //
            checked_list[index].un_enough_t = TextHelper.Format(Language.GemAtelier.OneKeyGemLackNeed
                ,checked_list[index].need_num,Item.GetName(cfg.ori_id))

            checked_list[index].need_cast = cfg_com.price_count * checked_list[index].need_num
            

            result.need_num = checked_list[index].need_cast + result.need_num
        }

        result.list = checked_list
        result.need_item = CommonId.Diamond
        result.send_list = need_list
        return result
    }

    // 返回需要的item_id与num
    public CheckGemUpNeedNum(param:number[]) :number[]
    {
        let checked_list : any[] = []
        let caches_num : any[] = []
        let needs_num : any[] = []
        for(var index in param)
        {
            let item_id = this.GetGemStuffItem(param[index])
            let cfg = Item.GetConfig(param[index])
            if(item_id > 0)
            {
                let num = Item.GetNum(item_id)
                caches_num[item_id] = num
                if(needs_num[item_id] == null)
                {
                    needs_num[item_id] = 3    //  就是要三个
                }
                else 
                {
                    needs_num[item_id] = 3 +needs_num[item_id]//  就是要三个
                }
            }
            else if (cfg.gem_level == 1)
            {
                let num = Item.GetNum(param[index])
                caches_num[param[index]] = num
                if(needs_num[param[index]] == null)
                {
                    needs_num[param[index]] = 1    //  要它自己
                }
                else 
                {
                    needs_num[param[index]] = 1 +needs_num[param[index]]//  要它自己
                }
            }
        }

        for(var item_id in needs_num)
        {
            if(caches_num[item_id] < needs_num[item_id])
            {
                let need_num = needs_num[item_id] - caches_num[item_id]

                for(let i = 0;i< need_num;i++)
                {
                    checked_list.push(item_id)
                }
            }
        }


        let keep_check = false
        for(var index in checked_list)
        {
            let item_id = this.GetGemStuffItem(checked_list[index])
            if(item_id > 0)
            {
                keep_check = true
            }
        }

        if(keep_check)
        {
            return this.CheckGemUpNeedNum(checked_list)
        }
        else 
        {
            return checked_list
        }

    }

    public GetGemStuffItem(item_id:number)
    {
        var config = CfgGemData ;
        for (var index in config) {
            if(config[index].up == item_id){
                return config[index].id
            }
        }

        return 0
    }

    public ChangeLock(flag:boolean)
    {
        this.lock_flush = flag

        if(!flag)
        {
            this.flush_info.needflush = this.flush_info.needflush + 1
        }
    }

    public TryOneKeySend(draw_id:number,level:number){
        this.ChangeLock(true)

        // this.GetOneKeyOperDetail()
        // 先全部拆下来，再全部装上去
        this.OperOnekeyRemove(draw_id)
        this.OperOneKeyInset(draw_id,level)
    }

    public OperOnekeyRemove(draw_id:number)
    {
        let net_draw = this.GetNetGemInfo({ draw_id: draw_id })
        for (var index in net_draw) {
            let oper = net_draw[index]
            
            if (oper.itemId > 0) {
                GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.REMOVE,
                    {
                        param1: draw_id,
                        param2: Number(index),
                        param3: 0, param4: 0,
                    })
            }
        }
    }

    public OperOneKeyInset(draw_id:number,level:number){
        let param = this.GetOneKeyOperDetail(draw_id,level)

        for (var index in param.jump_group) {
            let oper = param.jump_group[index]
            GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.INLAY,
                {
                    param1: draw_id,
                    param2: oper.item_id,
                    param3: oper.x,
                    param4: oper.y,
                })
        }
    }

    // 是否半价
    public IsDiscounts():boolean{
        return true;
    }

}
