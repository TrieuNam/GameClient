import { CfgAttrUp } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR, QualityColor } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
@BaseView.registView
export class CommonGetView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "CommonGetView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtAttr: <fgui.GTextField>null,
        TxtTimer: <TimeMeter>null,
        Model: <UIModelShow>null,
        EffectShow: <UIEffectShow>null,
        Icon: <fgui.GLoader>null,
    }

    InitData(param: CommGetData) {
        this.viewNode.TxtTimer.SetCallBack(this.closeview.bind(this));
        this.viewNode.TxtTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));
        UH.SetText(this.viewNode.TxtName, param.name);
        this.viewNode.TxtName.color = QualityColor[param.color];
        let attr_text = "";
        for (let i = 0; i < param.attr.length; i++) {
            let type = param.attr[i].type;
            let num = param.attr[i].add;
            attr_text += TextHelper.Format(Language.CommonGet.AttrShow, AttrListName[type] + Language.CommonGet.Split[type], AttrHelper.Percent(type, num));
            if (i != param.attr.length - 1) {
                attr_text += "\n";
            }
        }
        UH.SetText(this.viewNode.TxtAttr, attr_text);
        if (param.res_id) {
            switch (param.type) {
                case CommGetType.Npc:
                    this.viewNode.Model.setPath(ResPath.Npc(param.res_id));
                    this.viewNode.Model.scaleX = this.viewNode.Model.scaleY = param.sc ?? 1;
                    break;
                case CommGetType.Ride:
                    this.viewNode.Model.setPath(ResPath.Ride(param.res_id));
                    this.viewNode.Model.scaleX = this.viewNode.Model.scaleY = param.sc ?? 1;
                    break;
                case CommGetType.Effect:
                    this.viewNode.EffectShow.PlayEff(param.res_id);
                    break;
                case CommGetType.FazhenIcon:
                    UH.SetIcon(this.viewNode.Icon, param.res_id, ICON_TYPE.FaZhen);
                    break;
            }
        }
    }

    InitUI() {
    }

    private closeview() {
        ViewManager.Inst().CloseView(CommonGetView)
    }
}

export class CommGetData {
    name: string;
    attr: CfgAttrUp[];
    color: number;
    res_id: number | string;
    type: number;//0：npc 1：坐骑 2：特效 3：法阵图片
    sc: number;
    item_id: number;
    call_back: Function;
    is_nomal: boolean
    constructor(name: string, attr: CfgAttrUp[], color: number, res_id: number | string, type: CommGetType, sc: number = 1, item_id: number = 0, call_back: Function = null, is_nomal: boolean = true) {
        this.name = name;
        this.attr = attr;
        this.color = color;
        this.res_id = res_id;
        this.type = type;
        this.sc = sc;
        this.item_id = item_id;
        this.is_nomal = is_nomal;
        this.call_back = call_back;
    }
}

export enum CommGetType {
    Npc = 0,
    Ride = 1,
    Effect = 2,
    FazhenIcon = 3,
    Fashion = 4,
}