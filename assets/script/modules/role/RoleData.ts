import { assetManager, ImageAsset, SpriteFrame, url } from "cc";
import { CfgAdData } from "config/CfgAd";
import { CfgDundriesData } from "config/CfgDundries";
import { CfgRoleExpData } from "config/CfgRoleExp";
import { CfgTitleCfgData } from "config/CfgTitleCfg";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { smartdata, CreateSMD } from "data/SmartData";
import { SMDMap } from "data/SMDMap";
import { AngelData } from "modules/Angel/AngelData";
import { AudioManager } from "modules/audio/AudioManager";
import { ROLE_SETTING_TYPE, BATTLE_ATTR, msgType, OPEM_PARAM } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { CommonStruct, TYPE_APPEARANCE } from "modules/common/CommonStruct";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { FashionData } from "modules/fashion/FashionData";
import { MountData } from "modules/mount/MountData";
import { SceneObjDrawerSpine } from "modules/scene_obj_spine/SceneObjDrawerSpine";
import { ResPath } from "utils/ResPath";
import { DataHelper } from "../../helpers/DataHelper";
import { ChannelAgent, wx_User } from "../../proload/ChannelAgent";
import { RoleCtrl } from "./RoleCtrl";



class RoleResultData {
    @smartdata
    roleinfo: any = CommonStruct.RoleInfoParam([]);
    @smartdata
    appearance: TYPE_APPEARANCE = CommonStruct.AppearanceParam();

    @smartdata
    curExp: number = 0;
    @smartdata
    createTime: number = 0;

    @smartdata
    roleLevel: number = 0;
    @smartdata
    roleCap: number = 0;

    @smartdata
    RoleSystemSetInfo: PB_SCRoleSystemSetInfo;

    @smartdata
    val: boolean;
}
export enum MailType {
    Invalid,
    Usual,//普通
    Act,//活动
}
export enum MailSeqType {//             p1           p2
    Default,
    DeleteMail,//删除邮件              邮件类型     邮件位置
    GetMailBrief,//获取摘要列表        邮件类型     邮件位置
    GetMailDetail,//获取邮件内容       邮件类型     邮件位置
    FetchMailAttachment,//领取邮件附件 邮件类型     邮件位置
    OneKeyCleanMail,//一键删除已领     邮件类型     
    OneKeyFetchMail,//一键领取邮件附件 邮件类型     
}
export class SMainFlush {
    @smartdata
    flush_mail: boolean
    @smartdata
    flush_red: boolean
}

export class AdFlush {
    @smartdata
    flush_info: boolean
}


export class RoleData extends DataBase {
    public ResultData: RoleResultData;
    public AdInfo: Map<number, IPB_SCAdvertisement>;
    public AdFlush: AdFlush;
    public BaseAttribute: SMDMap<number, number>;
    public TitleRedInfo: SMDMap<number, number>;
    public inGame = false;
    private inCheck = false;
    MainFlush: SMainFlush = null
    MailList: IPB_MailBriefData[] = []
    MailUsualList: IPB_MailBriefData[] = []
    MailActList: IPB_MailBriefData[] = []

