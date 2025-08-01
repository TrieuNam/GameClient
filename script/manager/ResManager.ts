import { Asset, assetManager, ImageAsset, resources, sp, SpriteFrame, Texture2D } from "cc";
import { Singleton } from "core/Singleton";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import * as fgui from "fairygui-cc";
import { ENUM_OBJ, ObjectPool } from "core/ObjectPool";
import { LogError } from "core/Debugger";



// singleton("ResManager")
export class ResManager extends Singleton {
    private _map_uiPackage: { [key: string]: boolean } = {};
    private _map_uiPackageLoading: { [key: string]: boolean } = {};

    constructor() {
        super();
        EventCtrl.Inst().on(CommonEvent.FGUI_PACKAGE, this.onFguiPackeDestory, this);
    }
    public hasPackage(name: string) {
        return this._map_uiPackage[name]
    }

    public addLoading(name: string) {
        this._map_uiPackageLoading[name] = true;
    }

    public removeLoading(name: string) {
        this._map_uiPackageLoading[name] = false;
    }

    public hasLoading(name: string) {
        return this._map_uiPackageLoading[name]
    }

    public onLoadPackage(name: string) {
        this._map_uiPackageLoading[name] = false;
        if (!this._map_uiPackage[name]) {
            EventCtrl.Inst().emit(CommonEvent.FGUI_PACKAGE_ONLOAD, name)
        }
        this._map_uiPackage[name] = true
    }

    public onRemovePackage(name: string) {
        delete this._map_uiPackage[name]
    }

    Load<T extends Asset>(paths: string,
        onCom: (err: Error | null, data: T) => void) {
        resources.load<T>(paths, onCom);
    }

    private onFguiPackeDestory(packName: string) {
        LogError("资源释放了：" + packName)
        this.onRemovePackage(packName);
        fgui.UIPackage.removePackage(packName);
    }

    LoadSpriteFrame<T extends Asset>(paths: string,
        onCom: (err: Error | null, data: T) => void) {
        resources.load<T>(paths + "/spriteFrame", onCom);
    }

    LoadOutSprite(type: ENUM_OBJ, url: string, cb: Function) {
        if (url) {

            // sf.texture = new Texture2D();
            assetManager.loadRemote(url, (error, image: any) => {
                if (image) {
                    let sf = ObjectPool.GetObjByCCPool(type, () => {
                        return SpriteFrame.createWithImage(image)
                    })
                    cb && cb(sf)
                }
            })
            // return sf;
        }
    }
}