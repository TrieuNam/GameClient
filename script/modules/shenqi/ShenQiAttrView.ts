import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ShenQiData } from "./ShenQiData";

@BaseView.registView
export class ShenQiAttrView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShenQiAttr",
        ViewName: "ShenQiAttrView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: ShenQiAttrViewShowItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(ShenQiAttrView));

        // this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushShow.bind(this), "RecordInfo");
    }

    InitUI() {
        this.FlushShow();
    }

    CloseCallBack() {
    }


    FlushShow() {
        let show_list = ShenQiData.Inst().GetShenQiAttrShowList()
        this.viewNode.ShowList.SetData(show_list);
    }
}


class ShenQiAttrViewShowItem extends BaseItem {
    protected viewNode = {
        QuaSp: <fgui.GLoader>null,
        QuaLevel: <fgui.GRichTextField>null,
        AttrShow: <fgui.GTextField>null,
        NextLevel: <fgui.GTextField>null,
        DescShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);

        let level = ShenQiData.Inst().GetShenQiQuaLevel(data.type)
        let jihuo_attr = data.jihuo_att[0]
        let up_attr = data.up_att[0]
        let add_mul = Math.floor(level / data.level_interval)

        UH.SpriteName(this.viewNode.QuaSp, "ShenQiAttr", `PinZhi${data.type}`)
        UH.SetText(this.viewNode.QuaLevel, TextHelper.Format(GetCfgValue(Language.ShenQi.ShenQiAttr.QuaLevel, data.type), level))
        UH.SetText(this.viewNode.AttrShow, level > 0 ? `+${AttrHelper.Percent(up_attr.type, add_mul > 0 ? (jihuo_attr.add * (data.level_interval - 1) + up_attr.add * add_mul) : jihuo_attr.add * level)}${AttrListName[up_attr.type]}` : "");
        UH.SetText(this.viewNode.NextLevel, level > 0 ? TextHelper.Format(Language.ShenQi.ShenQiAttr.NextLevel, data.level_interval - level % data.level_interval) : Language.ShenQi.ShenQiAttr.NextLevel0);
        UH.SetText(this.viewNode.DescShow, TextHelper.Format(GetCfgValue(Language.ShenQi.ShenQiAttr.DescShow, data.type), data.level_interval, `+${AttrHelper.Percent(up_attr.type, up_attr.add)}${AttrListName[up_attr.type]}`));
    }
}