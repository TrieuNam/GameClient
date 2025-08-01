import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { FirstChargeCtrl, FirstChargeData, FirstCharge_OP_TYPE } from "./FirstChargeCtrl";
import { CfgFirstCharge } from "config/CfgFirstCharge";
import { UH } from "../../helpers/UIHelper";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";

@BaseView.registView 
export class FirstChargeView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FirstCharge",
        ViewName: "FirstChargeView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        TxtDesc:<fgui.GTextField>null,
        ListReward: <fgui.GList>null,
        BtnRecharge:<fgui.GButton>null,
        ShowIcon:<fgui.GLoader>null,
        EffectShow:<UIEffectShow>null,
    }

    InitData() {
        this.AddSmartDataCare(FirstChargeData.Inst().ResultData,this.FlushData.bind(this),"info");
        this.viewNode.BtnRecharge.onClick(this.onBtnClick.bind(this));
        this.FlushData();
        this.viewNode.EffectShow.PlayEff(4164041)
    }

    private FlushData(){
        let info=FirstChargeData.Inst().ResultData;
        if(!info){
            FirstChargeCtrl.Inst().SendReq(FirstCharge_OP_TYPE.INFO);
            return;
        }
            if(info.info.fetchMark){
            this.viewNode.BtnRecharge.title=Language.ActCommon.YiLingQu;
            this.viewNode.BtnRecharge.grayed=true;
            return;
        }
        this.viewNode.BtnRecharge.grayed=false;
             if(info.info.firstChongMark)
            this.viewNode.BtnRecharge.title=Language.ActCommon.LingQu;
            else
            this.viewNode.BtnRecharge.title=Language.ActCommon.ChongZhi;
    }
    InitUI() {
        let cfg=CfgFirstCharge.other[0];
        this.viewNode.ListReward.SetData(Item.DefaultCreateListItem(cfg.reward_item));
        // let txt=TextHelper. RichTextOutLine(TextHelper.Format("充值任意金额 享价值{0}元豪礼",TextHelper.ColorStr("3888",COLORSTR.Yellow3)),COLORSTR.Yellow2,2);
        UH.SetText(this.viewNode.TxtDesc,TextHelper. RichTextOutLine(cfg.desc,COLORSTR.Yellow2,2))
        //<outline color=#311700 width=2>充值任意金额 享价值<color=#f5ad00>3888</color>元豪礼</outline>
        UH.SetIcon(this.viewNode.ShowIcon,cfg.item_show,ICON_TYPE.ITEM);
    }

    private onBtnClick(){
        let info=FirstChargeData.Inst().ResultData;
        if(info ){
            if(info.info.fetchMark){
                PublicPopupCtrl.Inst().Center(Language.ActCommon.JiangLiYiLingQu);
            }else if(info.info.firstChongMark){
                FirstChargeCtrl.Inst().SendReq(FirstCharge_OP_TYPE.FETCH);
            }else{
                ViewManager.Inst().OpenViewByKey(Mod.Shop.DiamondShop);
            }
        }
    }

     CloseCallBack() {
    }
}