import { Vec2 } from "cc";
import { CreateSMD, ReleaseSMD, smartdata } from "data/SmartData";
import { ENUM_BATTLE_CHARACTER } from "modules/battle/BattleConf";
import { CommonStruct, TYPE_APPEARANCE } from "modules/common/CommonStruct";
import { SpineObjDirX, SPINE_ANI_STATE, SPINE_ANI_EVENT_STATE } from "./ObjSpineConfig";
import { SceneObjFightSpine, SceneObjSpine } from "./SceneObjSpine";

export class SceneObjVoBaseSpine {
    public static CreateById<T extends SceneObjVoBaseSpine>(cons: new () => T, id: string | number, id_arm: string, type = ENUM_BATTLE_CHARACTER.ROLE, pos?: Vec2, dirX: SpineObjDirX = SpineObjDirX.LEFT): T {
        let vo = SceneObjVoBaseSpine.Create(cons);
        vo.id = id + "";
        vo.drawer.id_arm = id_arm;
        vo.type = type;
        vo.drawer.anim.dirX = dirX;
        vo.pos = pos ? pos : new Vec2(0, 0);
        return vo;
    }
    public constructor() { }
    public static Create<T extends SceneObjVoBaseSpine>(cons: new () => T): T {
        return CreateSMD(cons);
    }

    static Destroy(vo: SceneObjVoBaseSpine) {
        ReleaseSMD(vo);
    }

    OnSMDCreate() {

    }

    OnSMDRelease() {

    }
    @smartdata
    id: string;
    drawer: SceneObjDrawerDataSpine = CreateSMD(SceneObjDrawerDataSpine);
    type: ENUM_BATTLE_CHARACTER;
    node: SceneObjSpine;
    move_speed = 0.1;
    pos: Vec2;
}

export class SceneObjDrawerDataSpine {
    @smartdata
    id_arm: string;

    @smartdata
    Appearance: TYPE_APPEARANCE;

    @smartdata
    anim: SceneObjAnimDataSpine;

    OnSMDCreate() {
        this.anim = CreateSMD(SceneObjAnimDataSpine);
        this.Appearance = CreateSMD(TYPE_APPEARANCE);
    }

    OnSMDRelease() {
        let t = this;
        ReleaseSMD(t.anim);
        ReleaseSMD(t.Appearance);
        t.anim = undefined;
        t.Appearance = undefined;
    }
}

export class SceneObjAnimDataSpine {
    @smartdata
    loopState: SPINE_ANI_STATE = SPINE_ANI_STATE.IDLE;
    @smartdata
    onceState: SPINE_ANI_STATE;
    @smartdata
    ani_time_scale: number = 1;
    @smartdata
    dirX = SpineObjDirX.LEFT;

    private list_ani_comp: { [key: string]: [(key: SPINE_ANI_STATE) => void, (key: SPINE_ANI_EVENT_STATE) => void] };
    setComp(type: SPINE_ANI_STATE, onceCb?: (type: SPINE_ANI_STATE) => void, onceEventCb?: (type: string) => void) {
        let comp = this.list_ani_comp[type]
        if (!comp) {
            comp = this.list_ani_comp[type] = [onceCb, onceEventCb];
        } else {
            comp[0] = onceCb;
            comp[1] = onceEventCb;
        }
    }

    getAniComp(type: string): (key: string) => void {
        return this.list_ani_comp[type] ? this.list_ani_comp[type][0] : undefined
    }
    getAniEventComp(type: string): (key: string) => void {
        return this.list_ani_comp[type] ? this.list_ani_comp[type][1] : undefined
    }
    OnSMDCreate() {
        this.list_ani_comp = {};
    }

    OnSMDRelease() {
        this.list_ani_comp = null;
    }
}

//--------------------------各功能自定义Vo--------------------------
export class SceneObjVoFightSpine extends SceneObjVoBaseSpine {
    @smartdata
    hp_max: number;
    @smartdata
    hp: number;
    @smartdata
    shield_max: number;
    @smartdata
    shield: number;

    index: number;
    index_show: number;

    node: SceneObjFightSpine;

    drawer: SceneObjFightDrawerDataSpine = CreateSMD(SceneObjFightDrawerDataSpine);

}

export class SceneObjFightDrawerDataSpine extends SceneObjDrawerDataSpine {
    @smartdata
    anim: SceneObjFightAnimDataSpine;

    isDeath = false;
    OnSMDCreate() {
        super.OnSMDCreate();
        this.anim = CreateSMD(SceneObjFightAnimDataSpine);
    }

    OnSMDRelease() {
        let t = this;
        super.OnSMDRelease();
        t.isDeath = false;
    }
}

export class SceneObjFightAnimDataSpine extends SceneObjAnimDataSpine {
    move_speed: number = 0.5;
}
//----------------------end 各功能自定义Vo end----------------------

