import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { PetData, PetGemData } from "./PetData";
import { Language } from "modules/common/Language";
import { PetGemStoreData, PetGemStoreView } from "./PetGemStoreView";
import { Timer } from "modules/time/Timer";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { PetGemUpView } from "./PetGemUpView";
import { UH } from "../../helpers/UIHelper";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { PetGemLvItem } from "./PetGemView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { LogError } from "core/Debugger";
import { PetCtrl } from "./PetCtrl";
import { BagData } from "modules/bag/BagData";

@BaseView.registView
export class PetGemOnceUpSelectView extends BaseView {
    private datas: PetGemData[];
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemOnceUpSelect",
        ViewName: "PetGemOnceUpSelectView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnUp: <fgui.GButton>null,
        Tip: <fgui.GTextField>null,
        List: <fgui.GList>null,
        Block: <fgui.GGraph>null,
    }

    protected extendsCfg = [
        { ResName: "PetGemSelCell", ExtendsClass: PetGemSelCell },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(PetGemOnceUpSelectView));
        UH.SetText(this.viewNode.Tip, Language.Pet.GemUpTip);
        this.viewNode.List.setVirtual();
        this.viewNode.BtnUp.onClick(this.OnUp.bind(this));
        this.AddSmartDataCare(PetData.Inst().once_result_data, this.Flush.bind(this), "flush");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_ts_gem_list_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushList.bind(this), "OtherChange");

        this.FlushList();
        this.Flush();
    }

    private FlushList() {
        let list_data = PetData.Inst().GetUpLevelGemList();
        list_data.sort((a: PetGemData, b: PetGemData) => {
            return b.level - a.level
        })
        this.datas = list_data;
        this.viewNode.List.SetData(list_data);
        this.viewNode.List.clearSelection();
    }

    private Flush() {
        this.viewNode.Block.visible = false;
    }

    public OnUp() {
        let selects = this.viewNode.List.getSelection();
        let list = [];
        if (this.datas) {
            for (let i = 0; i < selects.length; i++) {
                list.push(this.datas[selects[i]]);
            }
        }
        if (list.length == 0) {
            PublicPopupCtrl.Inst().Center(Language.Pet.OneKeyTip);
            return;
        }
        PetCtrl.Inst().SendOneKeyCompose(list);
        this.viewNode.Block.visible = true;
    }

    onDestroy() {
    }
}


class PetGemSelCell extends BaseItemGB {
    protected viewNode = {
        Cell: <PetGemLvItem>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: PetGemData) {
        this._data = data;
        this.viewNode.Cell.SetData(data);
    }
}