import { Vec3,Vec2 } from "cc";
import { SMDVec2 } from "data/SMDVec2";
import { CreateSMD, ReleaseSMD, smartdata, SMDTriggerNotify } from "data/SmartData";


export enum SceneObjLoopState{
    Idle = 0,
    Run = 1,
}


export enum AvatarType{
    JiaoNan = 0,
    HeiNv = 1,
}

export enum SceneObjType{
    Role,
    Npc,
} 

export class SceneObjAnimData{
    @smartdata
    loopState = SceneObjLoopState.Idle;
}

export class SceneRoleDrawerData{    
    @smartdata
    avatar : AvatarType = 0;
    @smartdata
    skinId : number = 0;
    @smartdata
    rideId : number = 0;
    @smartdata
    rideSkinId : number = 0;
    @smartdata
    weaponId : number = 0;
    @smartdata
    weaponSkinId : number = 0;
    @smartdata
    anim:SceneObjAnimData;

    SetProto(proto : IPB_Appearance){
        this.avatar = proto.avatarType;
        this.skinId = proto.surfaceFashion;
        this.rideId = proto.surfaceMount;
        this.weaponId = proto.surfaceWeapon;
    }

    OnSMDCreate(){
        this.anim = CreateSMD(SceneObjAnimData);
    }

    OnSMDRelease(){
        ReleaseSMD(this.anim);
        this.anim = null;
    }

}

export class SceneObjDrawerData{
    @smartdata
    type : number;
    @smartdata
    typeId : number;
    @smartdata
    anim:SceneObjAnimData;
    OnSMDCreate(){
        this.anim = CreateSMD(SceneObjAnimData);
    }

    OnSMDRelease(){
        ReleaseSMD(this.anim);
        this.anim = null;
    }
}


export class SceneObjVoBase{

    protected static _create<T extends SceneObjVoBase>(cons: new () => T) : T{
        return CreateSMD(cons);
    }

    static Destroy(vo : SceneObjVoBase){
        ReleaseSMD(vo);
    }

    OnSMDCreate(){
        this.pos = CreateSMD(SceneObjPosData);
    }

    OnSMDRelease(){
        ReleaseSMD(this.pos);
        this.pos = null;
    }
    @smartdata
    objId:number = -1;
    @smartdata
    sceneId:number = -1;
    pos:SceneObjPosData = null;
    drawer : SceneRoleDrawerData | SceneObjDrawerData;
    moveSpeed : number = 7; //默认移动速度
} 




export class SceneObjPosData{
    //显示层
    posFunc : ()=>Vec2 = null;
    SetPosFunc(func : ()=>Vec2){
        this.posFunc = func;
    }
    get Pos() : Vec2{
        if(this.posFunc){
            return this.posFunc();  //时实与场景node的位置保持同步
        }
        else{
            return this.lastPos;
        }
    }
    

    OnSMDRelease(){
        this.posFunc = null;
    }

    SetMoveToPos(x:number,y:number){
        if(this.posFunc){
            let nowPos = this.Pos;
            if(nowPos.x == x && nowPos.y == y){
                return;
            }
        }
        this.moveToPos.set(x,y);
        this.lastPos.set(x,y);
        SMDTriggerNotify(this,"moveToPos");
    }

    SetJumpToPos(x:number,y:number){
        if(this.posFunc){
            let nowPos = this.Pos;
            if(nowPos.x == x && nowPos.y == y){
                return;
            }
        }
        this.jumpToPos.set(x,y);
        this.lastPos.set(x,y);
        // console.error("setx=" + x + "," + y);
        SMDTriggerNotify(this,"jumpToPos");
    }

    //逻辑层
    @smartdata
    moveToPos = new Vec2();//移动的目标点

    @smartdata
    jumpToPos = new Vec2();//跳转到的目标点

    lastPos = new Vec2();
}

export class SceneRoleVo extends SceneObjVoBase{

    public static Create(){
        return SceneObjVoBase._create(SceneRoleVo);
    }
    roleId : number;
    drawer : SceneRoleDrawerData = CreateSMD(SceneRoleDrawerData);
    
    // targetPos:Vec2 = new Vec2(0,0);

    // stateData:{
    //     curPos:Vec2;
    //     curAnim:string;
    // }

}

export  class SceneObjVo extends SceneObjVoBase{
    public static Create(){
        return SceneObjVoBase._create(SceneObjVo);
    }

    drawer : SceneObjDrawerData = CreateSMD(SceneObjDrawerData);
    typeId : number = 0;
    // drawer : MainBodyOnlyDrawerData;
}