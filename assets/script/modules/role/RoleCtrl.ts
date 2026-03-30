import { sys } from "cc";
import { CfgAdData } from "config/CfgAd";
import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { ViewManager } from "manager/ViewManager";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { AdType, CheckSeqAdCard, CmdToClientCmd } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { KnightCardData } from "modules/knight_card/KnightCardData";
import { LevelupView } from "modules/levelup/LevelupView";
import { LoginData } from "modules/login/LoginData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { MailDetailView } from "modules/role_setting/MailDetailView";
import { ServerActivityView } from "modules/serveractivity/ServerActivityView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Base64 } from "../../helpers/Base64";
import { DataHelper } from "../../helpers/DataHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { ReportManager, ReportType } from "../../proload/ReportManager";
import { MailType, RoleData } from "./RoleData";


export class RoleCtrl extends BaseCtrl {
    data: RoleData = RoleData.Inst()
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRoleInfoAck, func: this.OnRoleInfoAck },
            { msgType: PB_SCRoleAttrList, func: this.OnRoleAttrList },
            { msgType: PB_SCRoleExpChange, func: this.OnRoleExpChange },
            { msgType: PB_SCRoleLevelChange, func: this.OnRoleLevelChange },
            { msgType: PB_SCRoleSystemSetInfo, func: this.OnRoleSystemSetInfo },


            { msgType: PB_SCMailDeleteAck, func: this.OnMailDeleteAck },
            { msgType: PB_SCMailListAck, func: this.OnMailListAck },
            { msgType: PB_SCMailDetail, func: this.OnMailDetail },
            { msgType: PB_SCFetchMailAck, func: this.OnFetchMailAck },
            { msgType: PB_SCAdvertisementInfo, func: this.OnAdvertisementInfo },
            { msgType: PB_SCCmdToClientCmd, func: this.OnPB_SCCmdToClientCmd },

        ]
    }

    protected initCtrl(): void {
        this.handleCollector.Add(RemindRegister.Create(Mod.RoleSetting.Mail, RoleData.Inst().MainFlush, RoleData.Inst().GetMailRedPoint.bind(RoleData.Inst()), "flush_red"));
    }

    //角色信息返回
    private OnRoleInfoAck(protocol: PB_SCRoleInfoAck) {
        // this.data.MailUsualList = []
        this.data.MailActList = []
        RoleData.Inst().SetRoleInfoAck(protocol);
        //console.log(protocol);
        ChannelAgent.Inst().Report();
        let report_data = [
            LoginData.Inst().GetLoginRespUserData().account,
            LoginData.Inst().GetServerItemInfoById(LoginData.Inst().ResultData.currentId).id,
            Base64.encode(RoleData.Inst().GetRoleName()),
            RoleData.Inst().GetRoleId(),
            RoleData.Inst().GetRoleLevel(),
        ]
        ReportManager.Inst().sendPoint(ReportType.roleLogin, report_data);
        ReportManager.Inst().sendPoint(ReportType.beginGame, report_data);
    }

    //经验改变
    private OnRoleExpChange(protocol: PB_SCRoleExpChange) {
        RoleData.Inst().SetRoleExp(protocol.curExp);
    }
    //等级改变
    private OnRoleLevelChange(protocol: PB_SCRoleLevelChange) {
        if (RoleData.Inst().GetRoleLevel() != protocol.level) {

            RoleData.Inst().SetRoleLevel(protocol.level);
            ViewManager.Inst().OpenView(LevelupView)
        }
        RoleData.Inst().SetRoleLevel(protocol.level);
        RoleData.Inst().SetRoleExp(protocol.exp);
        ChannelAgent.Inst().Report();
        let report_data = [
            LoginData.Inst().GetLoginRespUserData().account,
            LoginData.Inst().GetServerItemInfoById(LoginData.Inst().ResultData.currentId).id,
            Base64.encode(RoleData.Inst().GetRoleName()),
            RoleData.Inst().GetRoleId(),
            RoleData.Inst().GetRoleLevel(),
        ]
        ReportManager.Inst().sendPoint(ReportType.scoket, report_data);
    }
    //属性改变
    private OnRoleAttrList(protocol: PB_SCRoleAttrList) {
        // console.log(protocol);

        for (let i = 0; i < protocol.attrList.length; i++) {
            const element = protocol.attrList[i];
            RoleData.Inst().SetRoleAttrList(element.attrType, element.attrValue);
        }
        RoleData.Inst().SetCapability(protocol.capability);
    }
    private OnRoleSystemSetInfo(protocol: PB_SCRoleSystemSetInfo) {
        RoleData.Inst().SetRoleSystemSetInfo(protocol)
    }

    public SendRoleSystemSetReq(setList: IPB_system_set[]) {
        let protocol = this.GetProtocol(PB_CSRoleSystemSetReq);
        protocol.systemSetList = setList
        this.SendToServer(protocol);
    }

    OnMailListAck(data: PB_SCMailListAck) {
        console.log("邮件列表", data);
        let count = 0
        if (data.mailBriefData.length > 0) {
            if (data.mailBriefData[0].mailType == MailType.Usual) {
                if (this.data.MailUsualList.length > 0) {
                    data.mailBriefData.forEach(element => {
                        this.data.MailUsualList.push(element)
                        if (element.isRead == 0) {
                            count++;
                        }
                    });
                } else {
                    this.data.MailUsualList = data.mailBriefData
                    data.mailBriefData.forEach(element => {
                        if (element.isRead == 0) {
                            count++;
                        }
                    });
                }
            } else {
                if (this.data.MailActList.length > 0) {
                    data.mailBriefData.forEach(element => {
                        this.data.MailActList.push(element)
                        if (element.isRead == 0) {
                            count++;
                        }
                    });
                } else {
                    this.data.MailActList = data.mailBriefData
                    data.mailBriefData.forEach(element => {
                        if (element.isRead == 0) {
                            count++;
                        }
                    });
                }
            }
        }
        if (count > 0) {
            PublicPopupCtrl.Inst().Center(Language.RoleSetting.MailTip)
        }
        // let temp: IPB_MailBriefData[] = []
        // let temp1: IPB_MailBriefData[] = []
        // let temp2: IPB_MailBriefData[] = []
        let temp1: Map<number, IPB_MailBriefData> = new Map()
        let temp2: Map<number, IPB_MailBriefData> = new Map()
        this.data.MailUsualList.forEach(element => {
            temp1.set(element.mailIndex, element)
        });
        this.data.MailActList.forEach(element => {
            temp2.set(element.mailIndex, element)
        });
        this.data.MailUsualList = Array.from(temp1.values());
        this.data.MailActList = Array.from(temp2.values());
        this.data.MailList = Array.from(temp1.values()).concat(Array.from(temp2.values()));
        this.data.MainFlush.flush_mail = !this.data.MainFlush.flush_mail
        this.data.MainFlush.flush_red = !this.data.MainFlush.flush_red
    }
    OnMailDetail(data: PB_SCMailDetail) {
        //console.log(data);
        //打开内容界面
        //console.log("打开界面");
        if (data.mailType == MailType.Usual) {
            this.data.MailUsualList.forEach(element => {
                if (data.mailIndex == element.mailIndex) {
                    element.isRead = 1
                }
            });
        } else {
            this.data.MailActList.forEach(element => {
                if (data.mailIndex == element.mailIndex) {
                    element.isRead = 1
                }
            });
        }
        ViewManager.Inst().OpenView(MailDetailView, data)
        this.data.MainFlush.flush_mail = !this.data.MainFlush.flush_mail
    }
    OnMailDeleteAck(data: PB_SCMailDeleteAck) {
        //console.log(data);
        data.askInfo.forEach(element => {
            if (element.mailType == MailType.Usual && element.ret == 0) {
                this.data.MailUsualList.forEach(element2 => {
                    if (element2 != null && element2.mailIndex == element.mailIndex) {
                        let index = this.data.MailUsualList.indexOf(element2)
                        this.data.MailUsualList[index] = null
                    }
                });
            } else {
                if (element.ret == 0) {
                    this.data.MailActList.forEach(element2 => {
                        if (element2 != null && element2.mailIndex == element.mailIndex) {
                            let index = this.data.MailActList.indexOf(element2)
                            this.data.MailActList[index] = null
                        }
                    });
                }
            }
        });
        let temp: IPB_MailBriefData[] = []
        let temp1: IPB_MailBriefData[] = []
        let temp2: IPB_MailBriefData[] = []
        this.data.MailUsualList.forEach(element => {
            if (element != null) {
                temp.push(element)
                temp1.push(element)
            }
        });
        this.data.MailUsualList = temp1
        this.data.MailActList.forEach(element => {
            if (element != null) {
                temp.push(element)
                temp2.push(element)
            }
        });
        this.data.MailActList = temp2
        this.data.MailList = temp
        this.data.MainFlush.flush_mail = !this.data.MainFlush.flush_mail
        this.data.MainFlush.flush_red = !this.data.MainFlush.flush_red
    }
    OnFetchMailAck(data: PB_SCFetchMailAck) {
        // console.log(data);
        data.askInfo.forEach(element => {
            if (element.mailType == MailType.Usual && element.ret == 0) {
                this.data.MailUsualList.forEach(element2 => {
                    if (element2 != null && element2.mailIndex == element.mailIndex) {
                        let index = this.data.MailUsualList.indexOf(element2)
                        this.data.MailUsualList[index].isFetch = 1
                    }
                });
            } else {
                if (element.ret == 0) {
                    this.data.MailActList.forEach(element2 => {
                        if (element2 != null && element2.mailIndex == element.mailIndex) {
                            let index = this.data.MailActList.indexOf(element2)
                            this.data.MailActList[index].isFetch = 1
                        }
                    });
                }
            }
        });
        let temp: IPB_MailBriefData[] = []
        let temp1: IPB_MailBriefData[] = []
        let temp2: IPB_MailBriefData[] = []
        this.data.MailUsualList.forEach(element => {
            temp.push(element)
            temp1.push(element)
        });
        this.data.MailUsualList = temp1
        this.data.MailActList.forEach(element => {
            temp.push(element)
            temp2.push(element)
        });
        this.data.MailActList = temp2
        this.data.MailList = temp
        this.data.MainFlush.flush_mail = !this.data.MainFlush.flush_mail
        this.data.MainFlush.flush_red = !this.data.MainFlush.flush_red
    }
    SendMailReq(type: number, p1: number, p2: number) {

        let protocol = this.GetProtocol(PB_CSMailReq)
        protocol.type = type
        protocol.p_1 = p1
        protocol.p_2 = p2
        //console.log(protocol);
        this.SendToServer(protocol);
    }

    SendOutUserInfo(name: string, avatarUrl: string) {
        let protocol = this.GetProtocol(PB_CSRoleWXInfoSetReq)
        protocol.name = DataHelper.StringToByte(name)
        protocol.headChar = DataHelper.StringToByte(avatarUrl)
        this.SendToServer(protocol);
    }

    OnAdvertisementInfo(data: PB_SCAdvertisementInfo) {
        LogError("广告反馈 = OnAdvertisementInfo", data)
        RoleData.Inst().SetAdvertisementInfo(data)
        //==2 在这里打开
        //部分广告没有物品奖励反馈，所以在这里进行检查
        //还要排除有物品奖励的那些
        if (data.isInit == 0 && data.adList.length > 0 && data.adList[0].seq == this.adType && CheckSeqAdCard[data.adList[0].seq]) {
            this.checkAdCard()
        }
    }

    OnPB_SCCmdToClientCmd(data: PB_SCCmdToClientCmd) {
        if (data.id == CmdToClientCmd.update) {
            let str = DataHelper.BytesToString(data.str)
            if (BattleCtrl.Inst().checkByHandle(this.handleCollector, ChannelAgent.Inst().checkGameRes.bind(ChannelAgent.Inst(), str))) {
                return;
            }
            ChannelAgent.Inst().checkGameRes(str)
        }
    }
    /**
     * 请求下发广告奖励
     * @param seq adType 表里的广告id 
     * @param is_dia 是否消耗钻石 1：钻石 0：非钻石
     * @param param 等级基金，宝箱基金活动序号
     */
    public ReqAdverReward(seq: number, is_dia = 0, param: number = 0, ignore?: boolean) {
        let protocol = this.GetProtocol(PB_CSAdvertisementFetch)
        protocol.seq = seq;
        protocol.isDia = is_dia;
        protocol.param = param;
        LogError("广告  = ", protocol)
        this.SendToServer(protocol);
        if (!ignore) {
            this.adType = seq
        } else {
            this.adType = -1
        }
    }
    adType: AdType = -1
    adCardTag = "AdCardShowTime"
    adCardShowInterval = 10//172800
    getAdTag() {
        return this.adCardTag + RoleData.Inst().GetRoleId()
    }
    //检查并判断是否打开广告权益卡界面
    public checkAdCard() {
        this.adCardShowInterval = CfgAdData.other[0].cd_time
        let tag = this.getAdTag()
        console.log("检查间隔 = ", this.adCardShowInterval, this.adType)
        let value = sys.localStorage.getItem(tag)
        console.log(value)
        console.log(typeof (value));
        if (this.adType > 0 && (IsEmpty(value) || TimeCtrl.Inst().ServerTime - (+value) >= this.adCardShowInterval)) {
            //已购买权益卡不打开
            let is_buy = KnightCardData.Inst().GetKnightCardIsBuy()
            if (is_buy) {
                console.log("已买");
                this.adType = -1
                return
            }
            let cfg = this.data.CfgAdTypeSeq(this.adType)
            if (cfg && cfg.is_open == 0) {
                this.adType = -1
                console.log("配表不开");
                return
            }
            //骑士之争要领完最后一个才执行改逻辑
            if (this.adType == AdType.knight_card) {
                let info_get = KnightCardData.Inst().GetKnightCardGet(5)
                if (!info_get.is_get) {
                    this.adType = -1
                    return
                }
            }
            if (ViewManager.Inst().IsOpen(ServerActivityView)) {
                let view: ServerActivityView = ViewManager.Inst().getView(ServerActivityView)
                if (view) {
                    if (FunOpen.Inst().GetFunIsOpen(Mod.ServerActivity.AdEquity).is_open) {
                        view.SelectServerTab(Mod.ServerActivity.AdEquity)
                        sys.localStorage.setItem(tag, TimeCtrl.Inst().ServerTime.toString());
                    } else {
                        console.log("功能未开");
                    }
                }
            } else {
                if (FunOpen.Inst().GetFunIsOpen(Mod.ServerActivity.AdEquity).is_open) {
                    ViewManager.Inst().OpenViewByKey(Mod.ServerActivity.AdEquity)
                    sys.localStorage.setItem(tag, TimeCtrl.Inst().ServerTime.toString());
                } else {
                    console.log("功能未开");

                }
            }
            this.adType = -1
        }
    }
}