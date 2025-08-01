import {_decorator, Component, MeshRenderer,Texture2D,Vec3, Vec2 } from "cc"
import { ResManager } from "manager/ResManager";
const { ccclass, property } = _decorator;

const csPosScale = 10;  //世界坐标 1米=服务端多少米
@ccclass('MapDisplayer')
export class MapDisplayer extends Component {

    @property({type:MeshRenderer})
    SceneQuad:MeshRenderer;

    private curMapName : string;
    
    private size : Vec2 = new Vec2(0,0);

    static  pixelPerMeter  : number = 62.5; //世界坐标 1米等于多少像素
    
    //载入地图数据
    public Display(mapName:string){
        if(this.curMapName == mapName){
            return;
        }
        this.curMapName = mapName;
        ResManager.Inst().Load<Texture2D>
        (`test_scene/${this.curMapName}/texture`,
            (err,tex)=>{
                if(err != null)
                {
                    console.error(err);
                    return;
                }
                this.SceneQuad.material.setProperty("mainTexture",tex);
                this.size.set(tex.width,tex.height);
                let quaScaNode = this.SceneQuad.node
                quaScaNode.scale = new Vec3(this.size.x/MapDisplayer.pixelPerMeter,this.size.y/MapDisplayer.pixelPerMeter,1);
                quaScaNode.position = new Vec3(quaScaNode.scale.x/2,quaScaNode.scale.y/2,0);

            }
        );
    }

    private static vec2Cache = new Vec2(0,0);
    //返回的vec2对象不能直接使用，需取出里面的数值使用
    public static  ServerToClientPos(x:number,y:number,out?:Vec2) : Vec2{
        if(out){
            out.set(x/csPosScale,y/csPosScale);
            return out;
        }
        MapDisplayer.vec2Cache.set(x/csPosScale,y/csPosScale);
        return MapDisplayer.vec2Cache;
    }

    public static ClientToServerPos(x:number,y:number,out?:Vec2) : Vec2{
        x = Math.round(x*csPosScale);
        y = Math.round(y*csPosScale);
        if(out){
            out.set(x,y);
            return out;
        }
        MapDisplayer.vec2Cache.set(x,y);
        return MapDisplayer.vec2Cache;
    }
    
}