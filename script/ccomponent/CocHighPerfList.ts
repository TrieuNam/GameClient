import { Component, HtmlTextParser, Node, _decorator } from "cc";
import { Event, GComponent, GObject } from "fairygui-cc";
import { TYPE_TIMER } from "modules/time/Timer";

const { ccclass, property } = _decorator;

@ccclass("CocHighPerfList")
export class CocHighPerfList extends Component {
    private p: Node;
    private _ht: TYPE_TIMER;
    onLoad() {
        let t = this;
        // const _owner: GComponent = <GComponent>GObject.cast(t.node);
        t.node.on(Node.EventType.CHILD_ADDED, t.reList, t);
        t.node.on(Node.EventType.CHILD_REMOVED, t.reList, t);
        let p = t.node.parent;
        while (p && p.name != "GList") {
            p = p.parent;
        }
        if (p) {
            t.p = p;
            p.on(Event.SCROLL, t.reList, t);
            p.on(Event.SETDATA, t.reList, t);
        }
    }

    onEnable() {
        this.reList(true);
    }

    onDestroy() {
        let t = this;
        t.node.off(Node.EventType.CHILD_ADDED, t.reList, t);
        t.node.off(Node.EventType.CHILD_REMOVED, t.reList, t);
        if (t.p) {
            t.p.off(Event.SCROLL, t.reList, t);
            t.p.off(Event.SETDATA, t.reList, t);
        }
        let node = t.node;
        node.children2 && (node.children2 = undefined);
    }

    private reList(isInit = true) {
        let t = this;
        let node = t.node;
        let c = node.children;

        let levels: Node[][] = [];
        let level = 0;
        let fun_reList = t.reList;
        let fun = function fun(node: Node) {
            let lvs = levels[level] = levels[level] || [];
            if (node) {
                if (node.name != "Container") {
                    lvs.push(node);
                    if (isInit && (node.name == "UIEffectShow" || node.name == "GRichTextField")) {
                        node.once(Node.EventType.CHILD_ADDED, fun_reList, t);
                    }
                };
                node.children.forEach(function (element) {
                    level += 1;
                    fun(element);
                });
            }
        };

        c.forEach(function (element) {
            fun(element);
            level = 0;
        });

        node.children2 = [].concat(...levels);
    }
}