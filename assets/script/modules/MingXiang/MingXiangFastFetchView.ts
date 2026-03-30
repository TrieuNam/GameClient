import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { AdventureCtrl, ADVENTURE_OP_TYPE } from "modules/adventure/AdventureCtrl";
import { AdventureData } from "modules/adventure/AdventureData";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class MingXiangFastFetchView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MingXiangFastFetch",
        ViewName: "MingXiangFastFetchView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        Cell: <ItemCell>null,
        TxtNum: <fgui.GTextField>null,
        UpperLimit: <fgui.GTextField>null,
        BtnFetch: <fgui.GButton>null,
        redPoint: <RedPoint>null,
        GPcur: <fgui.GGroup>null,
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(MingXiangFastFetchView));
        this.AddSmartDataCare(AdventureData.Inst().ResultData, this.FlushAll.bind(this), "main_fb_info");
        this.viewNode.BtnFetch.onClick(this.OnFetch.bind(this));
        this.FlushAll();
    }

    InitUI() {
    }


    private cfg: any;
    private FlushAll() {
        let data = AdventureData.Inst().ResultData.main_fb_info;
        if (data) {
            let cfg = AdventureData.Inst().GetCurLvCfg();
            if (!this.cfg || this.cfg.now_box != cfg.now_box) {
                this.cfg = cfg;
                this.viewNode.Cell.SetData(Item.Create(new CfgItem(CommonId.Box, cfg.now_box), { is_num: true }));
            }
            let num = data.diaFetchNum;
            let cost = cfg.quick_expend.split("|");
            let cost_num = cost[num] ?? "-1";
            this.viewNode.UpperLimit.visible = false;
            if(+cost_num > 0){
                this.viewNode.redPoint.SetNum(0);
                this.viewNode.GPcur.visible = true;
            }else{
                if(+cost_num == 0){
                    this.viewNode.redPoint.SetNum(1);
                }
                if(+cost_num == -1 && num > 0){
                    this.viewNode.UpperLimit.visible = true;
                    this.viewNode.BtnFetch.grayed = true;
                }
                this.viewNode.GPcur.visible = false;
            }
            UH.SetText(this.viewNode.TxtNum, cost_num);
        }
    }

    private OnFetch() {
        let data = AdventureData.Inst().ResultData.main_fb_info;
        if (data) {
            let cfg = AdventureData.Inst().GetCurLvCfg();
            if (data.diaFetchNum >= cfg.quick_num) {
                PublicPopupCtrl.Inst().Center(Language.MingXiang.MaxTip);
            } else {
                let num = Item.GetNum(CommonId.Diamond);
                let cost = cfg.quick_expend.split("|");
                let cost_num = +cost[num];
                if (num < cost_num) {
                    PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Diamond);
                } else {
                    AdventureCtrl.Inst().SendAdventureReq(ADVENTURE_OP_TYPE.QUICK_FETCH_GUAJI)
                }
            }
        }
    }
}

