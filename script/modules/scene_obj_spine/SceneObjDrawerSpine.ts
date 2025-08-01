import { Node } from "cc";
import { HandleCollector } from "core/HandleCollector";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { SMDHandle } from "data/HandleCollectorCfg";
import { AngelData } from "modules/Angel/AngelData";
import { TYPE_APPEARANCE, CommonStruct } from "modules/common/CommonStruct";
import { FashionData } from "modules/fashion/FashionData";
import { MountData } from "modules/mount/MountData";
import { BodyObjSpine } from "./BodyObjSpine";
import { SceneObjDrawerDataSpine } from "./SceneObjVoSpine";



export class SceneObjDrawerSpine implements IPoolObject {
    private _data: SceneObjDrawerDataSpine
    private _body: BodyObjSpine;
    private _cb: Function;
    private _handle: HandleCollector;
    private _root: Node;
    public get body(): BodyObjSpine {
        return this._body;
    }

    public static GetAppearanceRes(appearance: TYPE_APPEARANCE, show_mount: boolean = false, show_Angel: boolean = true) {
        let out_appearance = {} as TYPE_APPEARANCE;
        if (appearance.surfaceHead > 0) {
            out_appearance.surfaceHead = FashionData.Inst().GetCFGFashionClothesId(appearance.surfaceHead).res_id;
        }
        if (appearance.surfaceBody > 0) {
            out_appearance.surfaceBody = FashionData.Inst().GetCFGFashionClothesId(appearance.surfaceBody).res_id;
        }
        if (show_mount) {
            if (appearance.surfaceMount >= 0) {
                out_appearance.surfaceMount = MountData.Inst().GetCfgMountApp(appearance.surfaceMount);
            }
        }
        if (appearance.surfaceShield > 0) {
            out_appearance.surfaceShield = FashionData.Inst().GetCFGFashionClothesId(appearance.surfaceShield).res_id;
        }
        if (appearance.surfaceWeapon > 0) {
            out_appearance.surfaceWeapon = FashionData.Inst().GetCFGFashionClothesId(appearance.surfaceWeapon).res_id;
        }
        if (show_Angel) {
            if (appearance.surfaceAngel > -1) {
                out_appearance.surfaceAngel = AngelData.Inst().GetCfgRes(appearance.surfaceAngel).angle_res_id;
            }
        }
        return CommonStruct.AppearanceParam(out_appearance, out_appearance);

    }

    public static Create(data: SceneObjDrawerDataSpine, root: Node, cb?: Function): SceneObjDrawerSpine {
        let re = ObjectPool.Get(SceneObjDrawerSpine, data, root, cb);
        return re;
    }

    constructor(data: SceneObjDrawerDataSpine, root: Node, cb?: Function) {
        this.reInit(data, root, cb);
    }

    reInit(data: SceneObjDrawerDataSpine, root: Node, cb?: Function): void {
        let t = this;
        t._data = data
        t._root = root;
        t._cb = cb;
        t._handle = HandleCollector.Create();
    }

    onPoolReset(): void {
        let t = this;
        HandleCollector.Destory(t._handle);
        t._handle = undefined;

        t._body.Destory();
        t._body = undefined;
        t._cb = undefined;
        t._root = undefined;
    }

    public flushMain(src: string) {
        let t = this;
        if (t._body) {
            t._body.Destory();
        }
        t._body = BodyObjSpine.Create(this._root, t._data.anim);
        t._body.SetPath(src, () => {
            t.onflushMain();
        });
    }

    private onflushMain() {
        let t = this;
        t._cb && t._cb();
        t.flushWeapon();
        t.flushShield();
        t.flushHead();
        t.flushFazhen();
        t.flushMount();
        t.flushBody();
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushWeapon.bind(t), "surfaceWeapon"));
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushShield.bind(t), "surfaceShield"));
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushHead.bind(t), "surfaceHead"));
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushBody.bind(t), "surfaceBody"));
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushMount.bind(t), "surfaceMount"));
        t._handle.Add(SMDHandle.Create(t._data.Appearance, t.flushFazhen.bind(t), "surfaceAngel"));
    }

    public flushWeapon() {
        let t = this;
        t._body.flushWeapon(t._data.Appearance.surfaceWeapon);
    }

    public flushShield() {
        let t = this;
        t._body.flushShield(t._data.Appearance.surfaceShield);
    }

    public flushHead() {
        let t = this;
        t._body.flushHead(t._data.Appearance.surfaceHead);
    }

    public flushBody() {
        let t = this;
        t._body.flushBody(t._data.Appearance.surfaceBody);
    }

    public flushFazhen() {
        let t = this;
        t._body.flushFazhen(t._data.Appearance.surfaceAngel);
    }

    public flushMount() {
        let t = this;
        t._body.flushMont(t._data.Appearance.surfaceMount);
    }

    public Destroy() {
        ObjectPool.Push(this);
    }

}