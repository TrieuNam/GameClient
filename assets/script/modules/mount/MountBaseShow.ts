
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagCtrl, KNAPSACK_REQ_TYPE } from "modules/bag/BagCtrl";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GetWayData } from "modules/getway/GetWayData";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UpLevelShowView } from "modules/UpLevelShow/UpLevelShowView";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { HarnessBuyView } from "./HarnessBuyView";
import { MountAwakeView } from "./MountAwakeView";
import { MountConfigQuaBgName } from "./MountConfig";
import { MOUNR_REQ_TYPE, MountCtrl } from "./MountCtrl";
import { MountData } from "./MountData";
import { MountExploreView } from "./MountExploreView";
import { MountShowCellMain } from "./MountMainView";
import { CfgMountData } from "config/CfgMount";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";

//屏蔽以下坐骑    坐骑id
export let MountShield = [40082, 40084, 40085]

export class MountBase extends BaseItem {
    private mount_list: any;
    private showing_id: number
    private mark_level: number
    private level_up_limit: number
    private level_up_item_id: number
    private is_unlock: boolean
    private level_grade_limit: number
    private level_grade_item_id: number
    private compose_limit: number
    private compose_item_id: number

    private unlock_mark: boolean
    private levelup_mark: boolean
    private cache_flush = 0
    private detail_mark:any

    protected viewNode = {
        HuoBiIcon1: <fgui.GLoader>null,
        HuoBi: <fgui.GLabel>null,

        MountPic: <fgui.GLoader>null,
        MountQua: <fgui.GLoader>null,
        BtnFangSheng: <fgui.GButton>null,
        MountName: <fgui.GLabel>null,
        MountLevel: <fgui.GLabel>null,
        RideOn: <fgui.GGroup>null,
        BtnRideOn: <fgui.GButton>null,
        BtnRideOn2: <fgui.GButton>null,
        BtnExplore: <fgui.GButton>null,
        BtnWake: <fgui.GButton>null,

        MountAttrList: <fgui.GList>null,
        MountList: <fgui.GList>null,
        LevelMax: <fgui.GGroup>null,
        LevelUp: <fgui.GGroup>null,
        UnLockPart: <fgui.GGroup>null,

        progress: <fgui.GProgressBar>null,
        cur_level: <fgui.GLabel>null,
        HuoBiIcon2: <fgui.GLoader>null,
        LevelCost: <fgui.GLabel>null,
        BtnLevelUp: <fgui.GButton>null,

        ComposePart: <fgui.GGroup>null,
        UnlockItemCall: <ItemCell>null,
        ComposeItem: <ItemCell>null,
        MountUnlockName: <fgui.GLabel>null,
        ComposeNum: <fgui.GLabel>null,
        UnlockNeed: <fgui.GLabel>null,
        BtnUnlock: <fgui.GButton>null,
        ComposeClick: <fgui.GGraph>null,

        LevelRedPoint: <RedPoint>null,
        ComRedPoint: <RedPoint>null,
        ExploreRedPoint: <RedPoint>null,
        UnLockRedPoint: <RedPoint>null,

        ArrowLeft: <fgui.GButton>null,
        ArrowRight: <fgui.GButton>null,
        AwakeEff: <UIEffectShow>null,
        AwakenRedPoint: <RedPoint>null,
        uiModelShow: <UIModelShow>null,
    }

    private handleCollector: HandleCollector;
    InitData() {
        this.handleCollector = HandleCollector.Create();
        this.addSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.addSmartDataCare(MountData.Inst().flush_info, this.flushMountList.bind(this, false), "needflush");
        this.addSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "FragItemChange");

        this.viewNode.BtnRideOn.onClick(this.OnClickRideOn.bind(this));
        this.viewNode.BtnExplore.onClick(this.OnClickExplore.bind(this));
        this.viewNode.BtnWake.onClick(this.OnClickWake.bind(this));
        this.viewNode.BtnLevelUp.onClick(this.BtnLevelUp.bind(this));
        this.viewNode.BtnUnlock.onClick(this.BtnUnlock.bind(this));

