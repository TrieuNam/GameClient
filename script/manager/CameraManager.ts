import { Camera, Canvas, Node, _decorator } from "cc";
import { SingletonCom } from "core/SingletonCom";

const { ccclass, property } = _decorator;
@ccclass('CameraManager')
export class CameraManager extends SingletonCom {
    @property({ type: Camera })
    camera: Camera;

    @property({ type: Canvas })
    canvas: Canvas;

    CameraShow() {
        if (this.camera) {
            this.camera.enabled = true;
        }
        if (this.canvas) {
            this.canvas.enabled = true;
        }
    }


}