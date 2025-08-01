import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CoreSpCfg } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { Language } from "modules/common/Language";
import { HelpView } from "modules/common_help/CommonHelpView";
import { RedPoint } from "modules/extends/RedPoint";
import { UH } from "../../helpers/UIHelper";
import { BoardData } from "./BoardData";

export class CommonBoardCC extends fgui.GComponent {
    private extra_compent: fgui.GComponent;

    private viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnHelp: <fgui.GButton>null,
        title: <fgui.GTextField>null,
        icon: <fgui.GLoader>null,

        cc_bgshow: <CoreCrisisBgShow>null,
        cc_nameshow: <CoreCrisisNameShow>null,
        cc_descshow: <fgui.GComponent>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private cc_mark = 0
    private board_data: BoardData;
    fontSize = 40;
    font_gap = 1;//18;
    SetData(board_data: BoardData) {
        let self = this;
        self.board_data = board_data;
        if (board_data.title)
            UH.SetText(self.viewNode.title, board_data.title)
        let title = self.viewNode.title.text;
        let width = this.fontSize * title.length + this.font_gap * (title.length - 1);
        self.viewNode.title.width = width;
        self.viewNode.BtnClose.onClick(self.closeFun.bind(self));
        self.viewNode.BtnHelp.onClick(self.helpFun.bind(self));
        self.viewNode.BtnHelp.visible = board_data.help_key != undefined;
    }

    // 放入枚举
    SetCoreMark(mark: number) {
        this.viewNode.cc_bgshow.visible = false
        this.viewNode.cc_nameshow.visible = false
        this.viewNode.cc_descshow.visible = true

        this.cc_mark = mark
        this.viewNode.cc_nameshow.SetData({ core_mark: mark })
        this.viewNode.cc_bgshow.SetData({ core_mark: mark })
    }

    FlushCore() {
        this.viewNode.cc_bgshow.FlushData()
    }

    private closeFun() {
        ViewManager.Inst().CloseView(this.board_data.view)
    }

    private helpFun() {
        if (this.board_data.help_key != undefined) {
            ViewManager.Inst().OpenView(HelpView, this.board_data.help_key);
        }
    }

    public SetIcon(icon: string, pos_y: number) {
        UH.SpriteName(this.viewNode.icon, "CommonBoard", icon);
        this.viewNode.icon.y = pos_y;
        this.viewNode.title.visible = icon != "Tou_BuDaiBiaoTi";
    }

    public SetHelpVisible(visible: boolean) {
        this.viewNode.BtnHelp.visible = visible;
    }

    public addExtraCompent(extra_compent: fgui.GObject) {
        if (!this.extra_compent) {
            this.extra_compent = new fgui.GComponent();
            this.extra_compent.height = 1500;
            this.extra_compent.width = 800;
            this.addChildAt(this.extra_compent, 2);
            this.extra_compent.center();
        }
        this.extra_compent.addChildAt(extra_compent, 0);
    }

    public removeExtraCompent() {
        if (this.extra_compent)
            this.extra_compent.removeChildren();
    }
}

export class CoreCrisisBgShow extends fgui.GComponent {
    private viewNode = {
        heart_show: <fgui.GLoader>null,
        heart_level: <fgui.GLoader>null,
        ClickArea: <fgui.GGraph>null,
        RedPoint: <RedPoint>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.ClickArea.onClick(this.OnClickCC.bind(this));
    }

    SetData(data: any) {
        if (data == null) { return }
        this.data = data
        let level = CoreCrisisData.Inst().GetCoreLevel(data.core_mark)
        let sprite = CoreSpCfg["mark_" + data.core_mark]

        UH.SpriteName(this.viewNode.heart_show, "CommonAtlas", sprite);
        UH.SpriteName(this.viewNode.heart_level, "CommonFont", "pet_lv_" + level);

        this.FlushData()
    }

    FlushData() {
        let level = CoreCrisisData.Inst().GetCoreLevel(this.data.core_mark)
        UH.SpriteName(this.viewNode.heart_level, "CommonFont", "pet_lv_" + level);

        let param = CoreCrisisData.Inst().GetCCparam(this.data.core_mark)
        let num = Item.GetNum(param.need_item)
        this.viewNode.RedPoint.SetNum(num >= param.need_num && param.need_num != 0 ? 1 : 0)
    }

    OnClickCC() {
        LogError("?click CC!", Language.CoreCrisis.CoreName[this.data.core_mark])
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: this.data.core_mark })
    }
}

export class CoreCrisisNameShow extends fgui.GComponent {
    private viewNode = {
        cc_name: <fgui.GLabel>null,
        ClickArea: <fgui.GGraph>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    SetData(data: any) {
        if (data == null) { return }
        this.data = data

        this.viewNode.ClickArea.onClick(this.OnClickCC.bind(this));
        UH.SetText(this.viewNode.cc_name, Language.CoreCrisis.CoreName[data.core_mark])
    }
    OnClickCC() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: this.data.core_mark })
    }
}