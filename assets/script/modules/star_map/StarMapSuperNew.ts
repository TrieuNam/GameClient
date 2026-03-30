import { Color, sys, Vec2 } from "cc";
import { CfgNewSuperStar } from "config/CfgStarmap";
import * as fgui from "fairygui-cc";
import { GRoot } from "fairygui-cc/GRoot";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { HelpView } from "modules/common_help/CommonHelpView";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { IStarMapSuperNewCfg, StarMapSuperNewCfg } from "./StarMapConifg";
import { StarMapCtrl, STAR_MAP_REQ_TYPE } from "./StarMapCtrl";
import { StarMapMainView } from "./StarMapMainView";
import { IStarMapSuperNewGroupItemData, StarMapNodeState, StarMapSuperData } from "./StarMapSuperData";
import { SuperResetView } from "./SuperResetView";

var maxStarSuperCount = 0;
// 这是新版超星系
@BaseView.registView
export class StarMapSuperNew extends BaseView {
    static isShowInfo:boolean;

    protected viewRegcfg = {
        UIPackName: "StarMapSuperNew",
        ViewName: "StarMapSuperNewView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board:<CommonBoard3>null,
        BG:<EGLoader>null,
        HelpBtn:<fgui.GButton>null,
        ResetBtn:<fgui.GButton>null,
        AttriPreBtn:<fgui.GButton>null,
        InfoBtn:<fgui.GButton>null,
        List:<fgui.GList>null,
        PopupInfo:<StarSuperPopupInfo>null,
    };

    protected extendsCfg = [
        { ResName: "StarNodeItem", ExtendsClass: StarMapSuperNewNodeItem },
        { ResName: "TopItem", ExtendsClass: StarMapSuperTopItem },
        { ResName: "NodeGroupItem", ExtendsClass: StarMapSuperGroupItem },
        { ResName: "StarTag", ExtendsClass: StarMapSuperTabItem },
        { ResName: "EmptyItem", ExtendsClass: BaseItem },
        { ResName: "PopupInfo", ExtendsClass: StarSuperPopupInfo },
    ];

    private isClickedItem = false;

    InitData() {
        StarMapSuperNew.isShowInfo = false;
        this.viewNode.Board.SetData(new BoardData(StarMapSuperNew,Language.StarMap.SuperStarTitle,6));

        this.viewNode.HelpBtn.onClick(this.OnClickTips.bind(this));
        this.viewNode.ResetBtn.onClick(this.OnClickReset.bind(this));
        this.viewNode.AttriPreBtn.onClick(this.OnClickAttrShow.bind(this));
        this.viewNode.InfoBtn.onClick(this.OnClickShowLevel.bind(this));

        this.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.List.setVirtual();
        this.viewNode.List.on(fgui.Event.SCROLL, ()=>{
            if(StarMapSuperData.Inst().selNodeInfo.star_node != null){
                StarMapSuperData.Inst().selNodeInfo.star_node = null;
            }
        })

        this.view.onClick(()=>{
            if(this.viewNode.PopupInfo.visible && StarMapSuperData.Inst().selNodeInfo.star_node == this.viewNode.PopupInfo.GetData()){
                StarMapSuperData.Inst().selNodeInfo.star_node = null;
            }
        });

        this.AddSmartDataCare(StarMapSuperData.Inst().selNodeInfo, this.FlushPop.bind(this), "star_node");
        this.AddSmartDataCare(StarMapSuperData.Inst().starInfo, this.FlushList.bind(this), "bigStarMapLevel", "bigStarConsume");

        this.FlushList();
        this.ScrollToView();
        this.ClosePop();
    }

    InitUI() {
    }

    private listData:IStarMapSuperNewGroupItemData[];
    FlushList(){
        if(this.listData == null){
            this.listData = StarMapSuperData.Inst().GetGroupItemDatas();
        }
        this.viewNode.List.SetData(this.listData);
        maxStarSuperCount = this.listData.length;
    }

    ScrollToView(){
        this.viewNode.List.scrollToView(this.GetToIndex());
    }

