import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { ShenQiData } from "modules/shenqi/ShenQiData";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ShenQiView } from "./ShenQiView";

@BaseView.registView
export class ShenQiEnterView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShenQiEnter",
        ViewName: "ShenQiEnterView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard4>null,
        BtnEnter: <fgui.GButton>null,

        NameShow: <fgui.GRichTextField>null,
        LevelShow: <fgui.GTextField>null,
        DescShow: <fgui.GTextField>null,
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: ShenQiEnterViewShowItem },
    ];


    InitUI() {
        this.FlushInfo()
    }

    InitData(param_t: any) {
        this.viewNode.Board.SetData(new BoardData(ShenQiEnterView));
        this.viewNode.BtnEnter.onClick(this.OnClickEnter, this);
    }

    FlushInfo() {
        let other_info = ShenQiData.Inst().ResultData.OtherInfo
        let info = ShenQiData.Inst().GetShenQiInfoById(other_info.wearingId)
        let show_list = ShenQiData.Inst().GetShenQiAttrShowList()
        let co_cur = ShenQiData.Inst().CfgShenQiInfoByIdLevel(other_info.wearingId, info.level > 0 ? info.level : 1)

        let color = QualityColorStr[co_cur.quality];
        let color_ol = QualityColorOLStr[co_cur.quality];
        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(co_cur.name, color), color_ol, 2));
        UH.SetText(this.viewNode.LevelShow, info.level > 0 ? `Lv.${info.level}` : Language.ShenQi.ShenQiInfo.NotActive);
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${co_cur.quality}`)
        UH.SetIcon(this.viewNode.Icon, co_cur.icon, ICON_TYPE.ShenQi);
        UH.SetText(this.viewNode.DescShow, co_cur.dec)

        this.viewNode.ShowList.SetData(show_list);
    }


    OnClickEnter() {
        ViewManager.Inst().OpenView(ShenQiView)
    }

}

class ShenQiEnterViewShowItem extends BaseItem {
    protected viewNode = {
        QuaSp: <fgui.GLoader>null,
        QuaLevel: <fgui.GRichTextField>null,
        AttrShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);

        let level = ShenQiData.Inst().GetShenQiQuaLevel(data.type)
        let jihuo_attr = data.jihuo_att[0]
        let up_attr = data.up_att[0]
        let add_mul = Math.floor(level / data.level_interval)

        UH.SpriteName(this.viewNode.QuaSp, "ShenQiEnter", `PinZhi${data.type}`)
        UH.SetText(this.viewNode.QuaLevel, TextHelper.Format(GetCfgValue(Language.ShenQi.ShenQiEnter.QuaLevel, data.type), level))
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(GetCfgValue(Language.ShenQi.ShenQiEnter.AttrShow, data.type), level > 0 ? `+${AttrHelper.Percent(up_attr.type, add_mul > 0 ? (jihuo_attr.add * (data.level_interval - 1) + up_attr.add * add_mul) : jihuo_attr.add * level)}${AttrListName[up_attr.type]}` : Language.ShenQi.ShenQiEnter.NotActive));
    }
}