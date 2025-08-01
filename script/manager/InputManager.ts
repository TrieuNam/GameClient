import { _decorator } from "cc";
import { SingletonCom } from "core/SingletonCom";
import { Event, GRoot } from "fairygui-cc";
// import { BattleData } from "modules/battle/BattleData";
import { SceneCtrl } from "modules/scene/SceneCtrl";
import { SceneData } from "modules/scene/SceneData";
// import { CameraManager } from "./CameraManager";
const { ccclass, property } = _decorator;


@ccclass("InputManager")
export class InputManager extends SingletonCom {
    onLoad() {
        super.onLoad();
        // this.node.on(Event.TOUCH_BEGIN, this.onTouchStart, this);
        // this.node.on(Event.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.on(Event.TOUCH_END,this.onTouchEnd,this);
        //  this.node.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        // input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        // input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        // let n = new Node()

    }


    onDestroy(): void {
        // Stage.isTouchOnUI
        // this.node.off(Event.TOUCH_BEGIN, this.onTouchStart, this);
        // this.node.off(Event.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.off(Event.TOUCH_END,this.onTouchEnd,this);
        // input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        // input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        // input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        // input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        super.onDestroy();
    }

    onTouchStart(eve: Event) {
        // if(BattleData.Inst().IsBattling){
        //     return;
        // }
        if (eve.target != GRoot.inst.node) {
            return;
        }
        // let scP = eve.ccPos;
        // let worldV = CameraManager.Inst().ScreenToWorldPos(scP.x, scP.y);
        // SceneCtrl.Inst().MainRoleMoveReq(worldV.x, worldV.y);
        // SceneData.Inst().MainRoleVo.pos.SetMoveToPos(worldV.x,worldV.y);
    }

    onTouchEnd(eve: Event) {

    }

    onTouchMove(eve: Event) {

    }

}