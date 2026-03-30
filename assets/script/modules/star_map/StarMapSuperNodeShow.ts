import { CfgNewSuperStar } from "config/CfgStarmap";
import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { StarMapSuperNewCfg } from "./StarMapConifg";

@BaseView.registView
export class StarMapSuperNodeShow extends BaseView {

    protected viewRegcfg = {
        UIPackName: "StarMapSuperNewChild",
        ViewName: "SuperNodeShow",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        SkillDesc: <fgui.GTextField>null,
        SkillName: <fgui.GTextField>null,
        SkillBG: <fgui.GLoader>null,
        SkillIcon: <fgui.GLoader>null,
    };

    private node:CfgNewSuperStar;
    InitData(param_t?: any) {
        this.node = param_t.node;
        this.viewNode.Board.SetData(new BoardData(StarMapSuperNodeShow,this.node.star_name)); 
        UH.SetText(this.viewNode.SkillName, this.node.star_name);
        UH.SetText(this.viewNode.SkillDesc, this.node.star_txt);
        let route_cfg = StarMapSuperNewCfg[this.node.route];
        UH.SpriteName(this.viewNode.SkillBG, "StarMapSuperNewChild",route_cfg.NodeBGMax);
        UH.SpriteName(this.viewNode.SkillIcon, "StarMapSuperNewChild",route_cfg.AttrIconMax);
    }

    CloseCallBack() {
    }
}