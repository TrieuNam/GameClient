import { HandleCollector } from "core/HandleCollector";
import { Singleton } from "core/Singleton";
import { RoleData } from "modules/role/RoleData";
import { ResPath } from "utils/ResPath";
import { SceneObjSpine } from "./SceneObjSpine";
import { UIModelShow } from "./UIModelShow";

export class MainPlayer extends Singleton {
    private _ui_obj: UIModelShow;
    private _data: RoleData;
    public get ui_obj(): UIModelShow {
        return this._ui_obj;
    }

    constructor() {
        super();
        this.init();
    }

    public init() {
        this._data = RoleData.Inst();
        this._ui_obj = UIModelShow.creat();
        this._ui_obj.setPath(ResPath.ActorRole(10001));
        this._ui_obj.setAppearance(this._data.GetAppearance());
    }

    protected onDestroy(): void {
        this._data = undefined;
    }
}