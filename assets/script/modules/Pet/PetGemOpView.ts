import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { PetData, PetGemData } from "./PetData";
import { Language } from "modules/common/Language";
import { PetGemStoreData, PetGemStoreView } from "./PetGemStoreView";
import { Timer } from "modules/time/Timer";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { PetGemUpView } from "./PetGemUpView";
import { PetGemWashView } from "./PetGemWashView";

@BaseView.registView
export class PetGemOpView extends BaseView {
    private time_handle:any;
    private gem_info: { gem_data: PetGemData, pos: number };
    private pos = [
        [413, 354, 342, 362, 1, 149, 0],
        [690, 354, 619, 362, 1, 149, 0],
       // [400, 354, 315, 362, -1, 149, 0],
        [413, 775, 342, 783, 1, 149, 0],
        [690, 775, 619, 783, 1, 149, 0],
        // [400, 775, 315, 783, -1, 149, 0],
        [308, 562, 237, 571, 1, 227, 1],
        [500, 562, 416, 571, -1, 227, 1],
    ]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemOp",
        ViewName: "PetGemOpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.None,
    };

    protected viewNode = {
        Bg: <fgui.GImage>null,
        BtnChange: <fgui.GButton>null,
        BtnUp: <fgui.GButton>null,
        BtnWash: <fgui.GButton>null,
        GpBtn:<fgui.GGroup>null,
        Block:<fgui.GGraph>null,
    }
  

    InitData(param:  { gem_data: PetGemData, pos: number }) {
       this.gem_info=param;
        this.viewNode.GpBtn.visible=true;
        let pos_info = this.pos[param.pos];
        this.viewNode.Bg.x = pos_info[0];
        this.viewNode.Bg.y = pos_info[1];
        this.viewNode.GpBtn.x = pos_info[2];
        this.viewNode.GpBtn.y = pos_info[3];

        this.viewNode.Bg.scaleX = pos_info[4];
        this.viewNode.Bg.height = pos_info[5];

        this.viewNode.BtnWash.visible = pos_info[6] == 1;
       
        this.viewNode.BtnChange.onClick(this.OnChange.bind(this));
        this.viewNode.BtnUp.onClick(this.OnUp.bind(this));
        this.viewNode.BtnWash.onClick(this.OnWash.bind(this));
        this.viewNode.Block.onClick(this.closeView.bind(this));
    }

    /**更换宝石 */
    private OnChange() {
        if (this.gem_info) {
            let pos = this.gem_info.pos;
            let pet_inst = PetData.Inst();
            let store_data = new PetGemStoreData();
            store_data.title = Language.Pet.GemSet;
            store_data.func_show = pet_inst.GetGemByType.bind(pet_inst, this.gem_info.gem_data,pos);
            store_data.func_select_call = pet_inst.SetGem.bind(pet_inst, pos);
            ViewManager.Inst().OpenView(PetGemStoreView, store_data);
            this.closeView();
        }

    }
    /**升级宝石 */
    private OnUp() {
        if (this.gem_info) {
            ViewManager.Inst().OpenView(PetGemUpView, this.gem_info.gem_data)
            this.closeView();
        }
    }

    /**洗练宝石 */
    private OnWash() {
        if (this.gem_info&&this.gem_info.gem_data.item_id==PetData.Inst().GetTsGemId()) {
            ViewManager.Inst().OpenView(PetGemWashView, this.gem_info.gem_data.bag_index)
            this.closeView();
        }
    }

    onDestroy(){
        Timer.Inst().CancelTimer(this.time_handle);
    }
}
