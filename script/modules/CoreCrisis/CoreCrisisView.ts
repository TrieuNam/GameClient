import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Timer } from "modules/time/Timer";
import { UpLevelShowView } from "modules/UpLevelShow/UpLevelShowView";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { UIEffectShow } from '../scene_obj_spine/UIEffectShow';
import { CoreCrisisBuyView } from "./CoreCrisisBuyView";
import { CoreCardSpCfg, CoreNameSpCfg, CoreWenZiSpCfg } from "./CoreCrisisConfig";
import { CoreCrisisCtrl, LIMIT_CORE_OP_TYPE } from "./CoreCrisisCtrl";
import { CoreCrisisData } from "./CoreCrisisData";


@BaseView.registView
export class CoreCrisisView extends BaseView {
    private level_mark: number
    private play_timer: any;
    private param: any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CoreCrisis,CoreCrisisCard",
        ViewName: "CoreCrisisView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    }
    protected extendsCfg = [
        { ResName: "KoKoRoShow", ExtendsClass: KoKoRoShow }
    ]

    protected viewNode = {
        Board: <CommonBoard3>null,
        HeartShow: <KoKoRoShow>null,
        CoreName: <fgui.GLoader>null,
        LevelShow: <fgui.GLoader>null,
        TextShow: <fgui.GLoader>null,
        StuffItem: <ItemCell>null,
        StuffName: <fgui.GLabel>null,
        StuffNum: <fgui.GLabel>null,
        StuffShow: <fgui.GGroup>null,
        GpMax: <fgui.GGroup>null,
        BtnUp: <fgui.GButton>null,
        RedPoint: <RedPoint>null,

        EffShow: <UIEffectShow>null,
    };
    InitData(data: any) {
        this.viewNode.Board.SetData(new BoardData(CoreCrisisView));

        this.param = CoreCrisisData.Inst().GetCCparam(data.mark_type)
        this.viewNode.Board.SetTitleShow(false)

        this.viewNode.HeartShow.SetData({ mark_type: this.param.mark_type })
        UH.SpriteName(this.viewNode.CoreName, "CoreCrisisCard", CoreNameSpCfg["mark_" + data.mark_type]);
        UH.SpriteName(this.viewNode.TextShow, "CoreCrisis", CoreWenZiSpCfg["mark_" + data.mark_type]);
        // this.viewNode.CoreName

        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.flushPanelInfo.bind(this), "need_flush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushPanelInfo.bind(this), "OtherChange");
        this.viewNode.BtnUp.onClick(this.OnClickUp.bind(this));

        let item_call = Item.Create({ item_id: this.param.need_item }, { is_click: true })
        this.viewNode.StuffItem.SetData(item_call)
        UH.SetText(this.viewNode.StuffName, Item.GetName(this.param.need_item));
        this.flushPanelInfo()
    }

    flushPanelInfo() {
        this.param = CoreCrisisData.Inst().GetCCparam(this.param.mark_type)


        if (this.level_mark == null) {
            this.level_mark = this.param.level
        }
        else if (this.param.level > this.level_mark) {
            ViewManager.Inst().OpenView(UpLevelShowView, { level_before: this.level_mark, level_after: this.param.level })
            this.level_mark = this.param.level

            this.is_uping = false;
        }

        let not_max = this.param.need_num > 0
        this.viewNode.StuffShow.visible = not_max
        this.viewNode.BtnUp.visible = not_max
        this.viewNode.GpMax.visible = !not_max

        this.viewNode.HeartShow.flushData()
        UH.SpriteName(this.viewNode.LevelShow, "CommonFont", "pet_lv_" + this.param.level);

        let num = +Item.GetNum(this.param.need_item)
        let color = num >= this.param.need_num ? COLORSTR.Yellow2 : COLORSTR.Red1
        this.viewNode.StuffNum.visible = this.param.need_num > 0
        UH.SetText(this.viewNode.StuffNum, TextHelper.ColorStr(num, color) + "/" + this.param.need_num)

        this.viewNode.RedPoint.SetNum(num >= this.param.need_num && this.param.need_num != 0 ? 1 : 0)
    }

    private is_uping = false;
    OnClickUp() {
        if (this.is_uping)
            return;
        this.viewNode.EffShow.StopEff(4164127)

        let num = +BagData.Inst().getItemNum(this.param.need_item)
        if (num < this.param.need_num) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.PeakArena.FlushLack,
                Item.GetName(this.param.need_item)));

            ViewManager.Inst().OpenView(CoreCrisisBuyView);
            // let show_call = Item.Create({ item_id:this.param.need_item , num:this.param.need_item - num })
            // ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }
        if (this.param.need_num == 0) {
            PublicPopupCtrl.Inst().Center(Language.CoreCrisis.MaxTip);
            return;
        }
        this.is_uping = true;
        this.viewNode.EffShow.PlayEff(4164127, () => {
            AudioManager.Inst().Play(AudioTag.ShengJi);
        })


        Timer.Inst().CancelTimer(this.play_timer);
        this.play_timer = undefined
        this.play_timer = Timer.Inst().AddCountDownTT(
            this.Counting.bind(this),
            this.CountDownEnd.bind(this),
            1, 1);

        AudioManager.Inst().Play(AudioTag.ShengJi)
    }

    Counting() {

    }

    CountDownEnd() {
        CoreCrisisCtrl.Inst().SendCSLimitCoreReq(LIMIT_CORE_OP_TYPE.LEVEL_UP, this.param.mark_type)

    }

}


export class KoKoRoShow extends fgui.GComponent {
    private viewNode = {
        CoreShow: <fgui.GLoader>null,
        CoreName: <fgui.GLoader>null,
        NumShow: <fgui.GLoader>null,
        LevelShow: <fgui.GGroup>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data

        UH.SpriteName(this.viewNode.CoreShow, "CoreCrisisCard", CoreCardSpCfg["mark_" + data.mark_type]);
        UH.SpriteName(this.viewNode.CoreName, "CoreCrisisCard", CoreNameSpCfg["mark_" + data.mark_type]);
        this.flushData()
    }
    public flushData() {
        let level = CoreCrisisData.Inst().GetCoreLevel(this.data.mark_type)
        UH.SpriteName(this.viewNode.NumShow, "CommonFont", "pet_lv_" + level);
    }
    public SetShowName(flag: boolean) {
        this.viewNode.CoreName.visible = flag
    }

    public SetShowLevel(flag: boolean) {
        this.viewNode.LevelShow.visible = flag
    }
}