import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { HelpView } from "modules/common_help/CommonHelpView";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RoleAvatarItem } from "modules/main/MainItems";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { UH } from "../../helpers/UIHelper";
import { PeakArenaData } from "./PeakArenaData";
import { PeakArenaRewardView } from "./PeakArenaRewardView";
import { PeakArenaView } from "./PeakArenaView";
import { RedPoint } from '../extends/RedPoint';
import { CfgDFArena } from "config/CfgDFArena";
import { Item } from "modules/bag/ItemData";
import { RANK_TO_OTHER, OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";

@BaseView.registView 
export class PeakArenaRankView extends BaseView {
    private type = RANK_TYPE.CrossArena;
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.PeakArena.RankTag[0], index: 0, modKey:null, isRemind: false },
        { panel: null, viewName: "", titleName: Language.PeakArena.RankTag[1], index: 1, modKey:null, isRemind: false }
    ]
    
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PeakArenaRank",
        ViewName: "PeakArenaRankView",
        LayerType: ViewLayer.Buttom,
        ViewMask :ViewMask.BgBlock,
    };
    protected extendsCfg = [
        { ResName: "PeakArenaRankCell", ExtendsClass: PeakArenaRankCell },
        { ResName: "PeakArenaMyRank", ExtendsClass: PeakArenaRankCell },
    ]
    protected viewNode = {
        List: <fgui.GList>null,
        BtnTips: <fgui.GButton>null,
        MyRank: <PeakArenaRankCell>null,
        RankReward: <fgui.GButton>null,
        BtnChallenge: <fgui.GButton>null,
        BtnReturn: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
    };

    InitData() {
        RankData.Inst().CurRankType = this.type;
        this.viewNode.List.on(fgui.Event.SCROLL_END, this.OnScrollEnd, this);
        this.viewNode.List.setVirtual();
        this.viewNode.BtnTips.onClick(this.OnClickTips.bind(this));
        this.viewNode.RankReward.onClick(this.OnClickReward.bind(this));
        this.viewNode.BtnChallenge.onClick(this.OnClickChallenge.bind(this));
        this.viewNode.BtnReturn.onClick(this.OnClickReturn.bind(this));

        this.AddSmartDataCare(RankData.Inst().result_info, this.flushPanelInfo.bind(this), "is_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushRed.bind(this), "OtherChange");
        RankCtrl.Inst().SendRankReq(RANK_TYPE.CrossArena);

        GuideCtrl.Inst().AddGuideUi("PeakArenaRankBtnChallenge", this.viewNode.BtnChallenge);
        this.flushPanelInfo()
        this.FlushRed()
    }
    CloseCallBack(){
        GuideCtrl.Inst().ClearGuideUi("PeakArenaRankBtnChallenge");
        
        RankData.Inst().CurRankType = null;
        RankData.Inst().clearRankData(this.type);
    }
    private FlushRed()
    {
        let num = Item.GetNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)
        this.viewNode.RedPoint.SetNum(num>0 ? 1:0)
    }
    private flushPanelInfo() {
        let param = PeakArenaData.Inst().GetRankDetail()
        
        if(param.list.length == 0){return}

        LogError(" 提取本地排行版信息 我的数据：",param.my_info)
        this.viewNode.List.SetData(param.list)
        this.viewNode.MyRank.SetData(param.my_info)
    }

    private OnScrollEnd() {
        RankCtrl.Inst().SendRankReq(RANK_TYPE.CrossArena);
    }

    private OnClickTips()
    {
        ViewManager.Inst().OpenView(HelpView, 25);
    }

    private OnClickReward() {
        ViewManager.Inst().OpenView(PeakArenaRewardView)
    }

    private OnClickChallenge() {
        ViewManager.Inst().OpenView(PeakArenaView)
    }

    private OnClickReturn() {
        ViewManager.Inst().CloseView(PeakArenaRankView)
    }
}

// {item_id;}
export class PeakArenaRankCell extends fgui.GComponent {
    private viewNode = {
        RoleAvatar: <AvatarCell>null,
        Name: <fgui.GLabel>null,
        Level: <fgui.GLabel>null,
        Point: <fgui.GLabel>null,
        Server: <fgui.GLabel>null,
        RankIcon: <fgui.GLoader>null,
        RankText: <fgui.GLabel>null,
        RankTxt: <fgui.GTextField>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.RoleAvatar.onClick(this.OtherRoleInfo.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        this.viewNode.RoleAvatar.SetData(new AvatarData(data.headPicId, data.level, data.headChar));
        UH.SetText(this.viewNode.Name,data.name)
        UH.SetText(this.viewNode.Point,data.point == 0? Language.Arena.no_rank :Language.PeakArena.NeoPointShow+data.point)
        UH.SetText(this.viewNode.Server,data.server)
        UH.SetText(this.viewNode.Level,Language.PeakArena.LevelShow+data.level)

        this.viewNode.RankIcon.visible = data.is_top
        this.viewNode.RankText.visible = ! data.is_top
        this.viewNode.RankTxt.visible = ! data.is_top

        if(data.is_top)
        {
            UH.SpriteName(this.viewNode.RankIcon, "CommonAtlas", "ShiLianZhiTa"+data.rank);
        }
        else
        {
        
            UH.SetText(this.viewNode.RankText,data.rank == 0 ? Language.Arena.no_rank :data.rank)
        }

    }
    private OtherRoleInfo() {
        let type = RankData.Inst().CurRankType;
        if (this.data && RANK_TO_OTHER[type]) {
            if (this.data.roleId < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(RANK_TO_OTHER[type], this.data.value, this.data.roleId);
        }
    }
}

