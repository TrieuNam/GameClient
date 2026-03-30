import { _decorator } from "cc";
import { SingletonCom } from "core/SingletonCom";
import { smartdata, SmartDatRouter } from "data/SmartData";
// import { CameraManager } from "./CameraManager";
const { ccclass } = _decorator;



//游戏内所有刷帧入口
@ccclass('Looper')
export class Looper extends SingletonCom {


    private deltaTime: number;
    private frameCount: number = 0;

    private loopFuncs = new Set<Function>();
    public get DeltaTime() {
        return this.deltaTime;
    }

    public get FrameCount() {
        return this.frameCount;
    }
    constructor() {
        super();
        SmartDatRouter.Init();
    }

    update(deltaTime: number) {
        ++this.frameCount;
        this.deltaTime = deltaTime;
        //data
        SmartDatRouter.Update();

        for (let func of this.loopFuncs) {
            func();
        }

        // CameraManager.Inst().Update();
        //Logic
    }



    BeginLoop(func: Function) {
        this.loopFuncs.add(func);
    }

    StopLoop(func: Function) {
        this.loopFuncs.delete(func);
    }







}
