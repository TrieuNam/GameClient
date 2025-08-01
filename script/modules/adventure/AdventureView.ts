import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2_2 } from "modules/common_board/CommonBoard2";
import { CommonButton } from "modules/extends/CommonButton";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { MingXiangView } from "modules/MingXiang/MingXiangView";
import { SpineObjDirX } from "modules/scene_obj_spine/ObjSpineConfig";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { AdventureCtrl, ADVENTURE_OP_TYPE } from "./AdventureCtrl";
import { AdventureData } from "./AdventureData";


@BaseView.registView
export class AdventureView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Adventure",
        ViewName: "AdventureView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2_2>null,
        GpChallengeEnd: <fgui.GGroup>null,
        GpChallenge: <fgui.GGroup>null,
        TxtChapterTip: <fgui.GRichTextField>null,
        ListChapterReward: <fgui.GList>null,
        ListThroughReward: <fgui.GList>null,
        BtnChallenge: <fgui.GButton>null,
        TxtLvTitle: <fgui.GRichTextField>null,
        BtnReceive: <fgui.GButton>null,
        GpChapterEnd: <fgui.GGroup>null,
        GpChapter: <fgui.GGroup>null,
        RedChapter: <RedPoint>null,
        uiModelShow: <UIModelShow>null,
        Bg1: <fgui.GImage>null,
        Bg2: <fgui.GImage>null,
        TxtBox: <fgui.GRichTextField>null,
        BtnMingXiang: <CommonButton>null,
    }
    protected extendsCfg = [
        { ResName: "ButtonMingXiang", ExtendsClass: CommonButton },
    ];

    private adventure_data: AdventureData;
    private through_reward_data: any[];
    private chapter_reward_data: any[];
    private language = Language.Adventure;
    InitData() {
        let self = this;
        self.adventure_data = AdventureData.Inst();
    }

    InitUI() {
        let self = this;
        self.viewNode.Board.SetData(new BoardData(AdventureView));
        this.viewNode.Board.addChildAt(this.viewNode.Bg1, 1)
        this.viewNode.Board.addChildAt(this.viewNode.Bg2, 2)
        self.viewNode.BtnChallenge.onClick(self.OnChallenge.bind(self));
        self.viewNode.BtnReceive.onClick(self.OnReceive.bind(self));
        self.viewNode.BtnMingXiang.onClick(self.OnMingXiang.bind(self));
        self.viewNode.ListThroughReward.itemRenderer = self.renderListItem.bind(this);
        self.viewNode.ListChapterReward.itemRenderer = self.renderChapterListItem.bind(this);
        this.AddSmartDataCare(self.adventure_data.ResultData, self.FlushAll.bind(self), "main_fb_info");
        self.FlushAll();
    }

    private timer_hadle:any;
    private FlushAll() {
        if (BattleCtrl.Inst().check(this, this.FlushAll.bind(this))) {
            return
        }
        let self = this;
        self.viewNode.BtnChallenge.touchable = true;
        let cfg_lv = self.adventure_data.GetCurLvCfg();
        this.viewNode.uiModelShow.setPath(ResPath.Npc(cfg_lv.res_id), undefined, SpineObjDirX.RIGHT);
        if (self.adventure_data.IsMaxLevel()) {
            self.viewNode.GpChallengeEnd.visible = true;
            self.viewNode.GpChallenge.visible = false;
        } else {
            self.viewNode.GpChallengeEnd.visible = false;
            self.viewNode.GpChallenge.visible = true;
            UH.SetText(self.viewNode.TxtLvTitle, TextHelper.RichTextOutLine(self.language.level + cfg_lv.name, COLORSTR.Yellow2, 2));
            self.through_reward_data = Item.DefaultCreateListItem(cfg_lv.win);
            self.viewNode.ListThroughReward.visible=false;
            self.viewNode.ListThroughReward.numItems = self.through_reward_data.length;
            Timer.Inst().CancelTimer(this.timer_hadle);
            Timer.Inst().AddRunFrameTimer(()=>{
                self.viewNode.ListThroughReward.visible = true;
            },3,1,false);
        }
        let cfg_chapter = self.adventure_data.GetCurChapterCfg();
        if (cfg_chapter) {
            self.viewNode.BtnReceive.visible = self.adventure_data.ResultData.main_fb_info.level >= cfg_chapter.clearance_condition;
            self.viewNode.GpChapterEnd.visible = false;
            self.viewNode.GpChapter.visible = true;
            self.chapter_reward_data = Item.DefaultCreateListItem(cfg_chapter.win);
            self.viewNode.ListChapterReward.numItems = self.chapter_reward_data.length
            UH.SetText(self.viewNode.TxtChapterTip, TextHelper.Format(self.language.tip, TextHelper.ColorStr(cfg_chapter.chapter, COLORSTR.White)));
        } else {
            self.viewNode.GpChapterEnd.visible = true;
            self.viewNode.GpChapter.visible = false;
        }
        self.viewNode.RedChapter.SetNum(self.adventure_data.GetChapterRed());
        this.FlushMingXiang();
    }

    //冥想收益
    public FlushMingXiang(){
        let cfg = this.adventure_data.GetCurLvCfg();
        if(cfg){
            let desc = TextHelper.Format(this.language.CurBox, cfg.now_box);
            let  next_lv_name=this.adventure_data.GetNextMingXiangLevelName();
            if (next_lv_name){
                desc += TextHelper.RichTextImg("Adventure", "JianTou");
                desc += TextHelper.Format(this.language.NextBox, cfg.next_show,next_lv_name);
            }
            UH.SetText(this.viewNode.TxtBox, desc)
        }
        this.viewNode.BtnMingXiang.visible = this.adventure_data.IsMingXiangStart();
        this.viewNode.BtnMingXiang.ShowRedPoint(this.adventure_data.GetMingXiangRed()==1);
    }

    private renderListItem(index: number, item: ItemCell) {
        let self = this;
        item.SetData(self.through_reward_data[index]);
    }

    private renderChapterListItem(index: number, item: ItemCell) {
        let self = this;
        item.SetData(self.chapter_reward_data[index]);
    }

    private OnChallenge() {
        this.viewNode.BtnChallenge.touchable = false;
        this.adventure_data.CheckCloseAdventure();
        AdventureCtrl.Inst().SendAdventureReq(ADVENTURE_OP_TYPE.CHALLENGE);
    }

    private OnReceive() {
        AdventureCtrl.Inst().SendAdventureReq(ADVENTURE_OP_TYPE.RECEIVE)
    }

    private OnMingXiang(){
        ViewManager.Inst().OpenView(MingXiangView);
    }

    protected onDestroy() {
        Timer.Inst().CancelTimer(this.timer_hadle);
    }
    CloseCallBack() {
        GuideCtrl.Inst().ForceStop();
    }
}