    select_mail: IPB_MailBriefData = null
    public avatar_out_texture: SpriteFrame | 0 | undefined = undefined;
    private wx_User: wx_User;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(RoleResultData);
        this.AdInfo = new Map();
        this.AdFlush = CreateSMD(AdFlush);
        this.BaseAttribute = CreateSMD<SMDMap<number, number>>(SMDMap);
        this.MainFlush = CreateSMD(SMainFlush);
        this.TitleRedInfo = CreateSMD<SMDMap<number, number>>(SMDMap);
        EventCtrl.Inst().on(CommonEvent.PACK_WX_BE_AVATAR, this.onAvatar, this)
        // this.onAvatar()
        //"https://thirdwx.qlogo.cn/mmopen/vi_32/6yqHVIic9Cuacup4WKXul3UOJrneichk0NgPhPvO4HtVTYGPhCscxAofaUZicqiawaibwooKf4X8mbWuEMzBuxNibdbA/132?aaa=aa.jpg"
    }
    protected onSwitch(): void {
        this.ResultData.curExp = 0;
        this.ResultData.createTime = 0;
        this.ResultData.roleinfo = CommonStruct.RoleInfoParam([]);
        this.ResultData.appearance = CommonStruct.AppearanceParam();
        this.MailList.length = 0;
        this.MailUsualList.length = 0;
        this.MailActList.length = 0;
        this.BaseAttribute.clear();
        this.TitleRedInfo.clear();
        this.select_mail = null
        this.MainFlush.flush_mail = !this.MainFlush.flush_mail
    }

    public SetRoleInfoAck(protocol: PB_SCRoleInfoAck) {
        this.ResultData.curExp = protocol.curExp;
        this.ResultData.createTime = protocol.createTime;
        this.ResultData.roleinfo = CommonStruct.RoleInfoParam(protocol.roleinfo);
        this.ResultData.appearance = CommonStruct.AppearanceParam(protocol.appearance);
        this.ResultData.roleinfo.name = DataHelper.BytesToString(this.ResultData.roleinfo.name)
        this.ResultData.roleinfo.headChar = DataHelper.BytesToString(this.ResultData.roleinfo.headChar)
        if (this.inGame == false) {
            this.inGame = true;
            EventCtrl.Inst().emit(CommonEvent.LOGIN_SUCC_ROLEDATA)
            ChannelAgent.Inst().Behaveious(ConstValue.BehaveType.RoleLogin)
        }
        // this.ResultData.roleLevel = protocol.roleinfo.level;
        this.checkWxUser();
    }

    private checkWxUser() {
        let t = this;
        let load = false;
        if (t.ResultData) {
            if (t.wx_User) {
                if ((t.ResultData.roleinfo.headChar == "" && t.wx_User.avatarUrl != "")
                    || t.ResultData.roleinfo.name != t.wx_User.nickName
                    || t.ResultData.roleinfo.headChar != t.wx_User.avatarUrl
                ) {
                    RoleCtrl.Inst().SendOutUserInfo(t.wx_User.nickName, t.wx_User.avatarUrl)
                    t.ResultData.roleinfo.name = t.wx_User.nickName
                    t.ResultData.roleinfo.headChar = t.wx_User.avatarUrl
                    load = true;
                }
            }
            if (t.ResultData.roleinfo.headChar != "" && (load || t.avatar_out_texture == undefined)) {
                t.avatar_out_texture = 0
                assetManager.loadRemote(ResPath.WxAvatar(t.ResultData.roleinfo.headChar), (error, texture: ImageAsset) => {
                    if (texture) {
                        t.avatar_out_texture = SpriteFrame.createWithImage(texture)
                        this.ResultData.val = !this.ResultData.val
                    }
                })
            }
        }
    }

    private onAvatar(wx_User: wx_User) {
        this.wx_User = wx_User;
        this.checkWxUser();
    }

    /**检查角色数据 判断是否进入游戏 */
    public CheckRoleInfo() {
        return this.ResultData.roleinfo.roleName != "";
    }

    //角色属性
    public SetRoleAttrList(attr_type: number, attr_value: number) {
        this.BaseAttribute.set(attr_type, attr_value);
    }

    //玩家等级
    public SetRoleLevel(level: number) {
        this.ResultData.roleinfo.level = level;
        this.ResultData.roleLevel = level;
    }

    //玩家当前经验
    public SetRoleExp(curExp: number) {
        this.ResultData.curExp = curExp;
    }

    //角色战力
    public SetCapability(capability: number) {
        this.ResultData.roleinfo.cap = capability;
        this.ResultData.roleCap = capability;
        let param = new OPEM_PARAM()
        param.type = msgType.setScore
        param.value = capability
        ChannelAgent.Inst().postMessageToOD(param)
    }

    //角色设置
    public SetRoleSystemSetInfo(protocol: PB_SCRoleSystemSetInfo) {
        this.ResultData.RoleSystemSetInfo = protocol;
        this.CheckRoleSystemSetInit()
    }

    //获取玩家ID
    public GetRoleId(): number {
        return this.ResultData.roleinfo.roleId;
    }

    //获取玩家名字
    public GetRoleName(): string {
        return this.ResultData.roleinfo.name;
    }

    //获取玩家等级
    public GetRoleLevel(): number {
        return this.ResultData.roleinfo.level;
    }

    //获取玩家当前经验
    public GetRoleExp(): number {
        return this.ResultData.curExp;
    }

    //获取玩家头像
    public GetRoleHeadPic(): number {
        return this.ResultData.roleinfo.headPicId;
    }

    //获取玩家形象
    public GetAppearance(): TYPE_APPEARANCE {
        return this.ResultData.appearance;
    }

    public GetAppearanceRes(show_mount: boolean = false, show_Angel: boolean = true): TYPE_APPEARANCE {
        return SceneObjDrawerSpine.GetAppearanceRes(this.ResultData.appearance, show_mount, show_Angel);
    }

    //获取角色属性
    public GetAttributeData(attri_type: number) {
        return this.BaseAttribute.get(attri_type);
    }

    //获取角色属性列表
    public GetAllAttributeData() {
        return this.BaseAttribute;
    }

    //获取玩家战力
    public GetCapability(): number {
        return this.ResultData.roleinfo.cap;
    }

    //获取玩家称号
    public GetTitleId(): number {
        return this.ResultData.roleinfo.titleId;
    }

    //获取玩家当前等级经验
    public GetRoleExpByLevel(level: number): number {
        let cfg = CfgRoleExpData.exp_config.find(cfg => cfg.level == level);
        return cfg ? cfg.exp : -1
    }

    //获取角色设置
    public GetRoleSystemSetInfo(type: ROLE_SETTING_TYPE) {
        let setting = this.ResultData.RoleSystemSetInfo ? this.ResultData.RoleSystemSetInfo.systemSetList[type] : undefined
        //LogError("?hafdf GetRoleSystemSetInfo",type ,this.ResultData.RoleSystemSetInfo)
        if(setting){
            //LogError(setting,setting ? setting.systemSetParam : 0,setting.systemSetParam)
        }
        return setting ? setting.systemSetParam : 0
    }

    //改变角色设置
    public ChangeRoleSystemSetInfo(type: ROLE_SETTING_TYPE, param: number) {
        let setting = this.ResultData.RoleSystemSetInfo.systemSetList[type]
        if (setting) {
            setting.systemSetParam = param
            RoleCtrl.Inst().SendRoleSystemSetReq([setting])
            this.CheckRoleSystemSet(setting)
        }
    }

    public CheckRoleSystemSetInit() {
        this.CheckRoleSystemSet(this.ResultData.RoleSystemSetInfo.systemSetList[ROLE_SETTING_TYPE.SettingMusic])
        this.CheckRoleSystemSet(this.ResultData.RoleSystemSetInfo.systemSetList[ROLE_SETTING_TYPE.SettingAudio])
    }

    public CheckRoleSystemSet(setting: IPB_system_set) {
        switch (setting.systemSetType) {
            case ROLE_SETTING_TYPE.SettingMusic:
                if (0 == setting.systemSetParam) {
                    AudioManager.Inst().RePlayBg()
                } else {
                    AudioManager.Inst().StopBg()
                }
                break;
            case ROLE_SETTING_TYPE.SettingAudio:
                if (0 == setting.systemSetParam) {
                    AudioManager.Inst().ReEffect()
                } else {
                    AudioManager.Inst().StopEffect()
                }
                break;
        }
    }

    public GetAllAttributeDataShow() {
        let list = [];
        for (let i = BATTLE_ATTR.BATTLE_ATTR_MIN + 1; i < BATTLE_ATTR.BATTLE_ATTR_MAX; i++) {
            list.push({ attrType: i, attrValue: this.GetAttributeData(i) });
        }
        return list;
    }

    public GetRoleTitleShowList() {
        return CfgTitleCfgData.titile
    }

    public GetRoleTitleInfo(title: number) {
        let cfg = CfgTitleCfgData.titile.find(cfg => cfg.for_item_id == title);
        return cfg
    }

    public GetRoleAttrIsShow(attr_type: number) {
        let cfg = CfgDundriesData.show_att.find(cfg => cfg.att_type == attr_type);
        return undefined == cfg || 1 == cfg.is_show
    }

    GetSettingRedPoint() {
        let num = 0
        num = this.GetMailRedPoint()
        //console.log(num);

        return num
    }
    GetMailRedPoint() {
        let num = 0
        this.MailUsualList.forEach(element => {
            if (element != null && element.isFetch == 0 && element.itemData != null && element.itemData.length > 0) {
                num = 1
            }
        });
        if (num == 1) {
            return num
        }
        this.MailActList.forEach(element => {
            if (element != null && element.isFetch == 0 && element.itemData != null && element.itemData.length > 0) {
                num = 1
            }
        });
        return num
    }

    //角色属性
    public SetTitleRedInfo(item_id: number, num: number) {
        this.TitleRedInfo.set(item_id, num);
    }

    public SetAdvertisementInfo(data: PB_SCAdvertisementInfo) {
        if (1 == data.isInit) {
            this.AdInfo.clear();
        }
        for (let i = 0; i < data.adList.length; i++) {
            let ad = data.adList[i];
            this.AdInfo.set(ad.seq, ad);
        }
        this.AdFlush.flush_info = !this.AdFlush.flush_info
    }

    public GetAdvertisementInfoBySeq(seq: number) {
        return this.AdInfo.get(seq);
    }

    public CfgAdTypeSeq(seq: number) {
        return CfgAdData.ad_type.find(cfg => cfg.seq == seq);
    }
}