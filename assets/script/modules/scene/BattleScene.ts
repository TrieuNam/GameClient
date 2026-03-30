import { Asset, ImageAsset, Node, resources, sp, Sprite, Texture2D, view, _decorator } from "cc";
import { SingletonCom } from "core/SingletonCom";
import { Debugger } from "electron";
import { ResManager } from "manager/ResManager";
import { ViewManager } from "manager/ViewManager";
import { BattleView } from "modules/battle/BattleVIew";


const { ccclass, property } = _decorator;

//场景显示层
@ccclass('BattleScene')
export class BattleScene extends SingletonCom {
    @property({ type: Node })
    root: Node;

    @property({ type: Node })
    sceneBg: Node;

    @property({ type: Node })
    sceneMain: Node;

    @property({ type: Node })
    sceneTop: Node;

    // private _ui_img_bg:Imag
    get SceneMain() {
        return this.sceneMain;
    }

    onLoad() {
        super.onLoad();
        this.node.active = false;
        this.initScene();
    }

    initScene() {
        for (let index = 0; index < 12; index++) {
            let node = new Node(index + "")
            node.active = false;
            this.sceneMain.addChild(node);
        }
    }

    loadBg() {
        let node_sp: Node = this.sceneBg.getChildByName("bg");
        if (node_sp) {
            let sp: Sprite = node_sp.getComponent(Sprite);
            if (sp && !sp.spriteFrame) {
                ResManager.Inst().LoadSpriteFrame("loader/forest4", (err: any, sprite: any) => {
                    if (sprite) {
                        sp.spriteFrame = sprite;
                    }
                });
            }
        }
    }

    init(view: BattleView) {
        view.view._container.insertChild(this.node, 1);
        this.node.active = true;
    }
    end() {
        this.node.active = false;
        this.node.parent = undefined;
        ViewManager.Inst().CloseView(BattleView)
    }
}


