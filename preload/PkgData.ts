import { DEBUG } from "cc/env";
import { PreloadToolFuncs } from "./PreloadToolFuncs";

export class PackageData {
    //--------------Singleton BEGIN------------------------
    static Inst(this: new () => PackageData): PackageData {
        if (!(<any>this).instance) {
            (<any>this).instance = new this();
        }
        return (<any>this).instance;
    }
    constructor() {
        // if (DEBUG) {
        (<any>globalThis)[this.constructor.name] = this.constructor;
        // }
    }

    static Destroy() {
        if ((<any>this).instance) {
            (<any>this).instance.onDestroy();
            (<any>this).instance = null;
        }
    }

    onDestroy() {

    }
    //--------------Singleton END------------------------

    public get query_url(): string {
        let spid = this.getPackage_spid()
        let pkg = this.getPkg();
        let version = this.getVersion()
        let device = this.getDevice();
        let queryUrl = this.getQueryUrl();
        if (queryUrl === null || queryUrl === undefined || queryUrl === "") {
            let isOut = this.getIsOut()
            let isDebug = this.getIsDebug()
            // queryUrl = ((DEBUG && !isOut) || (isDebug && !isOut)) ?
            //     `http://local.bluegames.cn/${spid}/${spid}-query-h02.php` :
            //     `https://cls-ylh02.huanyuantech.com/${spid}/query.php`;
            queryUrl = ((DEBUG && !isOut) || (isDebug && !isOut)) ?
                `http://localhost:8080/config-service/api/config/dev-query-h02` :
                `http://localhost:8080/config-service/api/config/dev-query-h02`;

        }
        return `${queryUrl}?plat=${spid}&version=${version}&pkg=${pkg}&device=${device}`

    }
    private g_UserInfo: packageInfo;

    private queryData: url_parm;

    public init() {
        this.g_UserInfo = new packageInfo();
        let window_data: any = window;
        this.setGameUserInfo(window_data["httploginData"]);
        this.setH5Device();
    }
    // 默认数据
    private initGameUserInfo(): void {
        this.g_UserInfo.project = "hl02";
        this.g_UserInfo.line = "cn";
        this.g_UserInfo.package_spid = "dev";
        this.g_UserInfo.spid = "dev";
        this.g_UserInfo.version = "1.0.0";
        this.g_UserInfo.pkg = "1.0.0";
        this.g_UserInfo.device = "edge";
        this.g_UserInfo.IMEA = "0";
        this.g_UserInfo.plat_spid = "0";
        this.g_UserInfo.account = "";
        this.g_UserInfo.serverId = "";
        this.g_UserInfo.token = "";
        this.g_UserInfo.isDebug = false;
        this.g_UserInfo.isOut = false;
        this.g_UserInfo.game_type = "";
        this.g_UserInfo.showKf = false;
        this.g_UserInfo.showVideo = false;
        this.g_UserInfo.queryUrl = undefined;
        this.g_UserInfo.hotUpdate = false;
        this.g_UserInfo.WxVibrate = "medium";//"heavy" | "medium" | "light"
        this.g_UserInfo.Deploy = {
            login_bg: "loader/login/login_bg", //"http://localhost:82/wx/assert/login_bg.png" 
            login_logo: "loader/login/login_logo",
        }
        if (DEBUG) {
            this.DebugValue();
        }
    }

    /**
     * 修改此处配置
     */
    private async DebugValue() {
        // // let a = await Editor.Profile.getProject("cocos-build-template", "spid")
        // LogError(a)
        //改渠道号 此处
        this.g_UserInfo.package_spid = "dev";
        //控制是否进审核服
        this.g_UserInfo.pkg = "1.0.0";
        //外网 query
        this.g_UserInfo.isOut = false;
        this.g_UserInfo.xuanfu = false;
        this.g_UserInfo.isDebug = true;
        this.g_UserInfo.checkSMD = true;
    }

