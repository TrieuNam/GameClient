import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { BoardData } from "modules/common_board/BoardData";
import { CfgLanguageData } from "config/CfgLanguage";
import { Language } from "modules/common/Language";

@BaseView.registView
export class HelpView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonHelp",
        ViewName: "HelpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Desc: <fgui.GLabel>null,
        Board: <CommonBoard3>null,
    }

    InitData(param: number | string) {
        let self = this;
        let cfg = CfgLanguageData.textdesc[+param - 1];

        if (cfg) {
            UH.SetText(self.viewNode.Desc, cfg.desc);
            self.viewNode.Board.SetData(new BoardData(HelpView, cfg.title));
        } else {
            UH.SetText(self.viewNode.Desc, param);
            self.viewNode.Board.SetData(new BoardData(HelpView, Language.Common.Explain));
        }
        this.viewNode.Board.height = self.viewNode.Desc.height + 252
    }

    InitUI() {
    }

    OpenCallBack() {

    }

    CloseCallBack(): void {
    }
}
