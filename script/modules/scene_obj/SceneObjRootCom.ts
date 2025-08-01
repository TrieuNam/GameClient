
import { _decorator, Component, Node, Vec2, tween, Vec3, Tween } from 'cc';
import { LogError } from 'core/Debugger';
const { ccclass, property } = _decorator;


@ccclass('SceneObjRootCom')
export class SceneObjRootCom extends Component {
    @property({ type: Node })
    private attachNode: Node;

    @property({ type: Node })
    private rotNode: Node;

    @property({ type: Node })
    private posNode: Node;

    @property({ type: Node })
    private rotOffNode: Node;

    private pos2D = new Vec2()
    private pos3D = new Vec3(0, 0, 0)

    public get AttachNode() {
        return this.attachNode;
    }

    public get RotNode() {
        return this.rotNode;
    }

    public get PosNode() {
        return this.posNode;
    }

    public get Pos() {
        this.pos2D.set(this.PosNode.position.x, this.PosNode.position.y);
        return this.pos2D;
    }

    public SetPos(x?: number, y?: number) {
        // console.error(`SetPos===x=${x},y=${y}`);
        let t = this;
        if (x != undefined) {
            t.pos3D.x = x;
        }
        if (y != undefined) {
            t.pos3D.y = y;
        }
        t.posNode.position.set(t.pos3D);
    }

    public SetRot(y: number) {
        this.rotNode.eulerAngles = this.rotNode.eulerAngles.set(0, y, 0);
    }

    public get Rot() {
        return this.rotNode.eulerAngles.y;
    }

    public SetOffRot(x: number, z: number = 0) {
        this.rotOffNode.eulerAngles = this.rotOffNode.eulerAngles.set(x, 0, z);
    }

    public Move(x: number, y: number, target?: Node, time: number = 1, func?: Function) {
        let t = this;
        let pos: Vec3;
        if (target) {
            pos = target.position
        } else {
            pos = t.pos3D
        }
        if (pos.x == x && pos.y == y) {
            func && func();
            return;
        }
        if (target == undefined) {
            target = t.posNode;
        }
        if (x != undefined) {
            pos.x = x;
        }
        if (y != undefined) {
            pos.y = y;
        }

        let tw = tween(target).to(time, { position: pos });
        if (func) {
            tw.delay(0.1);
            tw.call(func);
            Tween.stopAllByTarget(target)
        }
        tw.start();
    }

    public setIndex(index = NaN) {
        let t = this;
        let p = t.node.parent;
        if (p) {
            t.node.setSiblingIndex(isNaN(index) ? p.children.length : index);
        }
    }
}
