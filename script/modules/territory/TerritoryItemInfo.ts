import { error } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BoxData } from "modules/box/BoxData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TerritoryData } from "./TerritoryData";
@BaseView.registView
export class TerritoryItemInfo extends BaseView {
    data = TerritoryData.Inst()
    item_info: IPB_SCTerritoryItemNode = undefined
    limit_max = 0
    use_num = 1
    item_seq = 1
    item_index = 1
    is_doing = false
    role_id = 0
    cur_num = 0//当前正在拖动的数量
    is_max_box = false
    protected viewRegcfg = {
        UIPackName: "TerritoryItemInfo",
        ViewName: "TerritoryItemInfo",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        NeedTime: <fgui.GTextField>null,
        LimitNum: <fgui.GTextField>null,
        BtnStart: <fgui.GButton>null,
        BtnAdd: <fgui.GButton>null,
        BtnSub: <fgui.GButton>null,
        Level: <fgui.GTextField>null,
        NeedNum: <fgui.GTextField>null,
        LeftGroup: <fgui.GGroup>null,
        RightGroup: <fgui.GGroup>null,
        RightHead: <AvatarCell>null,
        LeftHead: <AvatarCell>null,
        TimeMetter: <TimeMeter>null,
        Icon: <fgui.GLoader>null,
        Num: <fgui.GRichTextField>null,
        ChangeNum: <fgui.GGroup>null,
        BoxTip: <fgui.GGroup>null,
        ErrorText: <fgui.GTextField>null,
    }

    InitData(param: any): void {
        this.item_info = param
        this.item_seq = this.item_info.seq
        this.item_index = this.item_info.index
        if (this.data.show_mine) {
            this.role_id = this.data.my_territory.roleInfo.roleId
            if (this.item_info.defenderNum > 0) {
                this.use_num = this.item_info.defenderNum
            }
        } else {
            this.role_id = this.data.other_territory.roleInfo.roleId
            if (this.item_info.attackerNum > 0 && this.item_info.attackerInfo.roleId == this.data.my_territory.roleInfo.roleId) {
                this.use_num = this.item_info.attackerNum
            }
        }

        this.viewNode.Board.SetData(new BoardData(TerritoryItemInfo))
        this.viewNode.BtnAdd.onClick(this.OnClickAdd, this)
        this.viewNode.BtnSub.onClick(this.OnClickSub, this)
        this.viewNode.BtnStart.onClick(this.OnClickStart, this)
        let info = this.data.GetItemCfg(this.item_seq)
        this.viewNode.Board.SetTitle(info.item_name)
        GuideCtrl.Inst().AddGuideUi("TerritoryBtnStart", this.viewNode.BtnStart);

    }
    can_use_num = 0
    FlushItemInfo() {
        let info = this.data.GetItemCfg(this.item_seq)
        if (info == null) {
            return
        }
        let my_info = this.data.my_territory
        this.limit_max = info.max_monster
        //UH.SetIcon(this.viewNode.Icon, Item.GetIconId(info.item_id), ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.Icon, info.icon, ICON_TYPE.ITEM)
        UH.SetText(this.viewNode.Level, Format(Language.Territory.Level2, info.item_level))
        UH.SetText(this.viewNode.NeedNum, info.item_num)//获取多少
        UH.SetText(this.viewNode.LimitNum, Format(Language.Territory.Limit, info.max_monster))
        let item_cfg = this.data.GetItemCfg(this.item_seq)
        this.is_max_box = item_cfg.item_id == BoxData.Inst().GetBoxId() && BoxData.Inst().GetBoxNumInfo() >= this.data.GetOtherCfg().own_box
        this.viewNode.ChangeNum.visible = !this.is_max_box
        this.viewNode.BoxTip.visible = this.is_max_box
        if (this.is_max_box) {
            this.viewNode.ErrorText.text = Language.Territory.ErrorText3
        }
        //计算消耗时间
        let config = this.data.GetEfficiency(my_info.rewardCount)
        let final_speed = (info.speed + (this.use_num - 1) * info.myself_decrease_time) * config.efficiency / 100
        let dis = this.item_info.pos//这里要判断是否是抢夺
        if (this.data.show_mine) {
            dis = this.item_info.pos//这里要判断是否是抢夺
        } else {
            final_speed = (info.speed + (this.use_num - 1) * info.enemy_decrease_time) * config.efficiency / 100
            dis = this.data.GetOtherCfg().grid_max - this.item_info.pos
        }
        let time = dis / final_speed
        //console.log(this.data.show_mine, dis, final_speed, time, my_info.rewardCount, config.efficiency)
        this.cur_num = 0
        if (this.data.show_mine) {
            //显示我方领地 
            let info = this.data.my_territory
            this.viewNode.LeftHead.SetData(new AvatarData(info.roleInfo.headPicId, info.roleInfo.level, info.roleInfo.headChar))
            if (this.item_info.defenderNum > 0) {
                //我方正常防御
                this.is_doing = true
                this.cur_num = this.item_info.defenderNum
            } else {
                this.is_doing = false
            }
            if (this.item_info.attackerNum > 0) {
                this.viewNode.RightGroup.visible = true
                this.viewNode.LeftHead.SetData(new AvatarData(info.roleInfo.headPicId, info.roleInfo.level, info.roleInfo.headChar))
            } else {
                this.viewNode.RightGroup.visible = false
            }
            this.viewNode.LeftGroup.visible = true
        } else {
            let info = this.data.other_territory
            //显示敌方领地
            if (this.item_info.attackerNum > 0) {
                //我方攻击
                this.is_doing = true
                this.cur_num = this.item_info.attackerNum
                this.viewNode.RightHead.SetData(new AvatarData(this.item_info.attackerInfo.headPicId, this.item_info.attackerInfo.level, this.item_info.attackerInfo.headChar))
            } else {
                this.is_doing = false
                this.viewNode.RightHead.SetData(new AvatarData(RoleData.Inst().GetRoleHeadPic(), RoleData.Inst().GetRoleLevel(), RoleData.Inst().ResultData.roleinfo.headChar))
            }
            this.viewNode.RightGroup.visible = true
            if (this.item_info.defenderNum > 0) {
                this.viewNode.LeftGroup.visible = true
                this.viewNode.LeftHead.SetData(new AvatarData(info.roleInfo.headPicId, info.roleInfo.level, info.roleInfo.headChar))
            } else {
                this.viewNode.LeftGroup.visible = false
            }
        }
        this.can_use_num = my_info.botNum - my_info.botRunNum + this.cur_num
        if (!this.is_max_box) {
            this.viewNode.BoxTip.visible = this.can_use_num == 0
            this.viewNode.ChangeNum.visible = !(this.can_use_num == 0)
            if (this.can_use_num == 0) {
                this.viewNode.ErrorText.text = Language.Territory.ErrorText4
            }
        }
        let is_overstep = this.use_num > this.can_use_num ? Language.Territory.UseNum2 : Language.Territory.UseNum;
        UH.SetText(this.viewNode.Num, TextHelper.Format(is_overstep, this.use_num, this.can_use_num < this.limit_max ? this.can_use_num : this.limit_max))
        if (this.is_doing) {
            this.viewNode.TimeMetter.SetOutline(true, COLORSTR.Yellow2)
            this.viewNode.TimeMetter.StampTime(this.item_info.endTime)
            UH.SetText(this.viewNode.NeedTime, "")
        } else {
            let time_t = TimeHelper.FormatDHMS(time);
            UH.SetText(this.viewNode.NeedTime, Format(Language.UiTimeMeter.TimeStr1, time_t.hour, time_t.minute, time_t.second))
            this.viewNode.TimeMetter.SetTime("")
        }

    }

