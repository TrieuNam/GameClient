import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ArenaData } from "modules/Arena/ArenaData";
import { BagData } from "modules/bag/BagData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { UH } from "../../helpers/UIHelper";
import { PeakArenaData } from "./PeakArenaData";

@BaseView.registView 
export class PeakArenaRewardView extends BaseView {
    private list_type = 0
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.PeakArena.RewardTag[0], index: 0, modKey:null, isRemind: false },
        { panel: null, viewName: "", titleName: Language.PeakArena.RewardTag[1], index: 1, modKey:null, isRemind: false }
    ]
    
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PeakArenaReward",
        ViewName: "PeakArenaRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "RewardShowCell", ExtendsClass: PeakArenaRewardShowCell },
    ]
    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        ListTab: <fgui.GList>null,
    };

    private viewType:number;    //0是普通竞技场，1是跨服竞技场
    InitData(param_t?: any) {
        if(param_t && param_t.viewType != null){
            this.viewType = param_t.viewType;
        }else{
            this.viewType = 1
        }
        this.viewNode.Board.SetData(new BoardData(PeakArenaRewardView,Language.PeakArena.RewardTag[this.list_type]))
        this.viewNode.Board.SetHelpVisible(false);
        this.viewNode.List.setVirtual();

        this.viewNode.ListTab.SetData(this.tabbarCfg);
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        this.viewNode.ListTab.selectedIndex = 0

        // this.AddSmartDataCare(PeakArenaData.Inst().flush_info, this.flushinfo.bind(this), "need_r_flush");

        this.flushPanelInfo()
    }
    // CloseCallBack(){

    // }
    private flushPanelInfo() {
        let list;
        if(this.viewType == 1){
            list = PeakArenaData.Inst().GetRewardList(this.list_type);
        }else{
            list = ArenaData.Inst().GetRewardList(this.list_type);
        }
        this.viewNode.List.SetData(list)
    }
    private flushinfo() {}

    private OnClickListItem(item:CommonBoard5Tab) {
        this.list_type = item._data.index
        
        this.viewNode.Board.SetTitle(Language.PeakArena.RewardTag[this.list_type])
        this.flushPanelInfo()
    }
}

// {item_id;}
export class PeakArenaRewardShowCell extends fgui.GComponent {
    private viewNode = {
        RankIcon: <fgui.GLoader>null,
        RankText: <fgui.GLabel>null,
        RewardList: <fgui.GList>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        
        this.viewNode.RankIcon.visible = data.is_top
        this.viewNode.RankText.visible = ! data.is_top
        this.viewNode.RewardList.SetData(data.list)

        if(data.is_top)
        {
            
            UH.SpriteName(this.viewNode.RankIcon, "CommonAtlas",  "ShiLianZhiTa" + data.rank);
        }
        else
        {
            UH.SetText(this.viewNode.RankText,data.rank)
        }

    }
}

