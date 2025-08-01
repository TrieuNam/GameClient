
import { Color } from "cc";
import * as fgui from "fairygui-cc";
import { CommonId } from "modules/common/CommonEnum";
import { KeyFunction } from "modules/common/CommonType";
import { EGLoader } from "modules/extends/EGLoader";
import { TextHelper } from "./TextHelper";

// export let UH: KeyFunction = {};
export class UH {
    //设置文字
    static SetText = function (obj: fgui.GTextField | fgui.GRichTextField | fgui.GButton | fgui.GLabel, str: string | number, color?: Color) {
        if (obj == null || obj == undefined) { return; }
        if (str == null) { str = "" }
        if (typeof (str) == "number") { str = str.toString() }
        if (color == null) {
            if (obj.text == str) { return; }
            obj.text = str;
        }
        else {
            if (obj.node.name == "GRichTextField") {
                let new_str = TextHelper.ColorStr(str, color.toHEX("#rrggbb"))
                if (obj.text == new_str) { return; }
                obj.text = new_str;
            }
            else {
                if (obj.text != str)
                    obj.text = str;
                obj.color = color;
            }
        }
    }

    //mtype = CommonEnum中的 ICON_TYPE
    static SetIcon = function (obj: fgui.GLoader, icon_id: string | number, mtype?: number | string) {
        if (icon_id != null) {
            obj.icon = EGLoader.IconGeterFuncs[mtype](icon_id);
        }
    }

    //动态设置fgui loader图片
    static SpriteName = function (obj: fgui.GLoader | fgui.GTextField | fgui.GLabel, package_name: string, name: string) {
        if ((obj as any)['_contentItem'] && (obj as any)['_contentItem'].name == name) {
            return
        }
        obj.icon = fgui.UIPackage.getItemURL(package_name, name);
    }

    //动态设置fgui loader图片
    static SpriteNameLoader = function (obj: fgui.GLoader | fgui.GTextField, url: string) {
        if ((obj as any)['_contentItem'] && (obj as any)['_contentItem'].name == url) {
            return
        }
        obj.icon = url;
    }

    //显示公用图集里的货币图标
    static GoldIcon = function (obj: fgui.GLoader | fgui.GTextField, item_id: CommonId) {
        UH.SpriteName(obj, "CommonAtlas", `Item${item_id}`)
    }

    static ActivatorPosition = function (obj: any, flag: boolean, x1: number, y1: number, x2: number, y2: number) {
        if (flag) {
            obj.setPosition(x1, y1);
        }
        else {
            obj.setPosition(x2, y2);
        }
    }

    static FontName = function (obj: fgui.GTextField, package_name: string, name: string) {
        obj.font = fgui.UIPackage.getItemURL(package_name, name);
    }
}
