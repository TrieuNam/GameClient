import { Vec2 } from "cc";
import { smartdata } from "./SmartData";


export class SMDVec2 extends Vec2{
    @smartdata
    x:number = 0;
    @smartdata
    y:number = 0;

    OnSMDCreate(){
        // console.error("SMVec2====ONSMCreator");
    }

    OnSMDRelease(){
        // console.error("SMVec2====OnSmRelease");
    }   
}