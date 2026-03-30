import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { ShopView } from "modules/shop/ShopView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ARENA_OP_TYPE } from "./ArenaCtrl";
import { ArenaData, ArenaEqualData } from "./ArenaData";


@BaseView.registView
export class ArenaRecordView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ArenaRecord",
        ViewName: "ArenaRecordView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnAdd: <fgui.GButton>null,
        TxtNum: <fgui.GTextField>null,
        IconCost: <fgui.GLoader>null,
        List: <fgui.GList>null,
    }

    protected extendsCfg = [
        { ResName: "ArenaRecordCell", ExtendsClass: ArenaRecordCell },
    ];

    InitData() {
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCur.bind(this), "OtherChange");
        this.AddSmartDataCare(ArenaData.Inst().result_info, this.FlushList.bind(this), "arena_report");

        UH.SetIcon(this.viewNode.IconCost, ArenaData.Inst().GetChallengeCostId(), ICON_TYPE.ITEM);

        this.viewNode.Board.SetData(new BoardData(ArenaRecordView));
        this.viewNode.BtnAdd.onClick(this.OnAdd.bind(this));
        this.FlushCur();
        this.FlushList();
    }

    InitUI() {
    }

    private FlushList() {
        if (BattleCtrl.Inst().check(this, this.FlushList.bind(this))) {
            return
        }

        let record_list = ArenaData.Inst().GetRecordList();
        if (record_list)
            this.viewNode.List.SetData(record_list);
    }
    private FlushCur() {
        let data = ArenaData.Inst().GetArenaMainData();
        if (data) {
            UH.SetText(this.viewNode.TxtNum, ArenaData.Inst().GetFightTimes());
        }
    }
    private OnAdd() {
        ViewManager.Inst().OpenView(ShopView);
    }

}

export class ArenaRecordCell extends BaseItem {
    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtLv: <fgui.GTextField>null,
        TxtTime: <fgui.GTextField>null,
        BtnRevenge: <fgui.GButton>null,
        Head: <AvatarCell>null,
        TxtResult2: <fgui.GRichTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnRevenge.onClick(this.onRevenge.bind(this));
    }
    public SetData(data: { info: IPB_ArenaReport, index: number }) {
        this._data = data;
        UH.SetText(this.viewNode.TxtName, DataHelper.BytesToString(data.info.targetInfo.name));
        UH.SetText(this.viewNode.TxtLv, "Lv." + data.info.targetInfo.level);
        let result_type;
        if (data.info.isAttack) {
            result_type = data.info.isWin == 1 ? 0 : 1;
        } else {
            result_type = data.info.isWin == 1 ? 2 : (data.info.score < 0 ? 3 : 4);
        }

        let icon = TextHelper.RichTextImg("ArenaRecord", "JingJiChang_0002_JiangBei");

        let result_str = result_type == 2 ? Language.Arena.result_desc2[result_type] : TextHelper.Format(Language.Arena.result_desc2[result_type], icon, data.info.score);
        let color = (result_type == 1 || result_type == 3) ? COLORSTR.Red5 : COLORSTR.Green3;
        result_str = TextHelper.ColorStr(result_str, color);
        UH.SetText(this.viewNode.TxtResult2, result_str);

        this.viewNode.BtnRevenge.visible = result_type == 3;
        let time = Math.ceil((TimeCtrl.Inst().ServerTime - data.info.time) / 60);
        let desc = "";
        if (time > 60) {
            desc = Math.floor(time / 60) + Language.Arena.hour_before;
        }
        time = time % 60;
        desc += time + Language.Arena.min_before;
        UH.SetText(this.viewNode.TxtTime, desc);
        this.viewNode.Head.SetData(new AvatarData(data.info.targetInfo.headPicId, data.info.targetInfo.level));
    }

    private onRevenge() {
        if (this._data) {
            let role_info = new ArenaEqualData();
            let info: IPB_ArenaReport = this._data.info;
            role_info.role_id = info.targetInfo.roleId;
            role_info.name = DataHelper.BytesToString(info.targetInfo.name);
            role_info.level = info.targetInfo.level;
            role_info.cap = info.targetInfo.cap;
            role_info.head_pic = info.targetInfo.headPicId;
            role_info.score = info.targetScore;
            role_info.index = this._data.index;
            ArenaData.Inst().sendChallenge(role_info, ARENA_OP_TYPE.REVEBGE);
        }
    }
}
