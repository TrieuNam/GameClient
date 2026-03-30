import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from 'modules/battle/BattleCtrl';
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ChiefDungeonMopView } from "modules/dungeon/ChiefDungeonMopView";
import { DungeonCtrl, LINGZHU_OP_TYPE } from "modules/dungeon/DungeonCtrl";
import { DungeonData } from "modules/dungeon/DungeonData";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from 'modules/extends/RedPoint';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { Mod } from "modules/common/ModuleDefine";

@BaseView.registView
export class ChiefDungeonView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Dungeon",
        ViewName: "ChiefDungeonView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    private boss_list: any;
    private help_key = 4;//配置的说明文字字段
    protected viewNode = {
        Board: <CommonBoard2>null,
        taglist: <fgui.GList>null,
        BossList: <fgui.GList>null,
        BtnOneKey: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
    }

    protected extendsCfg = [
        { ResName: "ChiefBossCell", ExtendsClass: ChiefBossCell },
        { ResName: "ChiefTypeBtn", ExtendsClass: ChiefBtnTag },
    ];

    protected TagCfg = [
        { name: Language.Dungeon.ChiefNames[0], stage: 1 },
        { name: Language.Dungeon.ChiefNames[1], stage: 2 },
        { name: Language.Dungeon.ChiefNames[2], stage: 3 },
    ];

    private main_pass_timer: any;
    InitData(param: any) {

        let page_index = param && param.modkey ? param.modkey % 10 : 0;
        
        this.viewNode.Board.SetData(new BoardData(ChiefDungeonView, Language.Dungeon.EnterNames[0], this.help_key))

        this.boss_list = DungeonData.Inst().GetChiefDungeonList(1);
        this.viewNode.taglist.itemRenderer = this.onRenderTagItem.bind(this);
        this.viewNode.taglist.on(fgui.Event.CLICK_ITEM, this.OnClickTag, this);
        this.viewNode.taglist.numItems = this.TagCfg.length;
        this.viewNode.taglist.selectedIndex = page_index

        // this.viewNode.BossList.itemRenderer = this.onRenderBossItem.bind(this);
        // this.viewNode.BossList.numItems = this.boss_list.length;
        this.viewNode.BossList.setVirtual()
        this.viewNode.BossList.SetData(this.boss_list);
        this.viewNode.BossList.setVirtual()

        this.viewNode.BtnOneKey.onClick(this.ClickOneKey.bind(this));

        this.AddSmartDataCare(DungeonData.Inst().chief_flush_info, this.flushPannel.bind(this), "needflush");
        //this.main_pass_timer = Timer.Inst().AddCountDownTT(this.updateMainPassAuto.bind(this), this.updateMainPassAuto.bind(this), 50000, 1, true);

        DungeonData.Inst().OpenView()
    }

    InitUI() {
        this.flushPannel()
    }

    CloseCallBack() {
        GuideCtrl.Inst().ForceStop();
    }


    private flushPannel() {
        if (BattleCtrl.Inst().check(this, this.flushPannel.bind(this))) {
            return
        }
        this.boss_list = DungeonData.Inst().GetChiefDungeonList(this.viewNode.taglist.selectedIndex + 1);
        let selected_index = DungeonData.Inst().GetChiefSelectDungeon(this.viewNode.taglist.selectedIndex + 1);
        // this.viewNode.BossList.numItems = this.boss_list.length;
        this.viewNode.BossList.SetData(this.boss_list);

        this.viewNode.BossList.scrollToView(selected_index, true, true);

        let flag = false
        for (var index in this.boss_list) {
            let oper = this.boss_list[index]
            if (oper.show_saodang && oper.is_complete && oper.last_num > 0) {
                flag = true
                break
            }
        }
        this.viewNode.RedPoint.SetNum(flag ? 1 : 0)

        this.viewNode.taglist.numItems = this.TagCfg.length
    }

    private CloseView() {
        ViewManager.Inst().CloseView(ChiefDungeonView)
    }

    private HelpClick() {
        // ViewManager.Inst().CloseView(ChiefDungeonView)
    }

    private OnClickTag(item: ChiefBtnTag) {
        // this.boss_list = DungeonData.Inst().GetChiefDungeonList(item.data.stage);
        // this.viewNode.BossList.numItems = this.boss_list.length;
        this.viewNode.taglist.selectedIndex = item.data.stage - 1
        this.flushPannel()
    }

    private onRenderTagItem(index: number, item: ChiefBtnTag) {
        item.SetData(this.TagCfg[index]);
    }

    private onRenderBossItem(index: number, item: ChiefBossCell) {
        item.SetData(this.boss_list[index]);
    }

    private ClickOneKey() {
        let param = DungeonData.Inst().GetChiefQuickMop(this.viewNode.taglist.selectedIndex + 1);
        if (param.last_time == 0) {
            PublicPopupCtrl.Inst().Center(Language.Dungeon.OneKeyLack);
            return
        }

        ViewManager.Inst().OpenView(ChiefDungeonMopView, param)

        // DungeonData.Inst().testred()
        // DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.QuickMop,this.viewNode.taglist.selectedIndex)
    }
}

