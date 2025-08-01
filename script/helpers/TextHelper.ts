import { Color } from "cc";
import * as fgui from "fairygui-cc";
import { KeyFunction } from "modules/common/CommonType";
import { Language, TextHelperUnits, TextHelperWord } from "modules/common/Language";
import { MathHelper } from "./MathHelper";

export function ColorStr(str: string | number, color: string) {
    return TextHelper.ColorStr(str, color);
}
export function Format(format: string, ...param_t: any[]) {
    return TextHelper.Format(format, ...param_t);
}
export class TextHelper {

    //文字添加颜色
    static ColorStr = function (str: string | number, color: string) {
        return `<color=#${color}>${str}</color>`;
    }



    //<outline color=#000000 width=2> </outline> 文字添加描边
    static RichTextOutLine = function (str: string, color: string, width?: number) {
        return `<outline color=#${color} width=${width ?? 2}>${str}</outline>`;
    }

    //文字添加图标
    static RichTextImg = function (package_name: string, resName: string): string {
        return "<img src='" + fgui.UIPackage.getItemURL(package_name, resName) + "'/>";
    }

    //文字改变大小
    static SizeStr = function (str: string | number, size: number) {
        return `<size=${size}>${str}</size>`;
    }

    //切割足够的文字，超出部分用suffix代替
    static TextSlice = function (text: string, length: number, suffix = ""): string {
        if (text.length <= length) {
            return text;
        }
        return text.slice(0, length) + suffix;
    }

    //例: TextHelper Format("小明今天吃了{0}个{1}", 25, "西瓜")
    // {0:FX}   固定小数点位数      Format("{0:F2}", 25) -> 25.00
    // {0:DX}   整数不够位数补零    Format("{0:D5}", 25) -> 00025 
    static Format = function (format: string, ...param_t: any[]) {
        let replacer = function (match: string, ...args: any[]) {
            let index = Number(args[0]);
            if (param_t[index] == undefined) {
                return match;
            }
            if (args[1] == "") {
                return param_t[index];
            }
            let match_val = param_t[index];
            if (args[2] == "F") {
                match_val = Number(match_val);
                let weishu = Number(args[3]);
                return MathHelper.PreciseDecimal(match_val, weishu).toFixed(weishu);
            }
            else if (args[2] == "D") {
                match_val = Number(match_val);
                let weishu = Number(args[3]);
                let test_val = match_val;
                for (let i = 1; i < weishu; i++) {
                    if (match_val < Math.pow(10, i)) {
                        test_val = '0' + test_val;
                    }
                }
                return test_val.toString();
            }
            return match;
        }
        return format.replace(/{(\d+)(|:(\w)(|\d+))}/g, replacer);
    }



    //普通数字转中文数字
    //暂时只支持-99999~99999之间的数
    static NumToWrord = function (num: number): string {
        let toWard = function (num: number, Unit: number): string {
            num = Math.floor(num);
            let leftNum = num / 10;
            let subNum = num % 10;
            leftNum = Math.floor(leftNum);
            subNum = Math.floor(subNum);
            let subWard = TextHelperWord[subNum];

            // console.log("num :  " + num);
            // console.log("Unit :  " + Unit);
            // console.log("subNum :  " + subNum);
            // console.log("leftNum :  " + leftNum);
            // console.log("subWard :  " + subWard);

            if (leftNum == 0) {
                if (Unit == 1 && subNum == 1 && leftNum == 0) //特殊处理10~19
                {
                    return TextHelperUnits[Unit];
                }
                else if (Unit == 0) { //特殊处理0~9
                    return subWard;
                }
                else {
                    return subWard + TextHelperUnits[Unit];
                }
            }
            else {
                let ward = toWard(leftNum, Unit + 1)
                if (subNum == 0 || Unit == 0) {
                    ward = ward + subWard
                }
                else {
                    let unitWord = TextHelperUnits[Unit];
                    ward = ward + subWard + unitWord;
                }
                return ward;
            }
        }
        let sign = "";
        if (num < 0) {
            num = -num;
            sign = Language.TextHelper.Negative;
        }
        //暂时只只支持小于99999的数
        if (num > 99999) {
            return "";
        }

        let ward = toWard(num, 0);
        // console.log("ward :  " + ward);
        //对多余的“零”进行处理
        // ward = ward.replace(TextHelperWord[0] + "+", TextHelperWord[0])
        while (ward.search(TextHelperWord[0] + TextHelperWord[0]) != -1) {
            ward = ward.replace(TextHelperWord[0] + TextHelperWord[0], TextHelperWord[0])
        }
        //清除最后的零
        if (ward.length > 1 && ward.charAt(ward.length - 1) == TextHelperWord[0]) {
            ward = ward.substring(0, ward.length - 1);
        }
        return sign + ward;
    }

    //添加文字间隔 spacing 1（添加一个空格符）  例子：（文字间隔  文 字 间 隔）
    static LetterSpacing = function (text: string, spacing: number): string {
        if (spacing > 0) {
            let textTemp = "";
            for (let index = 0; index < text.length; index++) {
                const element = text.charAt(index);
                textTemp = textTemp + element;
                if (index < text.length - 1) {
                    textTemp = textTemp + " ";
                }
            }
            text = textTemp;
        }
        return text;
    }

    //文字添加四色渐变
    //           左下           右下        左上        右上
    //colors = [COLORS.Blue1,COLORS.Red1,COLORS.Blue1,COLORS.Red1];
    static TextGradualChange = function (obj: fgui.GTextField, colors: Color[]) {
        const renderData = obj._label.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
            const color = colors[i];
            const colorR = color.r / 255;
            const colorG = color.g / 255;
            const colorB = color.b / 255;
            const colorA = color.a / 255;

            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    }
}
