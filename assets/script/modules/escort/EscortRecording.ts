import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem, BaseItemGL } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { Format } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortCtrl } from "./EscortCtrl";
import { EscortData, ESCORT_OPER_TYPE, SEscortReport } from "./EscortData";

@BaseView.registView
export class EscortRecording extends BaseView {
    data: EscortData = EscortData.Inst()
    protected viewRegcfg = {
        UIPackName: "EscortRecording",
        ViewName: "EscortRecording",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Escort.Title3,
    }; */

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        NoneObj: <fgui.GObject>null,
    };

    protected extendsCfg = [
        { ResName: "RecordingItem", ExtendsClass: EscortRecordingItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(EscortRecording, Language.Escort.Title3))
        this.viewNode.List.setVirtual()
        this.AddSmartDataCare(this.data.FlushData, this.OnReportChange.bind(this), "flush_report")
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.REPORT_LIST_INFO_REQ)
    }
    OnReportChange() {
        if (this.data.ReportData == null) {
            this.viewNode.NoneObj.visible = true
        } else {
            this.viewNode.NoneObj.visible = (this.data.ReportData.length == 0)
            this.viewNode.List.SetData(this.data.ReportData)
        }
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        this.OnReportChange()
    }

    CloseCallBack() {
    }
}

export class EscortRecordingItem extends fgui.GComponent {
    private viewNode = {
        Time: <fgui.GTextField>null,
        Desc: <fgui.GRichTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    SetData(data: SEscortReport) {
        let time_data = TimeHelper.FormatUnixTimeDate(data.report_time)
        UH.SetText(this.viewNode.Time, Format(Language.Escort.TimeDesc, time_data.year, time_data.month, time_data.day))
        UH.SetText(this.viewNode.Desc, data.result_str)
    }
}