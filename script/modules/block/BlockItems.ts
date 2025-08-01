
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { UH } from "../../helpers/UIHelper";

export class BlockShow extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
    };
    public SetData(data: number) {
        super.SetData(data)
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data}`);
    }
}