import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ShenQiData } from "./ShenQiData";

@BaseView.registView
export class ShenQiRecordView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShenQiRecord",
        ViewName: "ShenQiRecordView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: ShenQiRecordViewShowItem },
        { ResName: "MonoItem", ExtendsClass: ShenQiRecordViewMonoItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(ShenQiRecordView, Language.ShenQi.ShenQiRecord.TitleShow));
        this.viewNode.ShowList.setVirtual()

        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushShow.bind(this), "RecordInfo");
    }

    InitUI() {
        this.FlushShow();
    }

    CloseCallBack() {
    }


    FlushShow() {
        let show_list = ShenQiData.Inst().GetShenQiRecordShowList()
        this.viewNode.ShowList.SetData(show_list)
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(ShenQiRecordView)
    }
}


class ShenQiRecordViewShowItem extends BaseItem {
    protected viewNode = {
        TimeShow: <fgui.GTextField>null,
        ShowList: <fgui.GList>null,
    };

    public SetData(data: IPB_ShenQiRecordData) {
        super.SetData(data);

        let time_t = TimeHelper.FormatUnixTimeDate(data.time)
        let show_list: any[] = []
        data.cellList.forEach(element => {
            if (element > -1) {
                show_list.push(element)
            }
        })
        UH.SetText(this.viewNode.TimeShow, `${time_t.year}-${time_t.month}-${time_t.day}  ${time_t.hour}:${time_t.minute}:${time_t.second}`)
        this.viewNode.ShowList.SetData(show_list)
        this.height = 114 + (show_list.length - 1) * 36
    }
}

class ShenQiRecordViewMonoItem extends BaseItem {
    protected viewNode = {
        ItemName: <fgui.GTextField>null,
        EnergyNum: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);

        let co = ShenQiData.Inst().CfgShenQiInfoByCell(data);
        if (co) {
            if (1 == co.type) {
                let co_sq = ShenQiData.Inst().CfgShenQiInfoById(co.pram)
                UH.SetText(this.viewNode.ItemName, TextHelper.Format(Language.ShenQi.ShenQiRecord.ItemName, co_sq.name))
            } else {
                UH.SetText(this.viewNode.ItemName, TextHelper.Format(Language.ShenQi.ShenQiRecord.ItemName, GetCfgValue(Language.ShenQi.ShenQiRecord.ItemNames, co.type)))
            }
            UH.SetText(this.viewNode.EnergyNum, TextHelper.Format(Language.ShenQi.ShenQiRecord.EnergyNum, co.shenqi_energy))
        }
    }
}