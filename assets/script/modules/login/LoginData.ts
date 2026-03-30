import { CreateSMD, smartdata } from "data/SmartData";
import { PackageData, publish_info, server_Info, server_List_Info, url_parm } from "preload/PkgData";
import { DataBase } from "../../data/DataBase";
import { LoginVerify, RoleDatum } from "../../proload/ChannelAgent";

class LoginResultData {
    @smartdata
    result: number;   //登录返回结果
    @smartdata
    currentId: number; //当前选择服务器id
    @smartdata
    resultFlush: boolean;

    @smartdata
    user_protocol_change: boolean;
}

export class LoginData extends DataBase {
    public ResultData: LoginResultData;
    private server_info: server_Info;
    private publish_info: publish_info;
    private server_list: server_List_Info[];
    private server_role_list: Map<number, RoleDatum>;
    private last_server_list: server_List_Info[];
    private server_map: { [key: number]: server_List_Info } = {};
    private static url_parm: url_parm;
    private _LoginData: plLoginData;
    private rspUserInfo: ResponseUserInfo;
    private rspUserProtocol: ResponseUserProtocolData;
    public HTTPS: boolean = false;
    constructor() {
        super();
        this._LoginData = new plLoginData();
        this.createSmartData();
        this.server_role_list = new Map();
    }

    private createSmartData() {
        let self = this;
        self.ResultData = CreateSMD(LoginResultData);
    }

    public SetServerInfo(server_info: server_Info) {
        this.server_info = server_info;
        this.setServerList(this.server_info.server_list);
    }

    public SetRoleData(role_data: { [key: string]: RoleDatum }) {
        this.server_role_list.clear();
        for (var i in role_data) {
            this.server_role_list.set(+i, role_data[i])
        }
    }

    public SetPublishInfo(publish_info: publish_info) {
        this.publish_info = publish_info;
    }

    public SetLoginUserProtocol(data: ResponseUserProtocolData[]) {
        this.rspUserProtocol = data[0];
        this.ResultData.user_protocol_change = !this.ResultData.user_protocol_change;
    }

    public GetLoginUserProtocol() {
        return this.rspUserProtocol;
    }

    //获取服务器信息
    public GetServerInfo() {
        return this.server_info;
    }

    public GetServerRoleInfoById(id: number) {
        return this.server_role_list.get(id);
    }

    public GetPublishInfo() {
        return this.publish_info;
    }

    public static SetUrlParm(resp: url_parm) {
        LoginData.url_parm = resp;
    }

    public static GetUrlParm() {
        return LoginData.url_parm;
    }

    public GetLoginData() {
        return this._LoginData;
    }

    SetLoginData(data: LoginVerify) {
        let userInfo = this.rspUserInfo
        if (!userInfo) {
            this.rspUserInfo = userInfo = new ResponseUserInfo();
        }
        userInfo.account = data.user.account;
        userInfo.account_type = data.user.account_type;
        userInfo.fcm_flag = data.user.fcm_flag;
        userInfo.login_sign = data.user.login_sign;
        userInfo.login_time = data.user.login_time;
        userInfo.uid = data.user.uid;
        userInfo.openid = data.user.openid;
        userInfo.merger_spid = data.user.merger_spid;
        let server_role = data.role_data;
        let lastServer: RoleDatum;
        this.last_server_list = [];
        for (const key in server_role) {
            let server_Info = this.server_map[+key]
            if (server_Info) {
                this.last_server_list.push(server_Info);
                const element = server_role[key];
                server_Info.role_name = element.role_name;
                if (!lastServer) {
                    lastServer = element;
                } else if (element.last_login_time > lastServer.last_login_time) {
                    lastServer = element;
                }
            }

        }
        this.CheckLastLogin(lastServer);
    }

    public GetLastServerList() {
        return this.last_server_list;
    }

    public GetLoginRespUserData() {
        return this.rspUserInfo;
    }

