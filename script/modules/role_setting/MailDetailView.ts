import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { RedPoint } from "modules/extends/RedPoint";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { MailSeqType, RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class MailDetailView extends BaseView {
    data = RoleData.Inst()
    detail_data: PB_SCMailDetail = null
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "RoleSetting",
        ViewName: "MailDetailView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    /* protected extendsCfg = [
    ]; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        Content: <fgui.GTextField>null,
        List: <fgui.GList>null,
        BtnOK: <fgui.GButton>null,
        FetchDesc: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };

    InitData(data: PB_SCMailDetail) {
        this.viewNode.BtnOK.onClick(this.OnClickButton, this)
        this.detail_data = data
        this.viewNode.Board.SetData(new BoardData(MailDetailView, DataHelper.BytesToString(data.subject)))
        UH.SetText(this.viewNode.Content, DataHelper.BytesToString(data.contenttxt))
        let rewards = [];
        let rewad_list = data.itemData
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        this.viewNode.List.SetData(rewards)
        let info = this.data.select_mail
        UH.SetText(this.viewNode.FetchDesc, null)
        this.viewNode.RedPoint.SetNum(0)
        if (info != null) {
            if (this.detail_data.itemData.length > 0) {
                UH.SetText(this.viewNode.FetchDesc, Language.RoleSetting.MailGet[info.isFetch])
            }
            this.viewNode.RedPoint.SetNum((info.isFetch == 0 && info.itemData != null && info.itemData.length > 0) ? 1 : 0)
        }
    }
    OpenCallBack() {
        let info = this.data.select_mail
        this.viewNode.BtnOK.title = Language.RoleSetting.OK
        if (info != null) {
            if (this.detail_data.itemData.length > 0 && info.isFetch == 0) {
                this.viewNode.BtnOK.title = Language.RoleSetting.RewardGet
            }
        }
    }
    OnClickButton() {
        let info = this.data.select_mail
        //this.viewNode.BtnOK.title = Language.RoleSetting.OK
        if (info != null) {
            if (this.detail_data.itemData.length > 0 && info.isFetch == 0) {
                RoleCtrl.Inst().SendMailReq(MailSeqType.FetchMailAttachment, this.detail_data.mailType, this.detail_data.mailIndex)
            }
        }
        ViewManager.Inst().CloseView(MailDetailView)
    }

}