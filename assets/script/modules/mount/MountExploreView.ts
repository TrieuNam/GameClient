import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { UIObjectFactory, UIPackage } from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ViewManager } from "manager/ViewManager";
import { BoardData } from 'modules/common_board/BoardData';
import { Language } from 'modules/common/Language';
import { UH } from "../../helpers/UIHelper";
import { ItemCell } from "modules/extends/ItemCell";
import { MountData } from "modules/mount/MountData";
import { CommonId } from "modules/common/CommonEnum";
import { ICON_TYPE, ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { MountShowCell } from "modules/mount/MountAwakeView";
import { MountCtrl, MOUNR_REQ_TYPE } from "modules/mount/MountCtrl";
import { RedPoint } from '../extends/RedPoint';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { ChannelAgent, GameToChannel, tuiSongID } from '../../proload/ChannelAgent';

@BaseView.registView
export class MountExploreView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountExtra",
        ViewName: "MountExplore",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    private mount_list: any;
    protected viewNode = {
        Board: <CommonBoard3>null,
        ProfitIcon: <fgui.GLoader>null,
        ProfitTime: <fgui.GLabel>null,
        ProfitList: <fgui.GList>null,
        ProfitProgress: <fgui.GProgressBar>null,
        ProfitIcon2: <fgui.GLoader>null,
        ProfitNum: <fgui.GLabel>null,
        BtnGive: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
    }

    protected extendsCfg = [
        { ResName: "MountExploreCell", ExtendsClass: MountExploreCell },
        { ResName: "MountShowCell", ExtendsClass: MountShowCell },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(MountExploreView, Language.Mount.Title[1], 1))
        this.viewNode.ProfitList.setVirtual()
        this.mount_list = MountData.Inst().GetMainMountList()
        this.viewNode.ProfitList.SetData(this.mount_list);
        UH.SetIcon(this.viewNode.ProfitIcon, this.mount_list[0].explore_item_id, ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.ProfitIcon2, this.mount_list[0].explore_item_id, ICON_TYPE.ITEM);

        this.viewNode.BtnGive.onClick(this.ClickBtnGive.bind(this));

        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");

        this.flushInfoPanel()
    }

    private flushInfoPanel() {
        let param = MountData.Inst().GetMountExploreProfit()
        UH.SetText(this.viewNode.ProfitTime, param.cur_num + Language.Mount.TimerShow)
        this.viewNode.ProfitProgress.max = param.max_pro;
        this.viewNode.ProfitProgress.value = param.cur_pro
        UH.SetText(this.viewNode.ProfitNum, param.cur_pro + "/" + param.max_pro)

        //let num = (param.cur_pro >= Math.floor(param.max_pro/2)&&param.max_pro > 0 ) ? 1 : 0
        let num = MountData.Inst().GetMountExploreRed() ? 1 : 0
        this.viewNode.RedPoint.SetNum(num)
    }

    private CloseView() {
        ViewManager.Inst().CloseView(MountExploreView)
    }

    private ClickBtnGive() {
        if (this.viewNode.ProfitProgress.value == 0) {
            PublicPopupCtrl.Inst().Center(Language.Mount.LackExplore);
            return
        }
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.EXPLORE, 0)
    }
    CloseCallBack(): void {
        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.mont);

    }
}

export class MountExploreCell extends fgui.GComponent {

    private viewNode = {
        MountShowCell: <MountShowCell>null,
        Profit: <fgui.GLoader>null,
        timer: <fgui.GLabel>null,
        UnLock: <fgui.GGroup>null,
    }

    protected onConstruct() {
        super.onConstruct();

        // LogError("?sad onConstruct")
        // let url = UIPackage.getItemURL("MountExtra", "MountShowCell");
        // UIObjectFactory.setExtension(url, MountShowCell);

        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetIcon(this.viewNode.Profit, data.explore_item_id, ICON_TYPE.ITEM);
        data.awake_red_num = 0
        this.viewNode.MountShowCell.SetData(data)
        this.viewNode.UnLock.visible = data.grade == 0
        UH.SetText(this.viewNode.timer, data.explore_num + Language.Mount.TimerShow)
    }
}