    GetToIndex():number{
        let lastIndex = sys.localStorage.getItem("starMapSuperJumpIndex" + RoleData.Inst().GetRoleId());
        if(lastIndex != null && lastIndex != ""){
            let index = Number(lastIndex);
            if(index < maxStarSuperCount){
                return index;
            }
        }
        let minLevel = 10000;
        for(let i = 0; i < 4; i++){
            let level = StarMapSuperData.Inst().GetRouteLevel(i);
            if(level < minLevel){
                minLevel = level;
            }
        }
        return minLevel + 1;
    }

    private GetListItemResource(index: number) {
        if(index == 0){
            return fgui.UIPackage.getItemURL("StarMapSuperNew", "TopItem");
        }else if(index + 1 == this.listData.length){
            return fgui.UIPackage.getItemURL("StarMapSuperNew", "EmptyItem");
        }else{
            return fgui.UIPackage.getItemURL("StarMapSuperNew", "NodeGroupItem");
        }
    }

    DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        self.viewNode.BG.SetIcon("loader/star_map/ChaoXingXiXinBeiJing", () => {
            waitHandle.complete = true;
        })
    }

    FlushPop(){
        let node = StarMapSuperData.Inst().selNodeInfo.star_node;
        if(node != null){
            this.ShowPop(node,StarMapSuperData.Inst().selNodeInfo.pos);
        }else{
            this.ClosePop();
        }
    }

    ShowPop(data: CfgNewSuperStar, pos?:Vec2){
        this.viewNode.PopupInfo.visible = true;
        this.viewNode.PopupInfo.SetData(data);
        if(pos){
            this.viewNode.PopupInfo.SetPos(pos);
        }
    }

    ClosePop(){
        this.viewNode.PopupInfo.visible = false;
    }

    OpenCallBack() {
        ViewManager.Inst().CloseView(StarMapMainView)
    }

    CloseCallBack() {
        StarMapSuperData.Inst().selNodeInfo.star_node = null;
    }


    private OnClickTips() {
        ViewManager.Inst().OpenView(HelpView, 6);
    }

    private OnClickReset() {
        ViewManager.Inst().OpenView(SuperResetView)
    }

    private OnClickAttrShow() {
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: StarMapSuperData.Inst().GetSuperStarAllAttr()
        })
    }

    private OnClickShowLevel() {
        StarMapSuperNew.isShowInfo = !StarMapSuperNew.isShowInfo
        this.FlushList();
    }
}

export class StarMapSuperTopItem extends BaseItem{
    protected viewNode = {
        BeginStarText:<fgui.GTextField>null,
        TabList:<fgui.GList>null,
    };

    protected onConstruct(): void {
        super.onConstruct();
        this.ShowTab();
    }

    public SetData(data: IStarMapSuperNewGroupItemData): void {
        
    }

    private ShowTab(){
        let list = []
        for(let i = 0; i < 4; i++){
            list.push(StarMapSuperNewCfg[i])
        }
        this.viewNode.TabList.SetData(list)
    }
}


export class StarMapSuperTabItem extends BaseItem{
    protected viewNode = {
        icon:<fgui.GLoader>null,
        title:<fgui.GTextField>null,
    };
    public SetData(data: IStarMapSuperNewCfg): void {
        UH.SpriteName(this.viewNode.icon, "StarMapSuperNew", data.tabImg);
        UH.SetText(this.viewNode.title, Language.StarMapSuperNew.tabTitles[data.route]);
    }
}

export class StarMapSuperGroupItem extends BaseItem{
    protected viewNode = {
        NodeList:<fgui.GList>null,
    };

    protected onConstruct(): void {
        super.onConstruct();
        this.viewNode.NodeList.on(fgui.Event.CLICK_ITEM, this.OnItemClick, this)
    }

    public SetData(data: IStarMapSuperNewGroupItemData): void {
        this._data = data;
        this.viewNode.NodeList.SetData(data.list);
    }

    private OnItemClick(item:StarMapSuperNewNodeItem){
        let data = <CfgNewSuperStar>item.GetData();
        let state = StarMapSuperData.Inst().GetNodeStateByData(data);
        if(StarMapSuperData.Inst().selNodeInfo.star_node != data && state != StarMapNodeState.Hide){
            StarMapSuperData.Inst().selNodeInfo.star_node = data;
            let screenPos = item.localToGlobal();
            StarMapSuperData.Inst().selNodeInfo.pos = screenPos;
        }else{
            StarMapSuperData.Inst().selNodeInfo.star_node = null
        }

        if(state == StarMapNodeState.Hide){
            PublicPopupCtrl.Inst().Center(Language.StarMapSuperNew.activeTIp);
            return;
        }
    }
}


