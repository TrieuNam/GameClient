import { LogError } from "core/Debugger";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { CreateSMD, SmartDatRouter } from "data/SmartData";
import { GComponent } from "fairygui-cc";
import { CommonStruct, TYPE_APPEARANCE } from "modules/common/CommonStruct";
import { SpineObjDirX, SPINE_ANI_STATE, SPINE_ANI_SLOT } from "./ObjSpineConfig";
import { SceneObjDrawerSpine } from "./SceneObjDrawerSpine";
import { SceneObjDrawerDataSpine } from "./SceneObjVoSpine";
import { NodePools } from "core/NodePools";
import { Node } from "cc";

export class UIModelShow extends GComponent implements IPoolObject {
    reInit(path?: string): void {
        this._invalid = false;
        this.setPath(path);
    }
    onPoolReset(): void {
        this._invalid = true;
        this._isLoad = false;
        this._path = undefined;
        if (this._draw_data) {
            this._draw_data.OnSMDRelease();
            this._draw_data = undefined;
        }
    }
    static Destory(obj: UIModelShow) {
        ObjectPool.Push(obj);
    }
    static creat(path?: string) {
        let obj = ObjectPool.Get(UIModelShow, path);
        obj._isIPool = true;
        return obj;
    }
    private _path: string;
    private _draw_obj: SceneObjDrawerSpine;
    private _draw_data: SceneObjDrawerDataSpine;
    private _extre: { [key: string]: Node | number };
    private _invalid = false;
    private _isLoad = false;
    _isIPool = false;
    constructor(path?: string) {
        super();
        this.reInit(path);
    }
    protected onConstruct() {
    }

    public setPath(path: string, appear?: TYPE_APPEARANCE, dirX: SpineObjDirX = SpineObjDirX.LEFT) {
        if (!path) {
            return;
        }
        if (!this._draw_obj) {
            if (!this._draw_data) {
                this._draw_data = CreateSMD(SceneObjDrawerDataSpine);
            }
            appear && CommonStruct.AppearanceParam(appear, this._draw_data.Appearance);
            this._draw_obj = SceneObjDrawerSpine.Create(this._draw_data, this._container, () => {
                this._isLoad = true;
            });
        }
        this._draw_data.anim.dirX = dirX;
        if (this._path == path) {
            return
        }
        this._path = path;
        this._isLoad = false;
        this._draw_obj.flushMain(this._path);
    }

    public setAppearance(appear: TYPE_APPEARANCE) {
        if (!this._draw_data) {
            this._draw_data = CreateSMD(SceneObjDrawerDataSpine);
        }
        CommonStruct.AppearanceParam(appear, this._draw_data.Appearance);
    }

    public setWeaponSkin(id: number) {
        this._draw_data.Appearance.surfaceWeapon = id;
    }

    public setShiledSkin(id: number) {
        this._draw_data.Appearance.surfaceShield = id;
    }

    public setHeadSkin(id: number) {
        this._draw_data.Appearance.surfaceHead = id;
    }

    public setBodySkin(id: number) {
        this._draw_data.Appearance.surfaceBody = id;
    }

    public setAngelSkin(id: number) {
        this._draw_data.Appearance.surfaceAngel = id;
    }

    public setMountSkin(id: number) {
        this._draw_data.Appearance.surfaceMount = id;
    }


    public flushMain() {
        if (this._path == null) {
            return
        }
        this._draw_obj.flushMain(this._path);
    }

    /**
     * 设置播放动画
     * @param name 动画名字
     * @param is_once 是否播放一次
     */
    public setAniName(name: SPINE_ANI_STATE, is_once = false, onceCb?: (type: SPINE_ANI_STATE) => void) {
        this._draw_data.anim.setComp(name, onceCb);
        is_once ? this._draw_data.anim.onceState = name : this._draw_data.anim.loopState = name;
    }

    /**
     * 设置播放动画速度
     */
    public setAniSpeed(speed: number) {
        this._draw_data.anim.ani_time_scale = speed;
    }

    onDestroy() {
        if (this._isIPool) {
            ObjectPool.Push(this);
        } else {
            this.onPoolReset();
        }
    }

    dispose() {
        if (this._draw_obj) {
            this._draw_obj.Destroy();
            this._draw_obj = undefined;
        }
        super.dispose();
    }

    setSkin2(type: SPINE_ANI_SLOT, path: string) {
        this._draw_obj.body.setSkin2(type, path);
    }
}