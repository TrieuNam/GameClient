import { Singleton } from "core/Singleton";
import { AffordPresentCtrl } from "modules/AffordPresent/AffordPresentCtrl";
import { AngelCtrl } from "modules/Angel/AngelCtrl";
import { AngelFesCtrl } from "modules/AngelFes/AngelFesCtrl";
import { AnnounceCtrl } from "modules/Announce/AnnounceCtrl";
import { ArenaCtrl } from "modules/Arena/ArenaCtrl";
import { ClothShopCtrl } from "modules/ClothShop/ClothShopCtrl";
import { CommodityGuildCtrl } from "modules/CommodityGuild/CommodityGuildCtrl";
import { ContinuePresentCtrl } from "modules/ContinuePresent/ContinuePresentCtrl";
import { CoreCrisisCtrl } from "modules/CoreCrisis/CoreCrisisCtrl";
import { DailyGiftCtrl } from "modules/DailyGift/DailyGiftCtrl";
import { EnchantCtrl } from "modules/Enchant/EnchantCtrl";
import { EquipBagCtrl } from "modules/EquipBag/EquipBagCtrl";
import { ExclusiveGiftBagCtrl } from "modules/ExclusiveGiftBag/ExclusiveGiftBagCtrl";
import { LuckyGiftCtrl } from "modules/LuckyGift.ts/LuckyGiftCtrl";
import { ManualCtrl } from "modules/Manual/ManualCtrl";
import { MonthlyCardCtrl } from "modules/MonthlyCard/MonthlyCardCtrl";
import { OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { PeakArenaCtrl } from "modules/PeakArena/PeakArenaCtrl";
import { PetCtrl } from "modules/Pet/PetCtrl";
import { PetGuardCtrl } from "modules/PetGuard/PetGuardCtrl";
import { ScoreFundCtrl } from "modules/ScoreFund/ScoreFundCtrl";
import { ShenQiDrawCtrl } from "modules/ShenQiDraw/ShenQiDrawCtrl";
import { StarMapFesCtrl } from "modules/StarMapFes/StarMapFesCtrl";
import { TodayShareCtrl } from "modules/TodayShare/TodayShareCtrl";
import { WeekHaoLiCtrl } from "modules/WeekHaoLi/WeekHaoLiCtrl";
import { WeekLianChongCtrl } from "modules/WeekLianChong/WeekLianChongCtrl";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { AdventureCtrl } from "modules/adventure/AdventureCtrl";
import { BagCtrl } from "modules/bag/BagCtrl";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BlockCtrl } from "modules/block/BlockCtrl";
import { BoxCtrl } from "modules/box/BoxCtrl";
import { BoxFundCtrl } from "modules/boxfund/BoxFundCtrl";
import { BoxManorCtrl } from "modules/boxmanor/BoxManorCtrl";
import { CaveLootCtrl } from "modules/caveloot/CaveLootCtrl";
import { BaseCtrl } from "modules/common/BaseCtrl";
import { ModRegister } from "modules/common/ModRegister";
import { DungeonCtrl } from "modules/dungeon/DungeonCtrl";
import { EscortCtrl } from "modules/escort/EscortCtrl";
import { FashionCtrl } from "modules/fashion/FashionCtrl";
import { FirstChargeCtrl } from "modules/first_charge/FirstChargeCtrl";
import { FishCtrl } from "modules/fish/FishCtrl";
import { GemAtelierCtrl } from "modules/gem_atelier/GemAtelierCtrl";
import { GMCmdCtrl } from "modules/gm_command/GMCmdCtrl";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { GuildCtrl } from "modules/guild/GuildCtrl";
import { InscriptionCtrl } from "modules/inscription/InscriptionCtrl";
import { IntegralTurntableCtrl } from "modules/integralTurntable/IntegralTurntableCtrl";
import { InviteFriendCtrl } from "modules/invitefriend/InviteFriendCtrl";
import { ItemRecyclingCtrl } from "modules/item_recycling/ItemRecyclingCtrl";
import { KnightCardCtrl } from "modules/knight_card/KnightCardCtrl";
import { LeiChongYouLiCtrl } from "modules/lei_chong/LeiChongYouLi/LeiChongYouLiCtrl";
import { ShouChongDingZhiCtrl } from "modules/lei_chong/ShouChongDingZhi/ShouChongDingZhiCtrl";
import { TianXuanZhiLiCtrl } from "modules/lei_chong/TianXuanZhiLi/TianXuanZhiLiCtrl";
import { LevelFundCtrl } from "modules/levelfund/LevelFundCtrl";
import { LoginCtrl } from "modules/login/LoginCtrl";
import { LoopMineCtrl } from "modules/loopmine/LoopMineCtrl";
import { MerlinMagicCtrl } from "modules/merlin_magic_scrolls/MerlinMagicCtrl";
import { MoreServerActivityCtrl } from "modules/moreserveractive/MoreServerActivityCtrl";
import { MountCtrl } from "modules/mount/MountCtrl";
import { NewServerCompetitionCtrl } from "modules/new_server_competition/NewServerCompetitionCtrl";
import { OpenServerCtrl } from "modules/open_server/OpenServerCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RechargeCtrl } from "modules/recharge/RechargeCtrl";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { ServerActivityCtrl } from "modules/serveractivity/ServerActivityCtrl";
import { ShenQiCtrl } from "modules/shenqi/ShenQiCtrl";
import { ShopCtrl } from "modules/shop/ShopCtrl";
import SkillCtrl from "modules/skill/SkillCtrl";
import { MysteryShopCtrl } from "modules/shop/mystery_shop/MysteryShopCtrl";
import { StarMapCtrl } from "modules/star_map/StarMapCtrl";
import { TaskCtrl } from "modules/task/TaskCtrl";
import { TerritoryCtrl } from "modules/territory/TerritoryCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TrialCtrl } from "modules/trial/TrialCtrl";
import { WarOrderCtrl } from "modules/warOrder/WarOrderCtrl";
import { WeekendRechargeCtrl } from "modules/weekendrecharge/WeekendRechargeCtrl";