    private setServerList(server_list: server_List_Info[]) {
        let t = this;
        server_list.sort((a: server_List_Info, b: server_List_Info) => {
            let sortNumber = 0
            if (a.id < b.id) {
                sortNumber = -1;
            }
            if (a.id > b.id) {
                sortNumber = 1;
            }
            return sortNumber
        });
        for (let index = 0, l = server_list.length; index < l; index++) {
            const element = server_list[index];
            t.server_map[element.id] = element;
        }
        t.server_list = server_list;
    }

    private CheckLastLogin(lastServer: RoleDatum) {
        if (lastServer) {
            this.ResultData.currentId = +lastServer.server_id;
            return
        }
        let list = this.server_info.server_list;
        let l_id = this.server_info.last_server;
        this.ResultData.currentId = list[0].id;
        for (let index = 0; index < list.length; index++) {
            if (list[index].id == l_id) {
                this.ResultData.currentId = l_id;
                break;
            }
        }
    }

    //获取服务器列表
    public GetServerList() {
        return this.server_list;
    }

    public GetServerItemInfoById(id: number) {
        let list = this.server_info.server_list;
        let element = list[0];
        for (let index = 0; index < list.length; index++) {
            if (list[index].id === id) {
                element = list[index];
                break;
            }
        }
        return element
    }

    //获取服务器组
    public GetServerGroupCount() {
        let count = 1;
        let length = this.GetServerList().length;
        count = count + Math.ceil(length / 10);
        return count;
    }

    //获取当前组服务器列表
    public GetShowServerShowListByGroup(index: number) {
        let list: server_List_Info[] = [];
        if (index === 0) {
            list = this.last_server_list
        } else {
            let ServerList = this.GetServerList();
            let seq = 0
            for (let i = ServerList.length - 1; i >= 0; i--) {
                const element = ServerList[i];
                const start_i = (index - 1) * 10;
                const end_i = index * 10;
                if (seq >= start_i && seq < end_i) {
                    list.push(element);
                }
                seq++
            }
        }
        list.sort((a: any, b: any) => {
            return b.id - a.id
        })
        return list;
    }

    // //获取最近登录服务器
    // public GetRecentLoginList() {
    //     let list: server_List_Info[] = [];
    //     let last_server = this.GetServerInfo().last_server;
    //     let ServerList = this.GetServerList();
    //     for (let index = 0; index < ServerList.length; index++) {
    //         const element = ServerList[index];
    //         if (element.id === last_server) {
    //             list.push(element);
    //             break;
    //         }
    //     }

    //     return list;
    // }

    /**
     * 获取当前服务器信息
     * @method GetCurServerInfo
     * @retrun {server_List_Info | undefined}
     */
    public GetCurServerInfo(): server_List_Info | undefined {
        return this.server_map[this.ResultData.currentId];
    }

    public get palt_spid(): number {
        return ((Number(PackageData.Inst().getSpid().charCodeAt(0)) << 8) +
            (Number(PackageData.Inst().getSpid().charCodeAt(1)) << 16) +
            (Number(PackageData.Inst().getSpid().charCodeAt(2)) << 24));
    }
}

/**
 * 登录信息
*/
export class plLoginData {
    static defAID = "clientName"
    /**用户名 */
    public accountId = plLoginData.defAID;
    /**密码 */
    public password = "defuat";
    public token: any;
    public userName: any;
    public error: any;
    public fcmFlag: any;
    public accountType: any;
    public notNeedPhp: any;
    public TimeStemp: any;
    public dynamicParams: any[];
    public customMap: {};
    public static reset(): plLoginData {
        return new plLoginData();
    }
}

/**
 *	登录请求后返回的用户信息及服务器信息
 */
export class ResponseUserInfo {
    public role_data: ResponseServerData[];
    public account: string;
    public account_type: number;
    public fcm_flag: number;
    public login_sign: string;
    public login_time: number;
    public uid: string;
    public openid: string;
    public merger_spid: string;
}

class ResponseServerData {
    last_login_time: number;
    level: string;
    role_id: string;
    role_name: string;
    server_id: string;
    vip: string;
}

export class ResponseUserProtocolData {
    content: any;
    user_agree_url: string;
    privacy_url: string;
    img_url: string;
}
