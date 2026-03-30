import * as fgui from "fairygui-cc";
import { ByteBuffer } from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGB } from "modules/common/BaseItem";
import { COLORSTR } from "modules/common/ColorEnum";
import { GuildData } from "modules/guild/GuildData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { RedPoint } from "./RedPoint";

export class CommonButton extends fgui.GButton {
    private viewNode = {
        title: <fgui.GTextField>null,
        redPoint: <RedPoint>null,
    };

    public constructor() {
        super();
    }

    protected onConstruct() {
        let self = this;
        ViewManager.Inst().RegNodeIofo(self.viewNode, self);
    }

    public ShowRedPoint(bool: boolean) {
        let num = bool ? 1 : 0;
        this.viewNode.redPoint.SetNum(num);
    }

    protected onDestroy() {

    }

    setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);
        let length = this.viewNode.title.text.length;
        if (length === 2) {
            this.viewNode.title.text = TextHelper.LetterSpacing(this.viewNode.title.text, 1);
        }
    }
}

export class CommonButtonHelp extends BaseItemGB {
    protected viewNode = {
        GpProgress: <fgui.GGroup>null,
        ValShow: <fgui.GRichTextField>null,
    };

    public SetData(data: { type: number, level: number }) {
        let info = GuildData.Inst().GetGuildRepotInfoByTypeLevel(data.type, data.level)
        if (info) {
            let co = GuildData.Inst().GetHelpInfoByTypeLevel(info.param_1, info.param_2)
            UH.SetText(this.viewNode.ValShow, `<color=#${COLORSTR.Yellow1}>${info.param_3}</color>/${co.help_num}`)
            this.viewNode.GpProgress.visible = true
        } else {
            this.viewNode.GpProgress.visible = false
        }
    }
}