import { sys, VERSION } from "cc";
import { url_parm, PackageData } from "./PkgData";
import { HTTP } from "../script/helpers/HttpHelper";
import { ReportManager } from "../script/proload/ReportManager";
import { LoginData } from "modules/login/LoginData";
import { RoleData } from "modules/role/RoleData";

export declare class wexin {
    /**
     * 震动
     * @param p type ： 类型
     */
    vibrateShort(p: { type: "heavy" | "medium" | "light" }): void;
    /**
     * 分享
     * @param p menus : 'shareAppMessage','shareTimeline'
     */
    showShareMenu(p: { withShareTicket: boolean, menus: string[] }): void;

    /**
     * 重启小游戏
     */
    restartMiniProgram(): void

    getSystemInfoSync(): { system: string, model: string }
}

export class PreloadToolFuncs {
    public static par_12: string[];

    public static get wx(): wexin {
        return (window as any)['wx'] as wexin
    }

    static Utf8Encode(string: any) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    static md5Encode(string: string) {

        function RotateLeft(lValue: any, iShiftBits: any) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function AddUnsigned(lX: any, lY: any) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function F(x: any, y: any, z: any) { return (x & y) | ((~x) & z); }
        function G(x: any, y: any, z: any) { return (x & z) | (y & (~z)); }
        function H(x: any, y: any, z: any) { return (x ^ y ^ z); }
        function I(x: any, y: any, z: any) { return (y ^ (x | (~z))); }

        function FF(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function GG(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function HH(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function II(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };



        function ConvertToWordArray(string: any) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };

        function WordToHex(lValue: any) {
            var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
        };

        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

        string = PreloadToolFuncs.Utf8Encode(string);

        x = ConvertToWordArray(string);

        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

        for (k = 0; k < x.length; k += 16) {
            AA = a; BB = b; CC = c; DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }

        var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

        return temp.toLowerCase();
    }

    static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    /**
     * 加密
     */
    public static Base64Encode(input: string) {
        if (input) {
            var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
            input = PreloadToolFuncs.Utf8Encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        }
    }

    static HttpGetJson(url: string, callback?: (statusCode: number, resp: url_parm | null, respText: string) => any, type: "POST" | "GET" = "GET"): XMLHttpRequest {
        let xhr = new XMLHttpRequest();
        let t_url;
        // if (sys.platform == sys.Platform.WECHAT_GAME || NATIVE) {
        t_url = url;
        // } else {
        //     t_url = new URL(url);
        // }
        xhr.timeout = 2000;
        xhr.open(type, t_url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                let resp = null;
                try {
                    if (xhr.responseText != "") {
                        resp = JSON.parse(xhr.responseText);
                    }
                }
                catch (e) {
                }
                callback && callback(xhr.status, resp, xhr.responseText);
            }
        };
        xhr.onerror = function (err) {
            callback && callback(-1, null, "Network error");
        };
        xhr.send();
        return xhr;
    }

    // /**
    //  * 大数据上报  自动设置参数只需填Report2Type里的 p_
    //  * @param params ID  设备型号：model
    //  */
    // static reportGameStart2() {
    //     //{/**事件ID */ ID: string,/**设备 */ model?: string, /**系统 */ system?: string }
    //     let pkgData = PackageData.Inst();
    //     let url_rep2 = pkgData.getQueryData().param_list.report_url2;

    //     if (url_rep2 && url_rep2 != "") {
    //         let system = "";
    //         let model = ""; // let queData = PackageData.Inst().getQueryData();

    //         if (sys.platform == sys.Platform.WECHAT_GAME) {
    //             let wx = PreloadToolFuncs.wx;

    //             if (wx) {
    //                 let sysinfo = wx.getSystemInfoSync();
    //                 system = sysinfo.system;
    //                 model = sysinfo.model;
    //             }
    //         } else {
    //             system = sys.os;
    //             model = sys.platform;
    //         }
    //         let params = [
    //             //日志id	项目代号	项目分支	平台id	区服id	渠道id	角色id	角色名	用户id	贵族等级
    //             "12", pkgData.getProject(), pkgData.getLine(), "-", "-", pkgData.palt_spid, "-", "-", "-", "-",
    //             //客户端事件ID 操作系统 设备型号 设备ID 引擎版本 资源版本
    //             "100", system, model, PackageData.Inst().getDevice(), VERSION, PackageData.Inst().getQueryData().version_info.assets_info.resources
    //         ];
    //         let str = "";
    //         params.forEach(element => {
    //             if (element === Report2Type.p_model) {
    //                 element = model;
    //             } else if (element === Report2Type.p_system) {
    //                 element = system;
    //             }
    //             if (str != "") {
    //                 str += "\t";
    //             }
    //             str += element;
    //         });
    //         let url = url_rep2;
    //         HTTP.PostJson(url, encodeURIComponent(str), null);
    //     }
    // }
    /**
     * 
    * 大数据上报  自动设置参数只需填Report2Type里的 p_
    * @param params ID  设备型号：model
    */
    static report2(id: string, id2: string, params: string[]) {
        //{/**事件ID */ ID: string,/**设备 */ model?: string, /**系统 */ system?: string }
        let pkgData = PackageData.Inst();
        let url_rep3 = pkgData.getQueryData().param_list.report_url3;

        if (url_rep3 && url_rep3 != "") {
            let system = "";
            let model = ""; // let queData = PackageData.Inst().getQueryData();

            if (sys.platform == sys.Platform.WECHAT_GAME) {
                let wx = PreloadToolFuncs.wx;

                if (wx) {
                    let sysinfo = wx.getSystemInfoSync();
                    system = sysinfo.system;
                    model = sysinfo.model;
                }
            } else {
                system = sys.os;
                model = sys.platform;
            }

            // let params = [
            //     //12 客户端事件ID 操作系统 设备型号 设备ID 引擎版本 资源版本
            //     "12", "100", system, model, PackageData.Inst().getDevice(), VERSION, PackageData.Inst().getQueryData().version_info.assets_info.resources
            // ];
            let loginCtrl = LoginData.Inst();
            let roleinfo = RoleData.Inst();

            let data_server = loginCtrl.GetLoginRespUserData();
            let merger_spid = data_server ? data_server.merger_spid : "-";
            let uid = data_server ? data_server.uid : "-";
            let serverId = loginCtrl.GetCurServerInfo() ? loginCtrl.GetCurServerInfo().id : "-";
            let roleName = roleinfo.GetRoleName();
            roleName = (roleName && roleName != "") ? roleName : "-";
            let roleID = roleinfo.GetRoleId();
            let roleId = roleID ? roleID : "-";
            params =
                //日志id	  项目代号	       项目分支	        平台id	        区服id	     渠道id	       角色id	角色名	用户id	贵族等级
                [id, pkgData.getProject(), pkgData.getLine(), merger_spid, serverId, pkgData.palt_spid, roleId, roleName, uid, "-",
                    id2].concat(params);
            let str = "";
            params.forEach(element => {
                if (element === Report2Type.p_model) {
                    element = model;
                } else if (element === Report2Type.p_system) {
                    element = system;
                }
                if (str != "") {
                    str += "\t";
                }
                str += element;
            });
            let url = url_rep3;
            HTTP.PostJson(url, encodeURIComponent(str), null);
        }
    }
}


export let Report2Type = {
    /**进入游戏 */
    ID_12: "12",

    /**主线任务 */
    ID_13: "13",
    p_model: "model",
    p_system: "system",
    par_12: function () {
        if (!PreloadToolFuncs.par_12) {
            PreloadToolFuncs.par_12 = ["system", "model", PackageData.Inst().getDevice(), VERSION, PackageData.Inst().getQueryData().version_info.assets_info.resources]
        }
        return PreloadToolFuncs.par_12
    },

    ID_9000: "9000",//请求Query成功
    ID_9001: "9001",//请求Query失败
    ID_9002: "9002",//开始加载ABminifest
    ID_9003: "9003",//加载ABminifest失败
    ID_9004: "9004",//加载ABminifest成功
    ID_9005: "9005",//开始加载AB MD5
    ID_9006: "9006",//加载AB MD5失败
    ID_9007: "9007",//加载AB MD5成功
    ID_9008: "9008",//开始加载登录lua AB
    ID_9009: "9009",//加载登录lua AB失败
    ID_9010: "9010",//加载登录lua AB成功
    ID_10000: "10000",//游戏开始，获取第一条PHP
    ID_10011: "10011",//强更包成功
    ID_10012: "10012",//强更包失败
    ID_10025: "10025",//开始请求RemoteManifest
    ID_10026: "10026",//请求RemoteManifest失败
    ID_10060: "10060",//开始require列表
    ID_10070: "10070",//require完成
    ID_10071: "10071",//请求SDK登录
    ID_10072: "10072",//SDK登录返回
    ID_10073: "10073",//验签返回
    ID_10074: "10074",//验签成功
    ID_10075: "10075",//验签失败, 客户端超时
    ID_10077: "10077",//验签失败,内容解析失败
    ID_10078: "10078",//验签失败,服务器限制
    ID_10079: "10079",//开始小游戏
    ID_10080: "10080",//显示登陆界面
    ID_10081: "10081",//登录失败
    ID_10090: "10090",//登录完成
    ID_12001: "12001",//开始请求后台，检查是否是新用户
    ID_12002: "12002",//后台请求返回成功，是新用户
    ID_12003: "12003",//后台请求返回成功，是老用户
    ID_12004: "12004",//后台请求返回失败
    ID_12005: "12005",//开启了小游戏，不自动跳过创角
    ID_12006: "12006",//跳过选服点击开始游戏按钮
    ID_10091: "10091",//关闭公告
    ID_10092: "10092",//点击选服
    ID_10093: "10093",//选服完成
    ID_10094: "10094",//点击开始游戏按钮
    ID_10095: "10095",//已加载完成点击开始游戏按钮
    ID_10100: "10100",//点击开始游戏
    ID_10110: "10110",//开始连接登陆服务器
    ID_10120: "10120",//登陆服连接上了
    ID_10130: "10130",//登陆服连接失败
    ID_10131: "10131",//到达创角页
    ID_10133: "10133",//完成创角动画
    ID_10140: "10140",//合并角色列表(合服之后)
    ID_10141: "10141",//点击创建角色按钮
    ID_10150: "10150",//发送创建角色请求
    ID_10160: "10160",//创建角色成功
    ID_10170: "10170",//创建角色失败
    ID_10175: "10175",//进场景前require开始
    ID_10176: "10176",//进场景前require完成
    ID_10180: "10180",//服务端下发角色列表
    ID_10190: "10190",//请求登录角色
    ID_10200: "10200",//请求跨服登录角色
    ID_10210: "10210",//收到登录成功回复
    ID_10220: "10220",//收到登录失败回复
    ID_10230: "10230",//游戏服连接上了
    ID_10240: "10240",//游戏服连接失败
    ID_10250: "10250",//请求进入游戏服
    ID_10260: "10260",//进入场景
    ID_10270: "10270",//进入场景失败
    ID_10280: "10280",//开始切换场景
    ID_10290: "10290",//更新场景开始
    ID_10300: "10300",//更新场景完成
    ID_10310: "10310",//切换场景完成
    ID_10330: "10330",//Query数据 cjson解析失败
}
