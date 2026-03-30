import { sys } from "cc";
import { NATIVE } from "cc/env";
import { url_parm } from "preload/PkgData";


export class HTTP {
    static GetString(url: string, callback: (statusCode: number, resp: string, respText: string) => any): XMLHttpRequest {
        let xhr = new XMLHttpRequest();
        let t_url;
        if (sys.platform == sys.Platform.WECHAT_GAME || NATIVE) {
            t_url = url;
        } else {
            t_url = new URL(url);
        }
        xhr.open("GET", t_url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                let resp: string = xhr.responseText;
                callback && callback(xhr.status, resp, xhr.responseText);
            }
        };
        xhr.onerror = function (err) {
            callback && callback(-1, "", "Network error");
        };
        xhr.send();
        return xhr;
    }


    static GetJson(url: string, callback?: (statusCode: number, resp: any | null, respText: string) => any): XMLHttpRequest {
        let xhr = new XMLHttpRequest();
        let t_url;
        if (sys.platform == sys.Platform.WECHAT_GAME || NATIVE) {
            t_url = url;
        } else {
            t_url = new URL(url);
        }
        xhr.open("GET", t_url);
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


    static PostJson(url: string, data: object | string, callback: (statusCode: number, resp: object | null, respText: string) => any): XMLHttpRequest {
        let xhr = new XMLHttpRequest();
        let t_url;
        if (sys.platform == sys.Platform.WECHAT_GAME || NATIVE) {
            t_url = url;
        } else {
            t_url = new URL(url);
        }
        xhr.open("POST", t_url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
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
        var text = typeof (data) == "string" ? data : JSON.stringify(data);
        xhr.send(text);
        return xhr;
    }

}
