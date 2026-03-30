import { MsgId } from "core/net/MsgIdRegister";
import { Singleton } from "core/Singleton";

export class MsgIdManger extends Singleton {
    public Init() {
        // //msgserver
        MsgId.RegisterMsg(1003, PB_SCHeartbeatResp);
        MsgId.RegisterMsg(1053, PB_CSHeartbeatReq);
        MsgId.RegisterMsg(9000, PB_SCTimeAck);
        MsgId.RegisterMsg(9001, PB_SCDisconnectNotice);
        MsgId.RegisterMsg(9050, PB_CSTimeReq);

        // //msglogin
        MsgId.RegisterMsg(7000, PB_SCLoginToAccount);
        MsgId.RegisterMsg(7056, PB_CSLoginToAccount);

        // //msgrole
        MsgId.RegisterMsg(1400, PB_SCRoleInfoAck);
        MsgId.RegisterMsg(1401, PB_SCRoleAttrList);
        MsgId.RegisterMsg(1402, PB_SCRoleExpChange);
        MsgId.RegisterMsg(1403, PB_SCRoleLevelChange);
        // MsgId.RegisterMsg(1401, PB_SCMoney);            //货币信息
        // MsgId.RegisterMsg(1404, PB_SCRoleExpChange);    //经验改变通知
        MsgId.RegisterMsg(1405, PB_CSRoleWXInfoSetReq);  //外部头像和名字设置
        // MsgId.RegisterMsg(1402, PB_SCRoleAttrList);
        // MsgId.RegisterMsg(1408, PB_SCRoleSpeedChangeNotice);
        MsgId.RegisterMsg(1470, PB_CSRoleSkillOperaReq);
        MsgId.RegisterMsg(1471, PB_SCRoleSkillAllInfo);
        MsgId.RegisterMsg(1480, PB_CSRoleTalentOperaReq);
        MsgId.RegisterMsg(1481, PB_SCRoleTalentAllInfo);
        // MsgId.RegisterMsg(2036, PB_SCAttrListReason);
        // MsgId.RegisterMsg(2037, PB_CSAttrListReasonReq);
        // MsgId.RegisterMsg(1054, PB_CSRoleResetBaseReq);
        // MsgId.RegisterMsg(1005, PB_SCRoleCreatResetInfo);
        // MsgId.RegisterMsg(7153, PB_CSGetRandNameStrIDReq);
        // MsgId.RegisterMsg(7154, PB_SCGetRandNameStrIDRet);
        MsgId.RegisterMsg(1451, PB_CSFetchTaskRewardReq);
        MsgId.RegisterMsg(1452, PB_SCTaskProgressInfo);
        MsgId.RegisterMsg(1460, PB_CSRoleSystemSetReq);
        MsgId.RegisterMsg(1461, PB_SCRoleSystemSetInfo);

        MsgId.RegisterMsg(1464, PB_CSNoticeTimeReq);
        MsgId.RegisterMsg(1465, PB_SCNoticeTimeRet);
        MsgId.RegisterMsg(1466, PB_SCCmdToClientCmd);
        MsgId.RegisterMsg(1467, PB_CSLimitCoreReq);
        MsgId.RegisterMsg(1468, PB_SCLimitCoreInfo);


        // //msgscene
        // MsgId.RegisterMsg(1100,PB_SCEnterScene);
        // MsgId.RegisterMsg(1101,PB_SCLeaveScene);
        // MsgId.RegisterMsg(1102,PB_SCVisibleObjEnterRole);
        // MsgId.RegisterMsg(1112,PB_SCChangeAppearanceRole);
        // MsgId.RegisterMsg(1109,PB_SCVisibleObjEnterNPCMonster);
        // MsgId.RegisterMsg(1110,PB_SCVisibleObjEnterNPCGathers);
        // MsgId.RegisterMsg(1103,PB_SCVisibleObjLeave);
        // MsgId.RegisterMsg(1150,PB_CSObjMove);
        // MsgId.RegisterMsg(1104,PB_SCObjMove);
        // MsgId.RegisterMsg(1105,PB_SCResetPost);
        // MsgId.RegisterMsg(1106,PB_SCChangeSceneNotice);
        // MsgId.RegisterMsg(1107,PB_CSEnterFB);
        // MsgId.RegisterMsg(1108,PB_CSLeaveFB);
        // MsgId.RegisterMsg(1116,PB_SCSceneObjList);

        // //msgknapsack
        MsgId.RegisterMsg(1500, PB_CSKnapsackReq);
        MsgId.RegisterMsg(1501, PB_CSBuyCmdReq);
        MsgId.RegisterMsg(1505, PB_SCKnapsackAllInfo);
        MsgId.RegisterMsg(1506, PB_SCKnapsackSingleInfo);
        MsgId.RegisterMsg(1509, PB_SCAllShiZhuangInfo);
        MsgId.RegisterMsg(1510, PB_SCShiZhuangInfo);

        MsgId.RegisterMsg(1600, PB_CSEquipReq);
        MsgId.RegisterMsg(1607, PB_SCEquipBagListInfo);
        MsgId.RegisterMsg(1608, PB_SCEquipBagOneInfo);
        MsgId.RegisterMsg(1605, PB_SCEquipListInfo);
        MsgId.RegisterMsg(1606, PB_SCEquipOneInfo);
        MsgId.RegisterMsg(1507, PB_SCGetItemNotice);
        MsgId.RegisterMsg(1504, PB_SCItemNotEnoughNotice);

        //GM命令
        MsgId.RegisterMsg(2001, PB_CSGMCommand);
        MsgId.RegisterMsg(2000, PB_SCGMCommand);

        // //msgbattle
        // MsgId.RegisterMsg(11601,PB_CSBattleFightMonsterReq);
        // MsgId.RegisterMsg(11001,PB_SCBattleStartInfo);
        // MsgId.RegisterMsg(11002,PB_SCBattleRoundInfo);
        // MsgId.RegisterMsg(11003,PB_SCBattleReport);

        // //msgguaji
        // MsgId.RegisterMsg(2002, PB_CSGuaJiReq);
        // MsgId.RegisterMsg(2003, PB_SCGuaJiInfo);

        // //msgsystem
        MsgId.RegisterMsg(700, PB_SCNoticeNum);
        // MsgId.RegisterMsg(701,PB_SCSystemMsg);
        // MsgId.RegisterMsg(702,PB_SCZeroHour);
        // MsgId.RegisterMsg(704,PB_SCCMDChongZhiRetInfo);

        // //msgmainfb
        // MsgId.RegisterMsg(2005, PB_CSMainFbReq);
        // MsgId.RegisterMsg(2006, PB_SCMainFbInfo);


        //msgmail
        MsgId.RegisterMsg(9501, PB_SCMailDeleteAck);
        MsgId.RegisterMsg(9504, PB_SCMailListAck);
        MsgId.RegisterMsg(9505, PB_SCMailDetail);
        MsgId.RegisterMsg(9506, PB_SCFetchMailAck);
        MsgId.RegisterMsg(9551, PB_CSMailReq);
        MsgId.RegisterMsg(1662, PB_SCAdvertisementInfo);

        // //msgrewardlist
        // MsgId.RegisterMsg(1550, PB_SCRewardList);

        // MsgId.RegisterMsg(2008, PB_CSStrengthenReq);
        // MsgId.RegisterMsg(2009, PB_SCStrengthenInfo);
        // MsgId.RegisterMsg(2010, PB_SCStrengthenChangeInfo);
        // MsgId.RegisterMsg(2011, PB_SCStrengthenMasterChangeInfo);
        // MsgId.RegisterMsg(2015, PB_CSForgeReq);
        // MsgId.RegisterMsg(2016, PB_SCGemInfo);

        // //msg JinJie
        // MsgId.RegisterMsg(1651, PB_CSMountReq);
        // MsgId.RegisterMsg(1652, PB_SCMountInfo);
        // MsgId.RegisterMsg(1653, PB_SCMountImageInfo);
        // MsgId.RegisterMsg(1654, PB_SCMountSkinInfo);
        // MsgId.RegisterMsg(1656, PB_CSUpGradeRewardReq);
        // MsgId.RegisterMsg(1657, PB_SCUpGradeRewardInfo);

        // //msgpet
        MsgId.RegisterMsg(2107, PB_SCPetRemainsList);


        //msgmainfb
        MsgId.RegisterMsg(2005, PB_CSMainFbReq);
        MsgId.RegisterMsg(2006, PB_SCMainFbInfo);

        //msg battle
        MsgId.RegisterMsg(11003, PB_SCBattleReport);

        //msg box
        MsgId.RegisterMsg(1610, PB_CSBoxReq);
        MsgId.RegisterMsg(1611, PB_CSBoxSetReq);
        MsgId.RegisterMsg(1615, PB_SCBoxEquipInfo);
        MsgId.RegisterMsg(1616, PB_SCBoxInfo);
        MsgId.RegisterMsg(1617, PB_SCBoxSetingInfo);
        MsgId.RegisterMsg(1618, PB_SCBoxSellInfo);

        //msg shop
        MsgId.RegisterMsg(1620, PB_CSShopBuyReq);
        MsgId.RegisterMsg(1621, PB_SCShopInfo);
        MsgId.RegisterMsg(1622, PB_CSClothShopBuyReq);

        //msg qishi
        MsgId.RegisterMsg(1625, PB_CSKnightsReq);
        MsgId.RegisterMsg(1626, PB_SCKnightsInfo);
        MsgId.RegisterMsg(1627, PB_SCKnightsConditionInfo);

        //msg lingzhu
        MsgId.RegisterMsg(2008, PB_CSLingZhuReq);
        MsgId.RegisterMsg(2009, PB_SCLingZhuInfo);

        //msg shenmishop
        MsgId.RegisterMsg(1630, PB_CSMysteryShopReq)
        MsgId.RegisterMsg(1631, PB_SCMysteryShopInfo)

        // //msg Gem
        MsgId.RegisterMsg(1660, PB_CSGemReq);
        MsgId.RegisterMsg(1661, PB_SCGemInfo);
        MsgId.RegisterMsg(1666, PB_CSGemOneKeyUpLevelReq);
        MsgId.RegisterMsg(1667, PB_CSGemBuyReq);

        MsgId.RegisterMsg(2140, PB_CSMountReq)
        MsgId.RegisterMsg(2141, PB_SCMountInfo)
        MsgId.RegisterMsg(2142, PB_SCMountOpRet)
        MsgId.RegisterMsg(2143, PB_SCMountHarnessListInfo)
        MsgId.RegisterMsg(2144, PB_SCMountHarnessOneInfo)
        MsgId.RegisterMsg(2145, PB_SCMountHarnessInfo)

        //msg angel
        MsgId.RegisterMsg(2130, PB_CSAngelReq)
        MsgId.RegisterMsg(2131, PB_SCAngelInfo)
        MsgId.RegisterMsg(2132, PB_SCAngelOpRet)

        //msg shilian
        MsgId.RegisterMsg(2120, PB_CSShiLianPagodaReq)
        MsgId.RegisterMsg(2121, PB_SCShiLianPagodaInfo)

        //msg fish
        MsgId.RegisterMsg(1640, PB_CSWaBaoReq)
        MsgId.RegisterMsg(1641, PB_CSWaBaoSetReq)
        MsgId.RegisterMsg(1642, PB_SCWaBaoInfo)
        MsgId.RegisterMsg(1643, PB_SCWaBaoMapInfo)
        MsgId.RegisterMsg(1644, PB_SCWaBaoItemInfo)
        MsgId.RegisterMsg(1645, PB_SCWaBaoIntegrityInfo)
        MsgId.RegisterMsg(1646, PB_SCWaBaoCollectionListInfo)
        MsgId.RegisterMsg(1647, PB_SCWaBaoToolInfo)
        MsgId.RegisterMsg(1648, PB_SCWaBaoTaskInfo)
        MsgId.RegisterMsg(1649, PB_SCWaBaoSetingInfo)
        MsgId.RegisterMsg(1650, PB_SCWaBaoCollectionBookInfo)
        MsgId.RegisterMsg(1651, PB_SCWaBaoBookListInfo)

        //msg shenqi
        MsgId.RegisterMsg(1675, PB_CSShenQiReq)
        MsgId.RegisterMsg(1676, PB_SCShenQiListInfo)
        MsgId.RegisterMsg(1677, PB_SCShenQiOneInfo)
        MsgId.RegisterMsg(1678, PB_SCShenQiOtherInfo)
        MsgId.RegisterMsg(1679, PB_SCShenQiDrawInfo)
        MsgId.RegisterMsg(1680, PB_SCShenQiRecordInfo)

        //guild
        MsgId.RegisterMsg(9640, PB_CSGuildReq)
        MsgId.RegisterMsg(9641, PB_SCGuildSearchList)
        MsgId.RegisterMsg(9642, PB_SCGuildInfo)
        MsgId.RegisterMsg(9643, PB_SCGuildReportList)
        MsgId.RegisterMsg(9644, PB_SCGuildMemberList)
        MsgId.RegisterMsg(9645, PB_SCGuildAppList)
        MsgId.RegisterMsg(9646, PB_SCGuildRoleInfo)

        //block
        MsgId.RegisterMsg(2180, PB_CSBlockReq)
        MsgId.RegisterMsg(2181, PB_SCBuildBlockInfo)

        //msg duobao
        MsgId.RegisterMsg(1655, PB_CSDuoBaoReq)
        MsgId.RegisterMsg(1656, PB_SCDuoBaoInfo)
        MsgId.RegisterMsg(1657, PB_SCDuoBaoItemInfo)
        MsgId.RegisterMsg(1658, PB_SCDuoBaoRecordInfo)

        //msg gumo
        MsgId.RegisterMsg(2122, PB_CSGuMoPagodaReq)
        MsgId.RegisterMsg(2123, PB_SCGuMoPagodaListInfo)
        MsgId.RegisterMsg(2124, PB_SCGuMoPagodaLayerInfo)

        //msg rank
        MsgId.RegisterMsg(9601, PB_SCRankList)
        MsgId.RegisterMsg(9602, PB_CSRankReq)

        //msg Arena
        MsgId.RegisterMsg(9610, PB_CSArenaReq)
        MsgId.RegisterMsg(9611, PB_SCArenaInfo)
        MsgId.RegisterMsg(9612, PB_SCArenaReportList)
        MsgId.RegisterMsg(9613, PB_CSCrossArenaReq)
        MsgId.RegisterMsg(9614, PB_SCCrossArenaInfo)
        MsgId.RegisterMsg(9615, PB_SCCrossArenaReportList)
        MsgId.RegisterMsg(9616, PB_SCCrossArenaFightRet)


        //msg Escort
        MsgId.RegisterMsg(9620, PB_CSEscortReq)
        MsgId.RegisterMsg(9621, PB_SCEscortRet)
        MsgId.RegisterMsg(9622, PB_SCEscortRoleInfo)
        MsgId.RegisterMsg(9623, PB_SCEscortShipListInfo)
        MsgId.RegisterMsg(9624, PB_SCEscortReportListInfo)
        MsgId.RegisterMsg(9625, PB_SCEscortInterceptListInfo)
        MsgId.RegisterMsg(9626, PB_SCEscortShipInfo)

        //msg starmap
        MsgId.RegisterMsg(2150, PB_CSStarMapReq)
        MsgId.RegisterMsg(2151, PB_SCStarMapInfo)
        MsgId.RegisterMsg(2152, PB_SCStarMapOpRet)

        //activity
        MsgId.RegisterMsg(3000, PB_CSRandActivityOperaReq)
        MsgId.RegisterMsg(3001, PB_SCChongZhiInfo)
        MsgId.RegisterMsg(3002, PB_SCChongZhiInfoChange)
        MsgId.RegisterMsg(3003, PB_SCActivityStatus)
        MsgId.RegisterMsg(3004, PB_CSChongZhiConfigReq)
        MsgId.RegisterMsg(3005, PB_SCChongZhiConfigInfo)

        //msg pet
        MsgId.RegisterMsg(2100, PB_CSRolePetReq)
        MsgId.RegisterMsg(2101, PB_SCRolePetAllInfo)
        MsgId.RegisterMsg(2102, PB_SCRolePetSignleInfo)
        MsgId.RegisterMsg(2103, PB_SCRoleTSGemSignleInfo)
        MsgId.RegisterMsg(2104, PB_SCRolePetRetInfo)
        MsgId.RegisterMsg(2105, PB_CSPetOneKeyUpLevelGemReq)
        MsgId.RegisterMsg(2106, PB_SCPetSendEvoAttr)

        //msg pet_graud
        MsgId.RegisterMsg(1690, PB_CSPetFbReq)
        MsgId.RegisterMsg(1691, PB_SCPetFbInfo)

        //msg activity boxfund
        MsgId.RegisterMsg(3010, PB_SCRaBoxFundInfo)
        MsgId.RegisterMsg(3011, PB_SCRaLevelFundInfo)
        MsgId.RegisterMsg(3015, PB_SCRaCommodityGuildInfo)

        //msg activity moreactivity
        MsgId.RegisterMsg(3018, PB_SCRaWeekendRechargeInfo) //周末累充
        MsgId.RegisterMsg(3019, PB_SCRaCaveLootInfo)        //洞穴探宝
        MsgId.RegisterMsg(3020, PB_SCRaFriendInfo)        //好友邀请
        MsgId.RegisterMsg(3021, PB_SCRaChestManorInfo)        //宝箱庄园
        MsgId.RegisterMsg(3023, PB_SCRaDailySharingInfo)        //每日分享
        MsgId.RegisterMsg(3025, PB_SCRaStarMapGalaInfo)        //星图盛典
        MsgId.RegisterMsg(3028, PB_SCRaChaoZhiXianLiInfo)        //超值献礼
        MsgId.RegisterMsg(3030, PB_SCRaWeekendHaoLiInfo)        //周末豪礼
        MsgId.RegisterMsg(3032, PB_SCRaLianChongZengLiInfo)        //连充赠礼
        MsgId.RegisterMsg(3029, PB_SCRaNewServerInfo)        //新服比拼
        MsgId.RegisterMsg(3031, PB_SCRaNewServerGlobalInfo)        //新服比拼
        MsgId.RegisterMsg(3033, PB_SCRaWarOrderInfo)  //无限战令
        MsgId.RegisterMsg(3034, PB_SCRaWeekendLianChongInfo)  //周末连充
        MsgId.RegisterMsg(3036, PB_SCRANewServerRankList)  // 新服比拼 排行榜信息
        MsgId.RegisterMsg(3037, PB_SCRaShenqiDuobao)  // 神器夺宝
        MsgId.RegisterMsg(3038, PB_SCRaTianXuanGift)  // 天选之礼
        MsgId.RegisterMsg(3039, PB_SCRaTerritoryGift)  // 领地礼包
        MsgId.RegisterMsg(3040, PB_SCRaJifenZhuanpan)  // 积分转盘
        MsgId.RegisterMsg(3041, PB_SCRaCustomizedGift)  // 首充定制
        //msg firstcharge
        MsgId.RegisterMsg(3012, PB_SCRaFirstChongInfo)
        MsgId.RegisterMsg(2160, PB_CSSevenDaySignReq) // 七日签到请求
        MsgId.RegisterMsg(2161, PB_SCSevenDaySignInfo) // 七日签到全部信息
        MsgId.RegisterMsg(2162, PB_CSLuckUnpackingReq) // 开箱大吉请求
        MsgId.RegisterMsg(2163, PB_SCLuckUnpackingInfo) // 开箱大吉信息
        MsgId.RegisterMsg(2164, PB_CSNewAreaPreferentialReq) // 新服特惠请求
        MsgId.RegisterMsg(2165, PB_SCNewAreaPreferentialInfo) // 新服特惠信息
        MsgId.RegisterMsg(2166, PB_CSMarketShopReq) // 集市商店请求
        MsgId.RegisterMsg(2167, PB_SCMarketShopInfo) // 集市商店信息
        //msg leichong
        MsgId.RegisterMsg(3013, PB_SCRaLeiChongInfo)
        //msg luckyGift
        MsgId.RegisterMsg(3017, PB_SCRaLuckCourtesyInfo)
        //msg DailyGift
        MsgId.RegisterMsg(3014, PB_SCRaDailyGiftInfo)
        //msg MonthlyCard
        MsgId.RegisterMsg(3016, PB_SCRaMonthCardInfo)
        //msg other_role
        MsgId.RegisterMsg(1462, PB_CSGetOtherRoleInfo)
        MsgId.RegisterMsg(1463, PB_SCGetOtherRoleRet)
        //msg score_fund 
        MsgId.RegisterMsg(3022, PB_SCRaCapacityFundInfo)
        MsgId.RegisterMsg(3026, PB_SCRaGuMoTowerFundInfo)
        MsgId.RegisterMsg(3027, PB_SCRaRuneTowerFundInfo)
        //msg exclusive_gift
        MsgId.RegisterMsg(3042, PB_SCRaExclusiveGift);  //专属礼包

        //msg rune
        MsgId.RegisterMsg(1670, PB_SCRuneInfo)  // 铭文信息
        MsgId.RegisterMsg(1671, PB_CSRuneReq)   // 铭文请求
        MsgId.RegisterMsg(1672, PB_SCRuneRet)   // 铭文回调

        MsgId.RegisterMsg(3024, PB_SCRaFaZhenGalaInfo)   // 法阵盛典

        MsgId.RegisterMsg(1663, PB_CSAdvertisementFetch)   // 广告奖励
        MsgId.RegisterMsg(3035, PB_SCRaAdvertisementEquityInfo)   // 骑士之证

        //领地
        MsgId.RegisterMsg(9630, PB_CSTerritoryReq)
        MsgId.RegisterMsg(9631, PB_SCTerritoryInfo)
        MsgId.RegisterMsg(9632, PB_SCTerritoryNeighbourInfo)
        MsgId.RegisterMsg(9633, PB_SCTerritoryBotInfo)
        MsgId.RegisterMsg(9634, PB_SCTerritoryReportInfo)
        MsgId.RegisterMsg(9635, PB_SCTerritoryRedInfo)

        //附魔
        MsgId.RegisterMsg(1603, PB_SCEquipFuMoListInfo)
        MsgId.RegisterMsg(1604, PB_SCEquipFuMoOneInfo)

        //限制核心
        MsgId.RegisterMsg(1467, PB_CSLimitCoreReq)
        //物品回收
        MsgId.RegisterMsg(1685, PB_CSItemRecycleLevelUpReq)
        MsgId.RegisterMsg(1686, PB_SCItemRecycleInfo)
        MsgId.RegisterMsg(1687, PB_SCItemRecycleListInfo)
        MsgId.RegisterMsg(1688, PB_SCItemRecycleOneInfo)

        //卷轴
        MsgId.RegisterMsg(2170, PB_CSScrollReq)
        MsgId.RegisterMsg(2171, PB_SCScrollInfo)
        MsgId.RegisterMsg(2172, PB_SCScrollListInfo)
        MsgId.RegisterMsg(2173, PB_SCScrollOneInfo)

    }
}
