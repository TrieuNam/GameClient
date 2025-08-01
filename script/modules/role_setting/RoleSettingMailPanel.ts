
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { MailSeqType, MailType, RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";

export class RoleSettingMailPanel extends BasePanel {
    data = RoleData.Inst()
    protected viewNode = {
        // BtnFight: <fgui.GButton>null,
        List: <fgui.GList>null,
        BtnGet: <fgui.GButton>null,
        BtnDel: <fgui.GButton>null,
        NoneObj: <fgui.GLabel>null,
    };

    // protected extendsCfg = [
    //     { ResName: "GuMoLayerItem", ExtendsClass: TrialGuMoTowerPanelLayerItem },

    // ];

    InitPanelData() {
        this.viewNode.List.setVirtual();
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.OnClickMailItem, this);
        //this.viewNode.List.on(fgui.Event.CLICK_ITEM,this.OnClickLayerItem,this);

        this.AddSmartDataCare(this.data.MainFlush, this.FlushMailList.bind(this), "flush_mail");

        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
        this.viewNode.BtnDel.onClick(this.OnClickDel, this);
        // this.viewNode.StarReward1.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward1, 0))
        // this.viewNode.StarReward2.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward2, 1))
        // this.viewNode.StarReward3.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward3, 2))
        this.FlushMailList()
    }
    FlushMailList() {
        let list = this.data.MailList
        list.sort((a: IPB_MailBriefData, b: IPB_MailBriefData) => {
            return b.recvTime - a.recvTime
        })
        this.viewNode.List.SetData(list)
        this.viewNode.NoneObj.visible = (this.data.MailList.length == 0)
    }
    OnClickDel() {
        console.log("一键删除");

        /* let list = [0, 1, 2, 3, 4, 5, 6]
        console.log(list, list.length);
        list.forEach(element => {
            if (element == 3) {
                let index = list.indexOf(element)
                list[index] = null
            }
        });
        let list2: number[] = []
        list.forEach(element => {
            if (element != null) {
                list2.push(element)
            }
        });
        console.log(list2, list2.length); */

        RoleCtrl.Inst().SendMailReq(MailSeqType.OneKeyCleanMail, MailType.Usual, 0)
        //RoleCtrl.Inst().SendMailReq(MailSeqType.OneKeyCleanMail, MailType.Act, 0)
    }
    OnClickGet() {
        console.log("一键领取");
        RoleCtrl.Inst().SendMailReq(MailSeqType.OneKeyFetchMail, MailType.Usual, 0)
        //RoleCtrl.Inst().SendMailReq(MailSeqType.OneKeyFetchMail, MailType.Act, 0)
    }
    OnClickMailItem(item: MailItem) {
        //console.log(item);
        let data = item._data
        //console.log(data);
        RoleCtrl.Inst().SendMailReq(MailSeqType.GetMailDetail, data.mailType, data.mailIndex)
        this.data.select_mail = data
    }
    InitPanel() {
        // this.FlushGuMoLayerShow();
    }

    ClosePanel() {
    }

}
class IPB_ItemDataMail implements IPB_ItemData {
    itemId: number
    num: number
    isFetch: number
}
export class MailItem extends BaseItemGB {
    _data: IPB_MailBriefData = null
    viewNode = {
        Icon: <fgui.GLoader>null,
        Title: <fgui.GTextField>null,
        Date: <fgui.GTextField>null,
        Time: <fgui.GTextField>null,
        State: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
        List: <fgui.GList>null,
    };

    public SetData(data: IPB_MailBriefData) {
        //super.SetData(data);
        this._data = data
        UH.SetText(this.viewNode.Title, DataHelper.BytesToString(data.subject))
        UH.SetText(this.viewNode.State, Language.RoleSetting.MailGet[data.isFetch])
        let img_name = ["FuWuQiDi", "YouJianHuiDi"]
        UH.SpriteName(this.viewNode.Icon, "RoleSetting", img_name[data.isRead])
        let times = TimeHelper.FormatUnixTimeDate(data.recvTime)
        UH.SetText(this.viewNode.Date, Format(Language.RoleSetting.Date, times.year, times.month, times.day))
        UH.SetText(this.viewNode.Time, Format(Language.RoleSetting.Time, times.hour, times.minute, times.second))
        this.viewNode.RedPoint.SetNum((data.isFetch == 0 && data.itemData != null && data.itemData.length > 0) ? 1 : 0)
        let list: any = []
        data.itemData.forEach(element => {
            let item = new IPB_ItemDataMail()
            item.itemId = element.itemId
            item.num = element.num
            item.isFetch = data.isFetch
            list.push(item)
        });
        this.viewNode.List.SetData(list)
    }
}

export class ItemMailCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Fetch: <fgui.GImage>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: IPB_ItemDataMail) {
        this._data = data;
        this.viewNode.Cell.SetData(Item.Create({ item_id: data.itemId, num: data.num }, { mask_icon: data.isFetch == 1, is_num: true }))
        this.viewNode.Fetch.visible = data.isFetch == 1
    }
    public GetData() {
        return this._data;
    }
}