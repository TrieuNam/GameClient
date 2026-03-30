
import { AngelView } from 'modules/Angel/AngelView';
import { ArenaRankView } from 'modules/Arena/ArenaRankView';
import { BoxDrawView } from 'modules/BoxDraw/BoxDrawView';
import { ClothShopView } from 'modules/ClothShop/ClothShopView';
import { ExclusiveGiftBagView } from 'modules/ExclusiveGiftBag/ExclusiveGiftBagView';
import { LuckyGiftView } from 'modules/LuckyGift.ts/LuckyGiftView';
import { ManualView } from 'modules/Manual/ManualView';
import { ArenaEnterView } from 'modules/PeakArena/ArenaEnter';
import { PeakArenaRankView } from 'modules/PeakArena/PeakArenaRankView';
import { PetGuardView } from 'modules/PetGuard/PetGuardView';
import { AdventureView } from 'modules/adventure/AdventureView';
import { BlockShopView } from 'modules/block/BlockShopView';
import { BlockView } from 'modules/block/BlockView';
import { ChiefDungeonView } from 'modules/dungeon/ChiefDungeonView';
import { DungeonEnterView } from 'modules/dungeon/DungeonEnterView';
import { EscortView } from 'modules/escort/EscortView';
import { FashionView } from 'modules/fashion/FashionView';
import { FirstChargeView } from 'modules/first_charge/FirstChargeView';
import { FishView } from 'modules/fish/FishView';
import { FriendsRankView } from 'modules/friends_rank/FriendsRankView';
import { GemAtelierMainView } from 'modules/gem_atelier/GemAtelierMainView';
import { GuildView } from 'modules/guild/GuildView';
import { InscriptionTowerView } from 'modules/inscription/InscriptionTowerView';
import { InscriptionView } from 'modules/inscription/InscriptionView';
import { ItemRecycling } from 'modules/item_recycling/ItemRecycling';
import { KnightCardView } from 'modules/knight_card/KnightCardView';
import { LeiChongView } from 'modules/lei_chong/LeiChongView';
import { LoopMineView } from 'modules/loopmine/LoopMineView';
import { MainView } from 'modules/main/MainView';
import { MainOtherView } from 'modules/main_other/MainOtherView';
import { MoreServerActivityView } from 'modules/moreserveractive/MoreServerActivityView';
import { MountMainView } from 'modules/mount/MountMainView';
import { ShenQiView } from 'modules/shenqi/ShenQiView';
import { ShopView } from 'modules/shop/ShopView';
import { SkillView } from 'modules/skill/SkillView';
import { MysteryShopView } from 'modules/shop/mystery_shop/MysteryShopView';
import { StarMapMainView } from 'modules/star_map/StarMapMainView';
import { TerritoryView } from 'modules/territory/TerritoryView';
import { GuMoView } from 'modules/trial/GuMoView';
import { TrialView } from 'modules/trial/TrialView';
import { BaseCtrl, regMod } from './BaseCtrl';
import { Mod } from './ModuleDefine';

export class ModRegister extends BaseCtrl {
    ModCfg(): regMod[] {
        return [
            { modKey: Mod.Trial.View, vClass: TrialView },                    //试炼
            { modKey: Mod.GuMo.View, vClass: GuMoView },                    //锢魔之塔
            { modKey: Mod.Shop.View, vClass: ShopView },
            { modKey: Mod.Shop.GoldShop, vClass: ShopView },
            { modKey: Mod.Shop.DiamondShop, vClass: ShopView },
            { modKey: Mod.LoopMine.View, vClass: LoopMineView },
            { modKey: Mod.FirstCharge.View, vClass: FirstChargeView },
            { modKey: Mod.LeiChong.View, vClass: LeiChongView },
            { modKey: Mod.LuckyGift.View, vClass: LuckyGiftView },
            { modKey: Mod.ExclusiveGiftBag.View, vClass: ExclusiveGiftBagView },
            { modKey: Mod.ClothShopView.View, vClass: ClothShopView },
            { modKey: Mod.ClothShopView.MountShop, vClass: ClothShopView },
            { modKey: Mod.ClothShopView.AngelShop, vClass: ClothShopView },
            { modKey: Mod.ClothShopView.PetShop, vClass: ClothShopView },
            { modKey: Mod.Fashion.View, vClass: FashionView },
            { modKey: Mod.Adventure.View, vClass: AdventureView },
            { modKey: Mod.MysteryShopView.View, vClass: MysteryShopView },
            { modKey: Mod.GemAtelier.View, vClass: GemAtelierMainView },
            { modKey: Mod.Arena.View, vClass: ArenaRankView },
            { modKey: Mod.PeakArena.Main, vClass: PeakArenaRankView },
            { modKey: Mod.Other.Manual, vClass: ManualView },
            { modKey: Mod.Other.View, vClass: MainOtherView },
            { modKey: Mod.Angel.View, vClass: AngelView },
            { modKey: Mod.StarMap.View, vClass: StarMapMainView },
            { modKey: Mod.Escort.View, vClass: EscortView },
            { modKey: Mod.Trial.TrialShop, vClass: ShopView },
            { modKey: Mod.Mount.View, vClass: MountMainView },
            { modKey: Mod.Chief.View, vClass: ChiefDungeonView },
            { modKey: Mod.Chief.gold, vClass: ChiefDungeonView },
            { modKey: Mod.Chief.mount, vClass: ChiefDungeonView },
            { modKey: Mod.Dungeon.View, vClass: DungeonEnterView },
            { modKey: Mod.Fish.View, vClass: FishView },
            { modKey: Mod.ShenQi.Main, vClass: ShenQiView },
            { modKey: Mod.Block.View, vClass: BlockView },
            { modKey: Mod.BlockShop.View, vClass: BlockShopView },
            { modKey: Mod.Skill.View, vClass: SkillView },
            { modKey: Mod.Inscription.Main, vClass: InscriptionView },
            { modKey: Mod.FriendsRank.Main, vClass: FriendsRankView },
            { modKey: Mod.Territory.Main, vClass: TerritoryView },
            { modKey: Mod.KnightCard.Main, vClass: KnightCardView },
            { modKey: Mod.ArenaEnter.Main, vClass: ArenaEnterView },
            { modKey: Mod.ItemRecycling.Main, vClass: ItemRecycling },
            { modKey: Mod.Main.View, vClass: MainView },
            { modKey: Mod.PetGuard.Main, vClass: PetGuardView },
            { modKey: Mod.Guild.Main, vClass: GuildView },
            { modKey: Mod.MoreServer.view, vClass: MoreServerActivityView },
            { modKey: Mod.Pet.PetBox, vClass: BoxDrawView },
            { modKey: Mod.InscriptionTower.Main, vClass: InscriptionTowerView, },
        ]
    }
}