    InitUI(): void {

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.FlushItemInfo()
    }

    CloseCallBack(): void {
        GuideCtrl.Inst().ClearGuideUi("TerritoryBtnStart");
    }

    WindowSizeChange() {

    }


    OnClickAdd() {
        /* if (this.is_doing) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BotDoing)
            return
        } */
        let num = this.use_num + 1
        if (num > this.limit_max) {
            PublicPopupCtrl.Inst().Center(Language.Territory.ErrorText1)
            return
        }
        this.use_num += 1
        this.FlushItemInfo()
    }
    OnClickSub() {
        /* if (this.is_doing) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BotDoing)
            return
        } */
        let num = this.use_num - 1
        if (num == 0) {
            return
        }
        this.use_num -= 1
        this.FlushItemInfo()
    }

    OnClickStart() {
        if (this.is_max_box) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BoxTip)
            return
        }
        if (this.can_use_num == 0) {
            PublicPopupCtrl.Inst().Center(Language.Territory.ErrorText5)
            return
        }
        /* if (this.is_doing) {
            PublicPopupCtrl.Inst().Center(Language.Territory.BotDoing)
            return
        } */
        let info = this.data.my_territory
        if (this.use_num > (info.botNum - info.botRunNum + this.cur_num)) {
            PublicPopupCtrl.Inst().Center(Language.Territory.ErrorText2)
            return
        }
        ViewManager.Inst().CloseView(TerritoryItemInfo)
        TerritoryCtrl.Inst().SendFetchItem(this.role_id, this.item_index, this.use_num)
        //这里假设是在他人领地那么要修改一下 my_territory的botRunNum
    }
}