export class StarMapSuperNewNodeItem extends BaseItemGB{
    protected viewNode = {
        StarBG:<fgui.GLoader>null,
        StarIcon:<fgui.GLoader>null,
        Level:<fgui.GTextField>null,
        Num:<fgui.GTextField>null,
        GrayLine:<fgui.GImage>null,
        ShowLine:<fgui.GImage>null,
        SelImg:<fgui.GImage>null,
        Eff:<UIEffectShow>null,
    };

    public SetData(data: CfgNewSuperStar): void {
        this._data = data;
        let route = data.route;
        let customCfg = StarMapSuperNewCfg[route]
        if(customCfg == null){
            return
        }

        let lineH = data.star_id % 5 == 0 ? 75 : 90;
        this.viewNode.GrayLine.height = lineH;
        this.viewNode.ShowLine.height = lineH;

        this.viewNode.SelImg.visible = false; //StarMapSuperData.Inst().selNodeInfo.star_node == data;

        let nodeBG;
        if(data.icon_size != 1){
            nodeBG = customCfg.NodeBGMax;
            UH.SetIcon(this.viewNode.StarIcon, data.star_skill_icon, ICON_TYPE.SKILL);
            //UH.SpriteName(this.viewNode.StarIcon, "StarMapSuperNew", customCfg.AttrIconMax);
        }else{
            nodeBG = customCfg.NodeBG;
            UH.SpriteName(this.viewNode.StarIcon, "StarMapSuperNew", customCfg.AttrIcon);
        }
        UH.SpriteName(this.viewNode.StarBG, "StarMapSuperNew", nodeBG);
        
        // 状态
        let state = StarMapSuperData.Inst().GetNodeStateByData(data);
        let stateCtrl = this.getController("stateCtrl");
        stateCtrl.setSelectedIndex(state);
        this.viewNode.StarBG.grayed = state != StarMapNodeState.Show;
        this.viewNode.StarIcon.grayed = state != StarMapNodeState.Show;

        if(state != StarMapNodeState.Hide){
            let name_str = data.icon_size == 1.2 || StarMapSuperNew.isShowInfo ? data.star_name : "";
            UH.SetText(this.viewNode.Level, name_str);
            this.viewNode.ShowLine.color = new Color(customCfg.color);
            let multiple = StarMapSuperData.Inst().GetStuffMultiple(data.route);
            if(multiple == 1){
                UH.SetText(this.viewNode.Num, "");
            }else{
                let color = customCfg.FontColor;
                UH.SetText(this.viewNode.Num, TextHelper.ColorStr(Format("x{0}", multiple), color));
            }
        }

        if(state == StarMapNodeState.CanActive){
            this.viewNode.Eff.PlayEff("4164040");
        }else{
            this.viewNode.Eff.StopEff("4164040");
        }
    }
}


export class StarSuperPopupInfo extends BaseItem{
    protected viewNode= {
        SkillBG: <fgui.GLoader>null,
        SkillIcon: <fgui.GLoader>null,
        SkillDesc: <fgui.GRichTextField>null,
        SkillName: <fgui.GTextField>null,
        StarName: <fgui.GTextField>null,
        Close: <fgui.GLoader>null,
        ActiveBtn: <fgui.GButton>null,
        ItemIcon: <fgui.GLoader>null,
        ItemNum: <fgui.GRichTextField>null,
        JianTou1: <fgui.GImage>null,
        JianTou2: <fgui.GImage>null,
        JianTou3: <fgui.GImage>null,
    };

    private nodeStateCtrl:fgui.Controller;
    private posStateCtrl:fgui.Controller;

    protected onConstruct(){
        super.onConstruct();
        this.viewNode.ActiveBtn.onClick(this.OnBtnClick.bind(this));
        this.viewNode.Close.onClick(this.OnCloseClick.bind(this));
        this.nodeStateCtrl = this.getController("NodeState");
        this.posStateCtrl = this.getController("PosState");
    }

