import { assetManager, CacheMode, SpriteFrame } from "cc";
import * as fgui from "fairygui-cc";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { KeyFunction } from "modules/common/CommonType";

let bundle_path = "loader/icon/";

export class EGLoader extends fgui.GLoader {
    private completeCallback: Function = null;
    private tex: SpriteFrame;
    protected freeExternal(texture: SpriteFrame): void {
        //texture.destroy();
        //console.warn("freeExternal");
    }

    protected onExternalLoadSuccess(texture: SpriteFrame): void {
        this.clean();
        this.tex = texture;
        texture.addRef();
        super.onExternalLoadSuccess(texture);
        if (this.completeCallback) {
            this.completeCallback();
        }
    }

    public SetLoadCompleteCallback(func?: Function) {
        this.completeCallback = func;
    }

    //path 资源路径
    //func 完成回调
    public SetIcon(path: string, func?: Function) {
        this.SetLoadCompleteCallback(func);
        this.icon = path;
    }
    protected onDestroy(): void {
        super.onDestroy();
        this.clean();
    }
    public clean(): void {
        if (this.tex) {
            let tex = this.tex;
            tex.decRef();
            this.tex = null;
            // assetManager.releaseAsset(tex);
        }
    }
    public static IconGeterFuncs: KeyFunction = {
        [ICON_TYPE.ITEM]: (icon_id: string) => {
            return bundle_path + "item/" + icon_id;
        },
        [ICON_TYPE.SKILL]: (id: string) => {
            return bundle_path + "skill/" + id;
        },
        [ICON_TYPE.SUIT]: (id: string) => {
            return bundle_path + "suit/" + id;
        },
        [ICON_TYPE.TITLE]: (id: string) => {
            return bundle_path + "title/" + id;
        },
        [ICON_TYPE.ACT]: (id: string) => {
            return bundle_path + "act/" + id;
        },
        [ICON_TYPE.Role]: (id: string) => {
            return bundle_path + "role/" + id;
        },
        [ICON_TYPE.Enter]: (id: string) => {
            return bundle_path + "ent/" + id;
        },
        [ICON_TYPE.KaoGu]: (id: string) => {
            return bundle_path + "kaogu/" + id;
        },
        [ICON_TYPE.FaZhen]: (id: string) => {
            return bundle_path + "fazhen/" + id;
        },
        [ICON_TYPE.ShenQi]: (id: string) => {
            return bundle_path + "shenqi/" + id;
        },
    }
}