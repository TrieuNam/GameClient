
import * as fgui from "fairygui-cc";
import { BasePanel } from "modules/common/BasePanel";
import { ROLE_SETTING_TYPE } from "modules/common/CommonEnum";
import { RoleSettingViewNoticeLaber } from "./RoleSettingView";

export class RoleSettingNoticePanel extends BasePanel {

    protected viewNode = {
        TogShow: <RoleSettingViewNoticeLaber>null,
        TogList: <fgui.GList>null,
    };

    InitPanelData() {
        this.viewNode.TogShow.SetData(ROLE_SETTING_TYPE.NoticeEscortFinish);
        this.viewNode.TogList.SetData([
            ROLE_SETTING_TYPE.TerritoryBeRobbed,
            ROLE_SETTING_TYPE.TerritoryRobBedef,
            ROLE_SETTING_TYPE.NoticeBoxUpReduceTime,
            ROLE_SETTING_TYPE.NoticeBoxUpFinish,
            ROLE_SETTING_TYPE.NoticeBoxAutoFinish,
            ROLE_SETTING_TYPE.NoticeArenaCalc,
            ROLE_SETTING_TYPE.NoticeFishEnergyMax,
            ROLE_SETTING_TYPE.NoticeTrialCalc,
            ROLE_SETTING_TYPE.NoticeGuMoReward,
            // ROLE_SETTING_TYPE.NoticeFishAutoFinish,
            // ROLE_SETTING_TYPE.NoticeLoopMineFree,
            // ROLE_SETTING_TYPE.NoticeMountForageMax,
        ])
    }

    InitPanel() {
        // this.FlushGuMoLayerShow();
    }

    ClosePanel() {
    }

}