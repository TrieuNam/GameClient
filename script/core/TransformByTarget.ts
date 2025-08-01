import { CCFloat, Component, game, Node, sp, tween, Tween, UITransform, Vec3, _decorator } from "cc";
import { IPoolObject } from "./ObjectPool";

const { ccclass, property } = _decorator;

@ccclass('TransformByTarget')
export class TransformByTarget extends Component implements IPoolObject {
    reInit?(): void {

    }
    onPoolReset(): void {
        this.clean();
    }
    @property({ type: Node })
    private _target: Node;
    private pos_fun: Function;
    private dis_vec3: Vec3;
    private vec3: Vec3;
    @property({ type: CCFloat })
    p_time: number = 0;

    private _speedX: number;
    private _speedY: number;

    // private pos_tween: Tween<Node>;
    onLoad() {
        let t = this;
        t.pos_fun = t.setPos.bind(t);
        // if (this.p_time) {
        //     this.pos_tween = tween(this.node);
        // }
    }

    set target(target: Node) {
        let t = this;
        t._target = target;
        if (target) {
            if (!t.vec3) {
                t.vec3 = new Vec3(0, 0, 0);
                if (!t.dis_vec3) {
                    t.dis_vec3 = new Vec3(0, 0, 0);
                }
                if (t.p_time) {
                    let speed = this.p_time;
                    let lTog = t._target.getComponent(UITransform).convertToWorldSpaceAR(t.dis_vec3);
                    let gTol = t.node.parent.getComponent(UITransform).convertToNodeSpaceAR(lTog);

                    let disX = t.vec3.x - gTol.x;
                    let disY = t.vec3.y - gTol.y
                    if (disX > 0) {
                        this._speedX = -speed
                    } else {
                        this._speedX = speed;
                    }

                    if (disY > 0) {
                        this._speedY = speed
                    } else {
                        this._speedY = -speed;
                    }
                    this._speedX = disX / this._speedX / +game.frameRate
                    this._speedY = disY / this._speedY / +game.frameRate
                }
                this.setPos();
            }
            return;
        }
        this.clean()
    }

    setDis(x: number, y: number) {
        let t = this;
        if (!t.dis_vec3) {
            t.dis_vec3 = new Vec3(x, y, 0);
        } else {
            t.dis_vec3.x = x;
            t.dis_vec3.y = y;
        }
    }

    private setPos() {
        let t = this;
        if (t._target) {
            let lTog = t._target.getComponent(UITransform).convertToWorldSpaceAR(t.dis_vec3);
            let gTol = t.node.parent.getComponent(UITransform).convertToNodeSpaceAR(lTog);
            if (t._speedX || t._speedX) {
                if ((t._speedX > 0 && t.vec3.x < gTol.x) || (t._speedX < 0 && t.vec3.x > gTol.x)) {
                    t.vec3.x += t._speedX;
                } else {
                    t._speedX = 0;
                }
                if ((t._speedY > 0 && t.vec3.y > gTol.y) || (t._speedY < 0 && t.vec3.y < gTol.y)) {
                    t.vec3.y += t._speedY;
                } else {
                    t._speedY = 0
                }
                // this.pos_tween.to(this.p_time, { position: t.vec3 }).start();
            } else {
                t.vec3.x = gTol.x;
                t.vec3.y = gTol.y;
            }
            t.node.position = t.vec3;
        } else {
            this.clean()
        }
    }


    lateUpdate(deltaTime: number) {
        let t = this;
        if (t._target && t._target.active && t.node.parent) {
            t.setPos();
        }
        // this.node.setPosition(0.0, 50, 0.0);
    }

    onDestroy() {
        this.clean();
    }

    private clean() {
        let t = this;
        t.node.active = false;
        // Timer.Inst().CancelTimer(t.timer);
        // t.timer = undefined;
        t.pos_fun = undefined;
        t.vec3.x = 0;
        t.vec3.y = 0;
    }
}