    //保存用户设备号
    public setGameUserInfo(data?: any) {
        // if (!data) {
        this.initGameUserInfo();
        //     return;
        // }
        for (let key in data) {
            if (key == "isDebug" || key == "isOut") {
                if (typeof data[key] == "string") {
                    if (data[key] == "true") {
                        data[key] = true;
                    } else {
                        data[key] = false
                    }
                } else {
                    this.g_UserInfo[key] = data[key];
                }
            }
            if (key == "spid") {
                this.g_UserInfo["package_spid"] = data[key];
            } else if (key == "device") {
                if (this.g_UserInfo[key] && this.g_UserInfo[key] != undefined && this.g_UserInfo[key] != "undefined" && data[key] == "chrome") {
                    continue;
                } else {
                    this.g_UserInfo[key] = data[key];
                }
            } else
                this.g_UserInfo[key] = data[key];
        }
    }

    public getGameUserInfo(): any {
        return this.g_UserInfo;
    }

    public getWxVibrate(): any {
        return this.g_UserInfo.WxVibrate;
    }

    public get palt_spid(): number {
        return ((Number(this.g_UserInfo.spid.charCodeAt(0)) << 8) + (Number(this.g_UserInfo.spid.charCodeAt(1)) << 16) + (Number(this.g_UserInfo.spid.charCodeAt(2)) << 24));
    }

    /**
     * 子渠道号
     **/
    public setSpid(spid: string) {
        this.g_UserInfo.spid = spid;
    }
    /**
     * 子渠道号
     **/
    public getSpid(): string {
        return this.g_UserInfo.spid;
    }

    /**
     * 母渠道号
     **/
    public getPackage_spid(): string {
        return this.g_UserInfo.package_spid;
    }

    /**
     * 渠道子包spid 
     **/
    public setPlatSpid(spid: any) {
        this.g_UserInfo.plat_spid = spid;
    }

    public getQueryUrl() {
        return this.g_UserInfo.queryUrl;
    }

    /**
     * 渠道子包spid 
     **/
    public getPlatSpid(): string {
        return this.g_UserInfo.plat_spid;
    }

    public getShowKh(): boolean {
        return this.g_UserInfo.showKf;
    }

    public getIsOut(): boolean {
        return this.g_UserInfo.isOut;
    }

    public getIsDebug(): boolean {
        return this.g_UserInfo.isDebug;
    }

    public setIMEA(imea: any) {
        this.g_UserInfo.IMEA = imea;
    }

    public getIMEA(): string {
        return this.g_UserInfo.IMEA;
    }

    public getVersion(): string {
        return this.g_UserInfo.version;
    }

    public getPkg(): string {
        return this.g_UserInfo.pkg;
    }

    /**设备ID */
    public setDevice(device: any) {
        this.g_UserInfo.device = device + "";
    }

    /**设备ID */
    public getDevice(): string {
        return this.g_UserInfo.device;
    }

    public getShowVideo(): boolean {
        return this.g_UserInfo.showVideo;
    }

    public getQueryData(): url_parm {
        return this.queryData;
    }

    public setQueryData(data: url_parm) {
        this.queryData = data;
        this.setSpid(data.server_info.spid);
        this.setPlatSpid(data.server_info.spid)
    }

    public getHotUpdate() {
        return this.g_UserInfo.hotUpdate;
    }

    public getCheckSMD() {
        return this.g_UserInfo && this.g_UserInfo.isDebug && this.g_UserInfo.checkSMD;
    }

    public getProject() {
        return this.g_UserInfo.project
    }

    public getLine() {
        return this.g_UserInfo.line
    }

    public getLogin_bg() {
        return this.g_UserInfo.Deploy.login_bg
    }

    public getLogin_logo() {
        return this.g_UserInfo.Deploy.login_logo
    }

