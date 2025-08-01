import { GetCfgValue } from "config/CfgCommon";
import { CfgOrbData } from "config/CfgOrb";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishConfig } from "./FishConfig";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView
export class FishMapView extends BaseView {

    private mapSel: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishMap",
        ViewName: "FishMapView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        BtnLast: <FishMapViewButtonArrow>null,
        BtnNext: <FishMapViewButtonArrow>null,
        BtnGo: <fgui.GButton>null,

        NameShow: <fgui.GTextField>null,
        ConditionList: <fgui.GList>null,
        MapItem: <FishMapViewMapItem>null,

        RedPointShow: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "ItemMap", ExtendsClass: FishMapViewMapItem },
        { ResName: "ItemCondition", ExtendsClass: FishMapViewConditionItem },
        { ResName: "ButtonArrow", ExtendsClass: FishMapViewButtonArrow },
    ];


    InitData() {
        this.viewNode.Board.SetData(new BoardData(FishMapView));

        this.viewNode.BtnLast.onClick(this.OnClickLast, this);
        this.viewNode.BtnNext.onClick(this.OnClickNext, this);
        this.viewNode.BtnGo.onClick(this.OnClickGo, this);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoMapInfo.bind(this), "WaBaoMapInfo");

        this.mapSel = FishData.Inst().GetWaBaoMapInfoCurMap();
    }

    InitUI() {
        this.FlushWaBaoMapInfo()
    }

    FlushWaBaoMapInfo() {
        this.FlushArrowShow()

        let info = FishData.Inst().GetMapIsLock(this.mapSel)
        this.viewNode.BtnGo.visible = this.mapSel != FishData.Inst().GetWaBaoMapInfoCurMap();
        this.viewNode.BtnGo.grayed = info.is_lock && !info.can_unlock;
        this.viewNode.BtnGo.title = info.is_lock ? (info.can_unlock ? Language.Fish.FishMap.MapUnLock : Language.Fish.FishMap.MapLock) : Language.Fish.FishMap.MapGo;

        let co_map = FishData.Inst().CfgMap(this.mapSel);

        let condition_show: any[] = [];
        let conditions = FishData.Inst().CfgMapConditions(co_map.condition_id);
        for (let i = 0; i < conditions.length; i++) {
            condition_show.push({
                index: i,
                co: conditions[i],
                map: this.mapSel,
            })
        }

        UH.SetText(this.viewNode.NameShow, co_map.name);
        this.viewNode.MapItem.SetData(co_map);
        this.viewNode.ConditionList.SetData(condition_show);

        this.viewNode.RedPointShow.SetNum(info.is_lock && info.can_unlock ? 1 : 0)
    }

    FlushArrowShow() {
        this.viewNode.BtnLast.visible = this.mapSel > 1;
        this.viewNode.BtnNext.visible = this.mapSel < FishData.Inst().CfgMapNum();
        this.viewNode.BtnLast.FlushShow(this.mapSel > 1, this.mapSel, false)
        this.viewNode.BtnNext.FlushShow(this.mapSel < FishData.Inst().CfgMapNum(), this.mapSel, true)
    }

    OnClickLast() {
        this.mapSel = this.mapSel - 1;
        this.FlushWaBaoMapInfo();
    }

    OnClickNext() {
        if (this.mapSel > FishData.Inst().GetWaBaoMapInfoUnlockedMap()) {
            PublicPopupCtrl.Inst().Center(Language.Fish.FishMap.ArrowNextLock)
            return
        }
        this.mapSel = this.mapSel + 1;
        this.FlushWaBaoMapInfo();
    }

    OnClickGo() {
        let info = FishData.Inst().GetMapIsLock(this.mapSel)
        if (info.is_lock) {
            FishCtrl.Inst().SendWaBaoReqUnlockMap(this.mapSel);
        } else {
            ViewManager.Inst().CloseView(FishMapView)
            FishCtrl.Inst().SendWaBaoReqEnterMap(this.mapSel);
        }
    }
}

class FishMapViewMapItem extends BaseItem {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        GpMask: <fgui.GGroup>null,
        NotOpen: <fgui.GImage>null,
    };

    public SetData(data: any) {
        this.viewNode.GpMask.visible = data.orb_map > FishData.Inst().GetWaBaoMapInfoUnlockedMap()
        UH.SpriteName(this.viewNode.BgSp, "FishMap", GetCfgValue(FishConfig.MapSpName, data.resources))
        this.viewNode.NotOpen.visible = data.orb_map > 3
    }
}

class FishMapViewConditionItem extends BaseItem {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        Finish: <fgui.GImage>null,
        ConditionShow: <fgui.GRichTextField>null,
        ProgressShow: <fgui.GRichTextField>null,
    };

    public SetData(data: any) {
        let index = data.index
        let map = data.map
        let co = data.co
        let unlocked_map = FishData.Inst().GetWaBaoMapInfoUnlockedMap()
        let condition_num = FishData.Inst().GetWaBaoMapInfoMapConditionNum(index)
        UH.SpriteName(this.viewNode.BgSp, "CommonAtlas", 0 == index % 2 ? "TongYong_QianDi" : "TongYong_ShenDi")
        UH.SetText(this.viewNode.ConditionShow, TextHelper.Format(GetCfgValue(Language.Fish.FishMap.ConditionShow, co.condition), co.param))
        if (unlocked_map >= map) {
            UH.SetText(this.viewNode.ProgressShow, "")
            this.viewNode.Finish.visible = true
        } else if (unlocked_map + 1 == map) {
            let is_finish = condition_num >= co.param
            UH.SetText(this.viewNode.ProgressShow, is_finish ? "" : TextHelper.Format(Language.Fish.FishMap.ProgressShow, condition_num >= co.param ? COLORSTR.Green1 : COLORSTR.Red1, condition_num, co.param))
            this.viewNode.Finish.visible = is_finish
        } else {
            this.viewNode.Finish.visible = false
            UH.SetText(this.viewNode.ProgressShow, TextHelper.Format(Language.Fish.FishMap.ProgressShow, COLORSTR.Red1, 0, co.param))
        }
    }
}

class FishMapViewButtonArrow extends BaseItemGB {
    protected viewNode = {
        RedPointShow: <RedPoint>null,
    };

    public FlushShow(visible: boolean, map_sel: number, is_next: boolean) {
        let map_rp = 0
        for (let element of CfgOrbData.map_cfg) {
            let info = FishData.Inst().GetMapIsLock(element.orb_map)
            if (info.is_lock && info.can_unlock) {
                map_rp = element.orb_map
                break
            }
        }
        let show_rp = visible && map_rp > 0
        if (show_rp) {
            show_rp = is_next ? map_rp > map_sel : map_rp < map_sel
        }
        this.viewNode.RedPointShow.SetNum(show_rp ? 1 : 0)
    }
}

