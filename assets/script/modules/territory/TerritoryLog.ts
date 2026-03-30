import { sys } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TerritoryData } from "./TerritoryData";
@BaseView.registView
export class TerritoryLog extends BaseView {
    data = TerritoryData.Inst()
    protected viewRegcfg = {
        UIPackName: "TerritoryLog",
        ViewName: "TerritoryLog",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        List: <fgui.GList>null,
        NoneLog: <fgui.GLabel>null,
    }

    protected extendsCfg = [
        { ResName: "LogItem", ExtendsClass: TerritoryLogItem },
    ];
    InitData(param: any): void {
        this.viewNode.List.scrollItemToViewOnClick = false
        this.viewNode.Board.SetData(new BoardData(TerritoryLog, Language.Territory.Title3))
    }

    InitUI(): void {
        if (this.data.report_list == null) { return }
        this.viewNode.List.SetData(this.data.report_list)
        //let logLen = this.data.report_list.length == 6? "5":this.data.report_list.length + "";
        sys.localStorage.setItem("TerritoryRed", this.data.report_list.length + "");
        this.viewNode.NoneLog.visible = (this.data.report_list.length == 0)
    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {

    }

    CloseCallBack(): void {
        if (this.data.show_mine) {
            TerritoryCtrl.Inst().SendTerritoryInfo(RoleData.Inst().GetRoleId());
        } else {
            if (this.data.other_territory && this.data.other_territory.roleInfo && this.data.other_territory.roleInfo.roleId) {
                TerritoryCtrl.Inst().SendTerritoryInfo(this.data.other_territory.roleInfo.roleId)//RoleData.Inst().GetRoleId());
            }
        }
    }

    WindowSizeChange() {

    }

}
class TerritoryLogItem extends BaseItem {
    protected viewNode = {
        Head: <AvatarCell>null,
        TimeDesc: <fgui.GTextField>null,
        TitleDesc: <fgui.GTextField>null,
        Desc: <fgui.GTextField>null,
        BtnGo: <fgui.GButton>null,
    };
    protected _data: IPB_SCTerritoryReportNode = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGo.onClick(this.OnClickGo, this)
    }
    OnClickGo() {
        if (this._data && this._data.roleInfo) {
            TerritoryCtrl.Inst().SendTerritoryInfo(this._data.roleInfo.roleId)
        }
        ViewManager.Inst().CloseView(TerritoryLog)
    }
    public SetData(data: IPB_SCTerritoryReportNode) {
        this._data = data;
        let time_1 = TimeHelper.FormatUnixTimeDate(TimeCtrl.Inst().ServerTime)
        let time_2 = TimeHelper.FormatUnixTimeDate(data.reportTime)
        let min = time_1.minute - time_2.minute < 0 ? 0 : time_1.minute - time_2.minute;
        if (time_1.hour == time_2.hour) {
            UH.SetText(this.viewNode.TimeDesc, Format(Language.Territory.MinuDesc, min))
        } else if (time_1.day == time_2.day) {
            UH.SetText(this.viewNode.TimeDesc, Format(Language.Territory.HourDesc, time_1.hour - time_2.hour))
        } else if (time_1.month == time_2.month) {
            UH.SetText(this.viewNode.TimeDesc, Format(Language.Territory.DayDesc, time_1.day - time_2.day))
        } else {
            UH.SetText(this.viewNode.TimeDesc, Format(Language.Territory.DateDesc, time_2.month, time_2.day))
        }
        UH.SetText(this.viewNode.TitleDesc, DataHelper.BytesToString(data.reportSub))
        let desc: string = DataHelper.BytesToString(data.reportText)
        UH.SetText(this.viewNode.Desc, desc)
        let res = desc.match(Language.Territory.MatchText)
        if (!IsEmpty(res)) {
            this.viewNode.BtnGo.title = Language.Territory.BtnDesc
        }
        this.viewNode.Head.SetData(new AvatarData(data.roleInfo.headPicId, data.roleInfo.level, data.roleInfo.headChar))
    }
    public GetData() {
        return this._data;
    }
}