// BossCell
export class ChiefBossCell extends fgui.GComponent {
    private viewNode = {
        CostImage: <fgui.GLoader>null,
        Cost: <fgui.GGroup>null,
        Name: <fgui.GLabel>null,
        Num: <fgui.GLabel>null,
        YiJiBai: <fgui.GImage>null,
        YiTiaoZhan: <fgui.GImage>null,
        BtnFreeMop: <fgui.GButton>null,
        BtnMop: <fgui.GButton>null,
        BtnChallenge: <fgui.GButton>null,
        LastNum: <fgui.GLabel>null,
        LevelNeed: <fgui.GLabel>null,
        RewardList: <fgui.GList>null,
        RedPoint: <RedPoint>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnChallenge.onClick(this.ClickChallenge.bind(this));
        this.viewNode.BtnFreeMop.onClick(this.ClickMop.bind(this));
        this.viewNode.BtnMop.onClick(this.ClickMop.bind(this));
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.GoldIcon(this.viewNode.CostImage, CommonId.Diamond)
        // UH.SpriteName(this.viewNode.CostImage,"Dungeon","jkj");
        UH.SetText(this.viewNode.Num, data.cost_num);

        UH.SetText(this.viewNode.Name, data.name);

        this.viewNode.RewardList.itemRenderer = this.onRenderRewardItem.bind(this);
        this.viewNode.RewardList.numItems = data.reward_show.length;
        // this.viewNode.YiJiBai.visible = data.is_complete // && !data.show_saodang
        this.viewNode.YiTiaoZhan.visible = data.is_complete // && !data.show_saodang
        UH.SetText(this.viewNode.LastNum,
            TextHelper.Format(Language.Dungeon.LastTime, TextHelper.ColorStr(data.last_num, data.last_color)));

        UH.SetText(this.viewNode.LevelNeed,
            TextHelper.Format(Language.Dungeon.LevelNeed, data.unlock_level));

        // this.viewNode.LastNum.visible = data.is_complete && data.show_saodang;
        this.viewNode.Cost.visible = !data.is_free && data.is_complete && data.show_saodang && data.last_num > 0
        // this.viewNode.BtnFreeMop.visible = data.is_free && data.is_complete && data.show_saodang;
        // this.viewNode.BtnMop.visible = !data.is_free && data.is_complete && data.show_saodang;
        // this.viewNode.BtnMop.grayed = data.last_num == 0

        this.viewNode.BtnChallenge.visible = !data.is_complete;
        this.viewNode.LevelNeed.visible = RoleData.Inst().GetRoleLevel() < this.data.unlock_level

        this.viewNode.BtnChallenge.grayed = !data.is_canchallenge
        // this.viewNode.RedPoint.SetNum(data.show_saodang && data.is_complete && data.last_num > 0 ? 1 : 0)
    }

    private onRenderRewardItem(index: number, item: ItemCell) {
        item.SetData(Item.Create({ item_id: this.data.reward_show[index].item_id, num: this.data.reward_show[index].num }, { is_num: true }));//);
    }

    private ClickMop() {
        let reward_list = []

        for (const info of this.data.reward_show) {
            let vo = {
                item_id: info.item_id,
                num: info.num,
            }
            reward_list.push(vo)
        }
        ViewManager.Inst().OpenView(ChiefDungeonMopView, {
            item_list: reward_list,
            last_time: this.data.last_num,
            is_free: this.data.is_free,
            cost_num: this.data.cost_num,
            param_seq: this.data.stage,
            count: 1,
            is_quick: false,
            name: TextHelper.Format(Language.Dungeon.MopSureTitle, this.data.name),
        })
        // DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Mop,this.data.seq)
    }

    private ClickChallenge() {
        if (RoleData.Inst().GetRoleLevel() < this.data.unlock_level) {
            PublicPopupCtrl.Inst().Center(Language.Dungeon.LevelLack);
            return
        }

        if (!this.data.is_canchallenge) {
            PublicPopupCtrl.Inst().Center(Language.Dungeon.PassLack);
            return
        }

        DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Fight, this.data.stage, 0)
    }
}


// BossCell
export class ChiefBtnTag extends fgui.GButton {
    private viewNode = {
        Name: <fgui.GLabel>null,
        SelectName: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.Name, data.name);
        UH.SetText(this.viewNode.SelectName, data.name);

        this.InitGuide()

        let list = DungeonData.Inst().GetChiefDungeonList(data.stage)
        this.viewNode.RedPoint.SetNum(0)
        for (var index in list) {
            if (list[index].show_saodang && list[index].is_complete && list[index].last_num > 0) {
                // this.viewNode.RedPoint.SetNum(1)
                break
            }
        }
    }
    public onDestroy() {
        if (this.data.stage == 1) {
            GuideCtrl.Inst().ClearGuideUi("ChiefDungeonTag0");
        }
        else if (this.data.stage == 2) {
            GuideCtrl.Inst().ClearGuideUi("ChiefDungeonTag1");
        }
        else if (this.data.stage == 3) {
            GuideCtrl.Inst().ClearGuideUi("ChiefDungeonTag2");
        }

        super.onDestroy();
    }

    public InitGuide() {
        if (this.data.stage == 1) {
            GuideCtrl.Inst().AddGuideUi("ChiefDungeonTag0", this);
        }
        else if (this.data.stage == 2) {
            GuideCtrl.Inst().AddGuideUi("ChiefDungeonTag1", this);
        }
        else if (this.data.stage == 3) {
            GuideCtrl.Inst().AddGuideUi("ChiefDungeonTag2", this);
        }
    }
}