    private setH5Device() {
        let uuid = localStorage.getItem("CaculDeviceID");
        //UtilHelper.getLocalGameValue(ConstValue.LocalStrogeKey.DeviceId);
        if (uuid == "" || !uuid) {
            let str = Math.random().toString(36).substring(2) + Date.now().toString(36);
            let md5_str = PreloadToolFuncs.md5Encode(str);
            var a1 = md5_str.slice(0, 8);
            var a2 = md5_str.slice(8, 12);
            var a3 = md5_str.slice(12, 16);
            var a4 = md5_str.slice(16, 20);
            var a5 = md5_str.slice(20, 32);
            uuid = a1 + "-" + a2 + "-" + a3 + "-" + a4 + "-" + a5;
            localStorage.setItem("CaculDeviceID", uuid);
            //UtilHelper.setLocalGameValue(ConstValue.LocalStrogeKey.DeviceId, uuid);
        }
        this.setDevice(uuid);
    }


}

class packageInfo {
    project: string
    line: string
    //package spid（目前query请求和数据上报）
    package_spid: string;
    //子包spid
    spid: string;
    //帐号互通前缀spid 
    account_spid: string;
    //专服spid（战报拼接）
    merger_spid: string;
    //渠道sdk子包spid
    plat_spid: string;
    version: string;
    pkg: string;
    device: string;
    IMEA: string;
    account: string;
    serverId: string;
    game_type: string;//and,ios,h5,wx,web
    isDebug: boolean;
    isOut: boolean;
    skipF: boolean;
    CheckNet: boolean;
    token: string;
    showKf: boolean;
    showVideo: boolean;
    queryUrl: string;
    hotUpdate: boolean;
    WxVibrate: "heavy" | "medium" | "light";
    Deploy: { login_bg: string, login_logo: string }
    checkSMD: boolean
    xuanfu: boolean;
}
export type url_parm = {
    param_list: param_List;
    server_info: server_Info;
    version_info: version_Info;
}

type param_List = {
    config_url: string;
    gift_fetch_url: string;
    publicgm_report_url: string;
    report_url: string;
    report_url2: string;
    report_url3: string;
    switch_list: switch_List;
    update_package: string;
    translate_url: string;
    update_url: string;
    publish_info: {
        company: string;
        game_num: string;
    };
    upload_url: string;
    verify_url: string;
    user_agree_url: string;
    privacy_url: string;
    verify_url2: string;
    fightdata_url: string;
    user_protocol_url: string;
    gm_report_url: string;
    gm_buy_url: string;
    update_notice_query_url: string;
    h5_recharge_url: string;
    role_report_url: string;
    event_url: string;
    pay_event_url: string;
    activity_conf_url: string;
    check_auth_url: string;
    send_code_url: string;
    bind_phone_url: string;
    reward_status_url: string;
    bind_reward_url: string;
    wx_getShareGift_url: string;
    wx_getShareInfo_url: string;
    wx_shareplay_url: string;
    adv_gift_url: string;
    server_stat_url: string;
}

type switch_List = {
    active_code: boolean;
    /**审核服 */
    audit_version: boolean;
    countly_report: boolean;
    error_screen: boolean;
    log_print: boolean;
    open_chongzhi: boolean;
    open_gm: boolean;
    qqvip_gift: boolean;
    privacy_is_link: boolean;
    testin_report: boolean;
    update_assets: boolean;
    audit_green: boolean;
    cg_config: number;
    p_report: boolean;
    open_auth: boolean;
    open_bindphone: boolean;
    wx_audit_version: boolean;
}

export type server_Info = {
    last_server: number;
    recommand_list: number[];
    server_list: server_List_Info[];
    server_time: number;
    spid: string;
    account_spid: string;
    server_offset: number;
}


export type publish_info = {
    company: string;
    game_num: string;
}


export type server_List_Info = {
    ahead_time: number;
    avatar: string;
    flag: number;
    fsid: number;
    id: number;
    ip: string;
    name: string;
    open_time: number;
    port: number;
    role_level: number;
    role_name: string;

    noHeandIp: string; //去http和wss连接
}

type version_Info = {
    assets_info: {
        version: string;
        // conf_key: string;
        resources: string;
        res: string;
    };
    package_info: package_Info;
    update_data: string;
    // asset_info: {
    //     res: string;
    //     resources: string;
    // };
}

type package_Info = {
    desc: string;
    md5: string;
    msg: string;
    name: string;
    size: number;
    url: string;
    version: string;
}