    public SetData(data: CfgNewSuperStar): void {
        this._data = data;
        let state = StarMapSuperData.Inst().GetNodeStateByData(data);
        this.nodeStateCtrl.selectedIndex = <number>state;

        UH.SetText(this.viewNode.SkillName, "");
        let route_cfg = StarMapSuperNewCfg[data.route];
        UH.SetText(this.viewNode.StarName, data.star_name);
        if(data.icon_size == 1.2){
            UH.SetText(this.viewNode.SkillDesc, data.star_txt);
            UH.SpriteName(this.viewNode.SkillBG, "StarMapSuperNew",route_cfg.NodeBGMax);
            //UH.SpriteName(this.viewNode.SkillIcon, "StarMapSuperNew",route_cfg.AttrIconMax);
            UH.SetIcon(this.viewNode.SkillIcon, data.star_skill_icon, ICON_TYPE.SKILL); 
        }else{
            let att = data.jihuo_att[0];
            UH.SetText(this.viewNode.SkillDesc, `${AttrListName[att.type]}  +${AttrHelper.Percent(att.type, att.add)}`);
            UH.SpriteName(this.viewNode.SkillBG, "StarMapSuperNew",route_cfg.NodeBG);
            UH.SpriteName(this.viewNode.SkillIcon, "StarMapSuperNew",route_cfg.AttrIcon);
        }

        if(state == StarMapNodeState.CanActive){
            let cost_item = data.cost_item[0];
            UH.SetIcon(this.viewNode.ItemIcon, cost_item.item_id, ICON_TYPE.ITEM);
            let item_num = Item.GetNum(cost_item.item_id);
            let cost_num = cost_item.num * StarMapSuperData.Inst().GetStuffMultiple(data.route);
            let item_color = item_num >= cost_num ? COLORSTR.Yellow1 : COLORSTR.Red1
            UH.SetText(this.viewNode.ItemNum, TextHelper.ColorStr(item_num + "/" + cost_num, item_color));
        }
        
    }

    OnCloseClick(){
        StarMapSuperData.Inst().selNodeInfo.star_node = null;
    }

    OnBtnClick(){
        let cost_item = this._data.cost_item[0];
        let item_num = Item.GetNum(cost_item.item_id);
        let cost_num = cost_item.num * StarMapSuperData.Inst().GetStuffMultiple(this._data.route);
        StarMapSuperData.Inst().selNodeInfo.star_node = null;
        if(item_num < cost_num){
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(cost_item.item_id)
            return
        }
        StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.NEW_BIG_UP, {param1:this._data.route});
        AudioManager.Inst().Play(AudioTag.JiHuo);
        let index = this._data.star_id + 3;
        if(index >= maxStarSuperCount){
            index = maxStarSuperCount - 1;
        }
        sys.localStorage.setItem("starMapSuperJumpIndex" + RoleData.Inst().GetRoleId(), index.toString());
    }

    SetPos(pos:Vec2){
        pos = this.parent.globalToLocal(pos.x, pos.y);
        let state = StarMapSuperData.Inst().GetNodeStateByData(this._data);
        this.posStateCtrl.selectedIndex = pos.y < 1000 ? 0 : 1
        if(pos.y > 900 && state == StarMapNodeState.Show){
            this.posStateCtrl.selectedIndex = 2;
        }
        if(this.posStateCtrl.selectedIndex == 0){
            pos = new Vec2(pos.x + 31, pos.y + 100)
        }else if(this.posStateCtrl.selectedIndex == 1){
            pos = new Vec2(pos.x + 31, pos.y - 350)
        }else{
            pos = new Vec2(pos.x + 31, pos.y - 280)
        }

        if(this._data.route == 3){
            pos.x = pos.x - 80
            this.viewNode.JianTou1.x = 80;
            this.viewNode.JianTou2.x = 80;
            this.viewNode.JianTou3.x = 80;
        }else{
            this.viewNode.JianTou1.x = 0;
            this.viewNode.JianTou2.x = 0;
            this.viewNode.JianTou3.x = 0;
        }
        this.setPosition(pos.x, pos.y);
    }
}