        this.viewNode.ArrowLeft.onClick(this.onClickLeftArrow.bind(this));
        this.viewNode.ArrowRight.onClick(this.onClickRightArrow.bind(this));

        this.viewNode.ComposeClick.onClick(this.onComposeClick.bind(this));
        this.viewNode.BtnFangSheng.visible = false

        GuideCtrl.Inst().AddGuideUi("MountMainBtnLevelUp", this.viewNode.BtnLevelUp);
        GuideCtrl.Inst().AddGuideUi("MountMainBtnUnlock", this.viewNode.BtnUnlock);
        GuideCtrl.Inst().AddGuideUi("MountMainBtnRideOn", this.viewNode.BtnRideOn);

        this.viewNode.MountList.on(fgui.Event.CLICK_ITEM, this.ClickMount, this);
        this.flushMountList(true)
        this.flushInfoPanel()
    }

    protected onDestroy(): void {
        super.onDestroy();

        GuideCtrl.Inst().ClearGuideUi("MountMainBtnLevelUp");
        GuideCtrl.Inst().ClearGuideUi("MountMainBtnUnlock");
        GuideCtrl.Inst().ClearGuideUi("MountMainBtnRideOn");
        GuideCtrl.Inst().ForceStop();

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private ClickMount(item: MountShowCellMain) {
        this.showing_id = item.data.id

        this.flushInfoPanel()
    }

    private FixShowingId() {
        if (this.showing_id != null) { return }
        this.showing_id = this.mount_list[this.viewNode.MountList.selectedIndex].id
        this.flushInfoPanel()
    }

    private flushMountList(init_flag: boolean) {
        if (!init_flag && this.cache_flush == MountData.Inst().flush_info.needflush) { return }

        this.mount_list = MountData.Inst().GetMainMountList()
        this.viewNode.MountList.SetData(this.mount_list);

        // let oper_id = MountData.Inst().flush_info.operid
        if (init_flag) {
            this.showing_id = this.mount_list[0].id
            this.viewNode.MountList.selectedIndex = 0
        }
        else {
            // this.showing_id = oper_id
            for (let i = 0; i < this.mount_list.length; i++) {
                if (this.mount_list[i].id == this.showing_id) {
                    this.viewNode.MountList.selectedIndex = i
                    break
                }
            }
        }

        this.cache_flush = MountData.Inst().flush_info.needflush
    }

    private FlushMountInfo() {
        // var cfg = MountData.Inst().GetHeChengCfg(this.showing_id);
        var cfg = MountData.Inst().GetMountGrade(this.showing_id);
        if (cfg.mount_res) {
            this.viewNode.uiModelShow.setPath(ResPath.Ride(cfg.mount_res));
        }
    }

    private flushInfoPanel() {
        if (this.showing_id == undefined) { return }

        this.FlushMountInfo();
        let detail = MountData.Inst().GetMountDetail(this.showing_id)
        this.is_unlock = detail.grade > 0
        var cfg = MountData.Inst().GetHeChengCfg(this.showing_id);
        UH.SetIcon(this.viewNode.MountPic, cfg.hecheng_item_id, ICON_TYPE.ITEM)
        UH.SpriteName(this.viewNode.MountQua, "CommonAtlas", MountConfigQuaBgName[detail.color]);
        //this.viewNode.BtnFangSheng.visible = detail.grade > 0
        UH.SetText(this.viewNode.MountName, detail.name)
        UH.SetText(this.viewNode.MountLevel, Language.Mount.LvTitle + detail.level)
        this.viewNode.BtnRideOn2.visible = MountData.Inst().GetMountIsRideOn(this.showing_id)
        this.viewNode.BtnRideOn.visible = !MountData.Inst().GetMountIsRideOn(this.showing_id) && this.is_unlock

        let level_change = MountData.Inst().GetMountLevelChange(this.showing_id)

        this.viewNode.MountAttrList.SetData(level_change)

        this.viewNode.LevelMax.visible = detail.is_max_level
        this.viewNode.LevelUp.visible = !detail.is_max_level && this.is_unlock
        // this.viewNode.UnLockPart.visible = !this.is_unlock

        this.viewNode.progress.max = 5;
        this.viewNode.progress.value = detail.is_level_init ? 0 : detail.cur_cfg.mount_level;
        let grade_show = detail.is_level_init ? 0 : detail.cur_cfg.show_mount_level;
        let level_show = detail.is_level_init ? 0 : detail.cur_cfg.mount_level;
        UH.SetText(this.viewNode.cur_level, TextHelper.Format(Language.Mount.LevelShow, grade_show, level_show))

        this.level_up_limit = detail.is_level_init ? detail.next_cfg.up_item_num : detail.cur_cfg.up_item_num;
        this.level_up_item_id = detail.is_level_init ? detail.next_cfg.up_item_id : detail.cur_cfg.up_item_id;
        this.mark_level = detail.is_max_level ? detail.cur_cfg.level : detail.next_cfg.level

        UH.SetIcon(this.viewNode.HuoBiIcon1, this.level_up_item_id, ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.HuoBiIcon2, this.level_up_item_id, ICON_TYPE.ITEM)

        let num = BagData.Inst().getItemNum(this.level_up_item_id);
        UH.SetText(this.viewNode.HuoBi, num);

        let cost = detail.is_level_init ? detail.next_cfg.up_item_num : detail.cur_cfg.up_item_num
        let cost_str = num >= cost ? cost : TextHelper.ColorStr(cost, COLORSTR.Red5)
        UH.SetText(this.viewNode.LevelCost, cost_str)

        // 解锁区块
        if (detail.next_g_cfg) {
            this.level_grade_limit = detail.next_g_cfg.up_num;
            this.level_grade_item_id = detail.next_g_cfg.up_id;
        }

        let grade_num = BagData.Inst().getItemNum(this.level_grade_item_id);
        this.viewNode.UnlockItemCall.SetData(Item.Create({
            item_id: this.level_grade_item_id
        }, { is_num: false, is_click: false }))
        this.viewNode.UnLockRedPoint.SetNum(detail.unlock_red)

        UH.SetText(this.viewNode.UnlockNeed,
            TextHelper.ColorStr(grade_num, grade_num >= this.level_grade_limit ? COLORSTR.Yellow2 : COLORSTR.Red5)
            + "/" + this.level_grade_limit)

        // 合成区块
        this.compose_item_id = detail.hecheng_cfg.hecheng_id
        this.compose_limit = Item.GetConfig(this.compose_item_id).param_0

        this.viewNode.ComposeItem.SetData(Item.Create({
            item_id: this.compose_item_id
        }, { is_num: false, is_click: false }))

        let compose_num = BagData.Inst().getItemNum(this.compose_item_id);

        UH.SetText(this.viewNode.ComposeNum,
            TextHelper.ColorStr(compose_num, compose_num >= this.compose_limit ? COLORSTR.Yellow2 : COLORSTR.Red5)
            + "/" + this.compose_limit)

        this.viewNode.LevelRedPoint.SetNum(detail.level_red)
        this.viewNode.ComRedPoint.SetNum(detail.pice_red)

        UH.SetText(this.viewNode.MountUnlockName, detail.name)

        // 探索红点
        let param = MountData.Inst().GetMountExploreProfit()
        // let e_num = (param.cur_pro >= Math.floor(param.max_pro/2)&&param.max_pro > 0 ) ? 1 : 0
        let e_num = MountData.Inst().GetMountExploreRed() ? 1 : 0
        // this.viewNode.ExploreRedPoint.SetNum(e_num)


        if (this.unlock_mark) {
            AudioManager.Inst().Play(AudioTag.JiHuo)
            this.unlock_mark = false
        }

        if (this.levelup_mark) {
            AudioManager.Inst().Play(AudioTag.ShengJi)
            this.levelup_mark = false

            let fuhao = "+"
            let type = 1
            for (let i = 0; i < level_change.length; i++) {
                let att_type = level_change[i].att_type;
                let att_add = level_change[i].att_2_value > 0 ? level_change[i].att_2_value - level_change[i].att_1_value :level_change[i].att_1_value ;
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
            }
        }
        else 
        {
        }

        if(this.detail_mark == null || this.detail_mark.name != detail.name)
        {
            this.detail_mark = detail
        }
        else if(this.detail_mark.level < detail.level)
        {
            let mark_grade_show = this.detail_mark.is_level_init ? 0 : this.detail_mark.cur_cfg.show_mount_level;
            let mark_level_show = this.detail_mark.is_level_init ? 0 : this.detail_mark.cur_cfg.mount_level;
            ViewManager.Inst().OpenView(UpLevelShowView,{
                plus_before:mark_grade_show,
                plus_w_b:Language.Mount.GradeTitle,

                level_before:mark_level_show,
                level_w_b:Language.Mount.LevelTitle,

                level_after:grade_show ,
                level_w_a:Language.Mount.GradeTitle,
                
                plus_after:level_show,
                plus_w_a:Language.Mount.LevelTitle,
                
            })
            this.detail_mark = detail
        }

        let awake_red_num = (detail.awake_red == 1 && detail.grade > 0) ? 1 : 0
        this.viewNode.AwakenRedPoint.SetNum(awake_red_num)
    }

    private OnClickRideOn() {
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.SET_APP, this.showing_id)
    }

    private OnClickWake() {
        if (!this.is_unlock) {
            PublicPopupCtrl.Inst().Center(Language.Mount.UnlockError);
            return
        }

        ViewManager.Inst().OpenView(MountAwakeView, { link_id: this.showing_id });
    }

    private OnClickExplore() {
        ViewManager.Inst().OpenView(MountExploreView);
    }

    private BtnLevelUp() {
        this.FixShowingId()
        let num = BagData.Inst().getItemNum(this.level_up_item_id);
        let config = Item.GetConfig(this.level_up_item_id);
        let list = GetWayData.Inst().GetWayList(config.get_way);

        if (num < this.level_up_limit) {
            // PublicPopupCtrl.Inst().Center(Language.Mount.LackItem);
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Mount.LevelUpItemLackError,
                Item.GetName(this.level_up_item_id), list[0].desc));

            let show_call = Item.Create({ item_id: this.level_up_item_id, num: this.level_up_limit - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }

        if(CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Mount, this.mark_level))
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips,Language.CoreCrisis.CoreName[CoreCrisisType.Mount]))
            ViewManager.Inst().OpenView(CoreCrisisView,{mark_type:CoreCrisisType.Mount})
            return 
        }

        this.levelup_mark = true
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.LEVEL_UP, this.showing_id)

    }
    private BtnUnlock() {
        this.FixShowingId()
        let num = BagData.Inst().getItemNum(this.level_grade_item_id);
        if (num < this.level_grade_limit) {
            let show_call = Item.Create({ item_id: this.level_grade_item_id, num: this.level_grade_limit - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.Mount.UnLockItemLackError);
            return
        }

        this.viewNode.AwakeEff.PlayEff("4164050");
        this.unlock_mark = true
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.GRADE_UP, this.showing_id)
        PublicPopupCtrl.Inst().Center(Language.Mount.AwakenSuccess);
    }

    private onComposeClick() {
        let num = BagData.Inst().getItemNum(this.compose_item_id);
        if (num < this.compose_limit) {
            let show_call = Item.Create({ item_id: this.compose_item_id, num: this.compose_limit - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.Mount.ComposeError);
            return
        }

        BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.USE, [this.compose_item_id, this.compose_limit, 0])
        // MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.GRADE_UP,this.showing_id)
    }

    private onClickLeftArrow() {
        let move = this.viewNode.MountList.selectedIndex - 1
        this.viewNode.MountList.selectedIndex = move < 0 ? 0 : move
        this.viewNode.MountList.scrollToView(this.viewNode.MountList.selectedIndex, true, true);

        this.showing_id = this.mount_list[this.viewNode.MountList.selectedIndex].id
        this.flushInfoPanel()
    }

    private onClickRightArrow() {
        let move = this.viewNode.MountList.selectedIndex + 1
        this.viewNode.MountList.selectedIndex = move > this.mount_list.length - 1 ? this.mount_list.length - 1 : move
        this.viewNode.MountList.scrollToView(this.viewNode.MountList.selectedIndex, true, true);

        this.showing_id = this.mount_list[this.viewNode.MountList.selectedIndex].id
        this.flushInfoPanel()
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}