export class CtrlManager extends Singleton {
    private ctrl_list: Array<BaseCtrl>;
    public Init() {
        this.ctrl_list = new Array();
        this.createCtrls()
        this.onInitCtrls()
    }

    private createCtrls() {
        this.ctrl_list.push(ModRegister.Inst());
        this.ctrl_list.push(FunOpen.Inst());
        this.ctrl_list.push(LoginCtrl.Inst());
        this.ctrl_list.push(BattleCtrl.Inst());
        // this.ctrl_list.push(SceneCtrl.Inst());
        this.ctrl_list.push(GMCmdCtrl.Inst());
        this.ctrl_list.push(TimeCtrl.Inst());
        this.ctrl_list.push(PublicPopupCtrl.Inst());
        this.ctrl_list.push(BoxCtrl.Inst());
        this.ctrl_list.push(RoleCtrl.Inst());
        this.ctrl_list.push(AdventureCtrl.Inst());
        this.ctrl_list.push(BagCtrl.Inst());
        this.ctrl_list.push(ShopCtrl.Inst());
        this.ctrl_list.push(SkillCtrl.Inst());
        this.ctrl_list.push(ManualCtrl.Inst());
        this.ctrl_list.push(DungeonCtrl.Inst());
        this.ctrl_list.push(MountCtrl.Inst());
        this.ctrl_list.push(MysteryShopCtrl.Inst());
        this.ctrl_list.push(AngelCtrl.Inst());
        this.ctrl_list.push(TrialCtrl.Inst());
        this.ctrl_list.push(GuideCtrl.Inst());
        this.ctrl_list.push(FishCtrl.Inst());
        this.ctrl_list.push(ShenQiCtrl.Inst());
        this.ctrl_list.push(BlockCtrl.Inst());
        this.ctrl_list.push(RankCtrl.Inst());
        this.ctrl_list.push(TaskCtrl.Inst());
        this.ctrl_list.push(GuildCtrl.Inst());
        this.ctrl_list.push(ArenaCtrl.Inst());
        this.ctrl_list.push(StarMapCtrl.Inst());
        this.ctrl_list.push(BoxFundCtrl.Inst())
        this.ctrl_list.push(LevelFundCtrl.Inst())
        this.ctrl_list.push(ActivityCtrl.Inst());
        this.ctrl_list.push(CommodityGuildCtrl.Inst());
        this.ctrl_list.push(PetCtrl.Inst());
        this.ctrl_list.push(RechargeCtrl.Inst());
        this.ctrl_list.push(GemAtelierCtrl.Inst());
        this.ctrl_list.push(EscortCtrl.Inst());
        this.ctrl_list.push(LoopMineCtrl.Inst());
        this.ctrl_list.push(CaveLootCtrl.Inst());
        this.ctrl_list.push(WeekendRechargeCtrl.Inst());
        this.ctrl_list.push(ExclusiveGiftBagCtrl.Inst());
        this.ctrl_list.push(IntegralTurntableCtrl.Inst());
        this.ctrl_list.push(ClothShopCtrl.Inst());
        this.ctrl_list.push(ServerActivityCtrl.Inst());
        this.ctrl_list.push(OpenServerCtrl.Inst());
        this.ctrl_list.push(InviteFriendCtrl.Inst());
        this.ctrl_list.push(FirstChargeCtrl.Inst());
        this.ctrl_list.push(BoxManorCtrl.Inst());
        this.ctrl_list.push(FashionCtrl.Inst());
        this.ctrl_list.push(LeiChongYouLiCtrl.Inst());
        this.ctrl_list.push(MoreServerActivityCtrl.Inst());
        this.ctrl_list.push(LuckyGiftCtrl.Inst());
        this.ctrl_list.push(DailyGiftCtrl.Inst());
        this.ctrl_list.push(MonthlyCardCtrl.Inst());
        this.ctrl_list.push(OtherRoleCtrl.Inst());
        this.ctrl_list.push(EquipBagCtrl.Inst());
        this.ctrl_list.push(AnnounceCtrl.Inst());
        this.ctrl_list.push(TodayShareCtrl.Inst());
        this.ctrl_list.push(ScoreFundCtrl.Inst());
        this.ctrl_list.push(InscriptionCtrl.Inst());
        this.ctrl_list.push(AngelFesCtrl.Inst());
        this.ctrl_list.push(StarMapFesCtrl.Inst());
        this.ctrl_list.push(WeekHaoLiCtrl.Inst());
        this.ctrl_list.push(AffordPresentCtrl.Inst());
        this.ctrl_list.push(ContinuePresentCtrl.Inst());
        this.ctrl_list.push(NewServerCompetitionCtrl.Inst());
        this.ctrl_list.push(KnightCardCtrl.Inst());
        this.ctrl_list.push(TerritoryCtrl.Inst());
        this.ctrl_list.push(WarOrderCtrl.Inst())
        this.ctrl_list.push(WeekLianChongCtrl.Inst())
        this.ctrl_list.push(EnchantCtrl.Inst())
        this.ctrl_list.push(PeakArenaCtrl.Inst())
        this.ctrl_list.push(CoreCrisisCtrl.Inst())
        this.ctrl_list.push(ItemRecyclingCtrl.Inst())
        this.ctrl_list.push(PetGuardCtrl.Inst())
        this.ctrl_list.push(ShenQiDrawCtrl.Inst())
        this.ctrl_list.push(TianXuanZhiLiCtrl.Inst())
        this.ctrl_list.push(MerlinMagicCtrl.Inst())
        this.ctrl_list.push(ShouChongDingZhiCtrl.Inst())
    }

    private onInitCtrls() {
        for (let index = 0; index < this.ctrl_list.length; index++) {
            const _ctrl = this.ctrl_list[index];
            _ctrl.OnInit()
        }
    }
}    
