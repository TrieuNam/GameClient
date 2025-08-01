import { SpriteFrame } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { AvatarCell } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

export class MainCapItem extends BaseItem {
    protected viewNode = {
        CapShow: <fgui.GList>null,
    };

    public SetData(data: any) {
        // if(+data > 10000){
        //     data = Math.floor(data/ 1000)
        //     let behind = data % 10
        //     let font = Math.floor(data/ 10)
        //     data = `${font}W${behind}`
        // }
        let list = DataHelper.SplitList(data, "")
        this.viewNode.CapShow.SetData(list);
    }
}

export class MainCapBigItem extends BaseItem {
    protected viewNode = {
        CapShow: <fgui.GList>null,
    };

    public SetData(data: any) {
        // if(+data > 10000){
        //     data = Math.floor(data/ 1000)
        //     let behind = data % 10
        //     let font = Math.floor(data/ 10)
        //     data = `${font}W${behind}`
        // }
        let list = DataHelper.SplitList(data, "")
        this.viewNode.CapShow.SetData(list);
    }
}

export class MainCapNumItem extends BaseItem {
    protected viewNode = {
        NumShow: <fgui.GLoader>null,
    };

    public SetData(data: any) {
        this.width = "W" == data ? 29 : 20
        UH.SpriteName(this.viewNode.NumShow, "CommonAtlas", TextHelper.Format("Cap{0}", data));
    }
}

export class MainCapNumBigItem extends BaseItem {
    protected viewNode = {
        NumShow: <fgui.GLoader>null,
    };

    public SetData(data: any) {
        this.width = "W" == data ? 29 : 40
        UH.SpriteName(this.viewNode.NumShow, "CommonAtlas", TextHelper.Format("CapBig{0}", data));
    }
}

export class RoleAvatarItem extends BaseItemGB {
    protected viewNode = {
        AvatarShow: <AvatarCell>null,
        LevelShow: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };

    public SetData(data: any) {
        // this.viewNode.AvatarShow.DefaultShow()
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Common.LevelShow, data.level));
    }
    public SeSpriteFrame(sf: SpriteFrame) {
        this.viewNode.AvatarShow.SeSpriteFrame(sf)
    }
    public DefaultShow() {
        this.viewNode.AvatarShow.DefaultShow()
    }
    public SetNum(num: number) {
        this.viewNode.RedPoint.SetNum(num)
    }
}

export class MainDailyAdButton extends BaseItemGB {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        NumShow: <fgui.GTextField>null,
        RedPointShow:<RedPoint>null,
    };

    public FlushShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.daily)
        UH.SetText(this.viewNode.NumShow, `+${co.ad_award[0].num ?? 0}`)
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Item${co.ad_award[0].item_id ?? 40001}`)
        this.viewNode.RedPointShow.SetNum(1)
    }
}