// import { Item } from "modules/bag/ItemData";

import { NATIVE } from "cc/env";
import { Item } from "modules/bag/ItemData";
import { Language } from "modules/common/Language";
import { Base64 } from "./Base64";
import { MathHelper } from "./MathHelper";
import { TextHelper } from "./TextHelper";


// export let DataHelper: KeyFunction = {};
export class DataHelper {
    static TextDecoder: TextDecoder = undefined == window.TextEncoder ? undefined : new TextDecoder("utf-8");
    static TextEncoder: TextEncoder = undefined == window.TextEncoder ? undefined : new TextEncoder();

    static init() {
        DataHelper.TextDecoder == undefined ? DataHelper.TextDecoder = new TextDecoder("utf-8") : undefined;
        DataHelper.TextEncoder == undefined ? DataHelper.TextEncoder = new TextEncoder() : undefined;
    }
    //转换财富
    static ConverMoney = function (value: number, special?: boolean): string {
        if (value >= 100000000) {
            let result = MathHelper.PreciseDecimal(value / 100000000, 2);
            if (result == Math.floor(result)) {
                return Math.floor(result) + Language.Common.Yi;
            }
            return result + Language.Common.Yi;
        }
        if (value >= 10000 && value < 100000000 && special == null) {
            let result = MathHelper.PreciseDecimal(value / 10000, 2);
            if (result == Math.floor(result)) {
                return Math.floor(result) + Language.Common.Wan;
            }
            return result + Language.Common.Wan;
        }
        return value.toString();
    }
    //拆分默认转数字 返回一个list
    static SplitList = function (content: string, txt: string) {
        let list = [];
        for (const item of content.toString().split(txt)) {
            list.push(item);
        }
        return list;
    }

    //table.nums
    static Nums = function (data: any): number {
        let num = 0;
        for (const key in data) {
            num++;
        }
        return num;
    }

    static GetTurnName = function (data: { grade: number, star: number } | number, star?: number): string {
        if (typeof (data) == "number")
            return TextHelper.Format(Language.Common.Reincarnation, data, star);
        else
            return TextHelper.Format(Language.Common.Reincarnation, data.grade, data.star);
    }

    //格式化列表
    static FormatItemList = function (item_list: any[], index?: number): any[] {
        if (item_list == null) {
            return []
        };
        let list: any[] = [];
        for (let i = index ?? 0; i < list.length; index++) {
            if (list[i]) {
                list.push(Item.Create(item_list[i]));
            }
        }
        return list
    }

    static GetDaXie = function (num: number, fan_ti?: boolean): string {
        if (num == null) { return Language.DataHelper.DaXie[1] }
        let language = fan_ti ? Language.DataHelper.FanTi : Language.DataHelper.DaXie

        let str = ""
        if (num > 10) {
            let ge = num % 10
            let shi = Math.floor(num / 10) % 10
            if (num > 99) {
                let bai = Math.floor(num / 100) % 10
                if (num % 100 == 0) {
                    str = language[bai] + language[11]
                }
                else if (num % 100 < 10) {
                    str = language[bai] + language[11] + language[shi] + language[ge]
                }
                else if (ge == 0) {
                    str = language[bai] + language[11] + language[shi] + language[10]
                }
                else {
                    str = language[bai] + language[11] + language[shi] + language[10] + language[ge]
                }
            } else if (ge == 0) {
                str = language[shi] + language[10]
            } else if (shi == 1) {
                str = language[10] + language[ge]
            } else {
                str = language[shi] + language[10] + language[ge]
            }
        }
        else {
            str = language[num]
        }


        //     local shi = math.floor(num / 10) % 10
        //     local s = "s"
        //     if num > 99 then
        //         local bai = math.floor(num / 100) % 10
        //         local b = "b"
        //         if num % 100 == 0 then
        //             str = dx(bai) .. dx(b)
        //         elseif num % 100 < 10 then
        //             str = dx(bai) .. dx(b) .. dx(0) .. dx(ge)
        //         elseif ge == 0 then
        //             str = dx(bai) .. dx(b) .. dx(shi) .. dx(s)
        //         else
        //             str = dx(bai) .. dx(b) .. dx(shi) .. dx(s) .. dx(ge)
        //         end
        //     elseif ge == 0 then
        //         str = dx(shi) .. dx(s)
        //     elseif shi == 1 then
        //         str = dx(s) .. dx(ge)
        //     else
        //         str = dx(shi) .. dx(s) .. dx(ge)
        //     end
        // else
        //     str = dx(num)
        // end
        return str
    }

    static BytesToString = function (bytes: Uint8Array) {
        if (bytes) {
            if (bytes.byteLength) {
                // let uint8Array = new Uint8Array(bytes)
                let result = DataHelper.TextDecoder.decode(bytes);
                return result;
            }
            return bytes as any;
        }
    }

    static StringToUTF8 = function (str: string) {
        if (str) {
            // let uint8Array = new Uint8Array(bytes)
            let result = Base64.utf8_encode(str);
            return result;
        }
    }


    static StringToByte = function (str: string) {
        return DataHelper.TextEncoder.encode(str)
        // var ch, st, re: any = [];
        // for (var i = 0; i < str.length; i++) {
        //     ch = str.charCodeAt(i);
        //     st = [];

        //     do {
        //         st.push(ch & 0xFF);
        //         ch = ch >> 8;
        //     }

        //     while (ch);
        //     re = re.concat(st.reverse());
        // }
        // return re;
    }
    /**转二进制 */
    static ToBinary = function (num: number) {
        return (+num).toString(2).split("").reverse().map(Number);
    }

    static Uid2ServerId = function (uid: number) {
        return (uid ?? 0) >> 16
    }
}
