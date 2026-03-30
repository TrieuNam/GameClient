import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AccordionData, AccordionThreeData } from "modules/common/CommonType";
import { UH } from "../../helpers/UIHelper";
import { RedPoint } from "./RedPoint";

/* 传入的结构如：
    let data_list:AccordionData[] = [
        {data:{index:0,name:"父节点"},
        child:[
                {index:0,name:"子节点"},
                {index:1,name:"子节点"},
                {index:2,name:"子节点"},
        ]}
    ]; 
*/

/* 传入的结构如：
    let data_list: AccordionThreeData[] = [
        {data: {index: 0, name: "父节点"},
            child: [
                {
                    data: {index: 0, name: "子节点"},
                    child: [
                        {index: 0, name: "子子节点1"}
                    ]
                },
            ]
        },
    ];          
*/

export class AccordionList extends fgui.GComponent {
    viewNode = {
        List: <fgui.GTree>null,
    }

    private _click_listener: Function;
    private _listener_target: any;
    private node_list = new Map<number, fgui.GTreeNode[]>();

    protected onConstruct(): void {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.List.treeNodeRender = this.renderTreeNode.bind(this);
    }

    public SetData(data: AccordionData[]) {
        let node_list: fgui.GTreeNode[] = [];
        for (const parent_data of data) {
            let parent: fgui.GTreeNode = new fgui.GTreeNode(true);
            parent.data = parent_data.data;
            this.viewNode.List.rootNode.addChild(parent);
            for (const child_data of parent_data.child) {
                let child: fgui.GTreeNode = new fgui.GTreeNode(false);
                child.data = child_data;
                parent.addChild(child);
            }
            node_list.push(parent);
        }
        this.node_list.set(1, node_list);
    }

    public SetThreeData(data: AccordionThreeData[]) {
        let node_list: fgui.GTreeNode[] = [];
        let child_list: fgui.GTreeNode[] = [];
        for (const parent_data of data) {
            let parent: fgui.GTreeNode = new fgui.GTreeNode(true);
            parent.data = parent_data.data;
            this.viewNode.List.rootNode.addChild(parent);
            for (const child_data of parent_data.child) {
                let child: fgui.GTreeNode = new fgui.GTreeNode(true);
                child.data = child_data.data;
                parent.addChild(child);
                for (const child_child_data of child_data.child) {
                    let child_child: fgui.GTreeNode = new fgui.GTreeNode(false);
                    child_child.data = child_child_data;
                    child.addChild(child_child);
                }
                child_list.push(child);
            }
            node_list.push(parent);
        }
        this.node_list.set(1, node_list);
        this.node_list.set(2, child_list);
    }

    public OnClick(listener: Function, target: any): void {
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);
        this._click_listener = listener;
        this._listener_target = target;
    }

    private onClickItem(itemObject: fgui.GObject) {
        if (itemObject.treeNode.expanded === undefined) {
            this._click_listener.call(this._listener_target, itemObject.treeNode);
        }
        if (itemObject.treeNode.isFolder) {
            let node_list = this.node_list.get(itemObject.treeNode.level);
            if (node_list != undefined && node_list.length != 0) {
                for (const node of node_list) {
                    if (node !== itemObject.treeNode && node.isFolder && node.expanded === true) {
                        this.viewNode.List.collapseAll(node);
                    }
                }
            }

            if (itemObject.treeNode.expanded === false) {
                this.viewNode.List.unselectNode(itemObject.treeNode);
            } else {
                this.expandedSelectItem(itemObject.treeNode);
            }
        }
    }

    //展开默认选择红点item
    private expandedSelectItem(treeNode: fgui.GTreeNode){
        for (let index = 0; index < treeNode.numChildren; index++) {
            const element = treeNode.getChildAt(index);
            if(element.isFolder){
                for (let index_1 = 0; index_1 < element.numChildren; index_1++) {
                    const element_1 = element.getChildAt(index_1);
                    if(element_1.data.redNumber === 1){
                        this.viewNode.List.selectNode(element_1);
                        return
                    }
                }
            }else{
                if(element.data.redNumber === 1){
                    this.viewNode.List.selectNode(element);
                    return
                }
            }   
        }

        var childNode = treeNode.getChildAt(0);
        if (childNode.isFolder) {
            var childChildNode = childNode.getChildAt(0);
            this.viewNode.List.selectNode(childChildNode);
        } else {
            this.viewNode.List.selectNode(childNode);
        }

    }

    private getItemChild(data: { parent: number, child: number, childChild?: number }) {
        let parent = this.node_list.get(1)[data.parent];
        let child: fgui.GTreeNode;
        if (parent !== null) {
            if (data.childChild !== undefined) {
                let mChild = parent.getChildAt(data.child);
                if (mChild !== null) {
                    child = mChild.getChildAt(data.childChild);
                }
            }
            else {
                child = parent.getChildAt(data.child);
            }
        }

        return child;
    }

    //选择Item
    public SetSelectItem(data: { parent: number, child: number, childChild?: number }) {
        let child = this.getItemChild(data);
        if (child !== null) {
            this.viewNode.List.selectNode(child);
            this._click_listener.call(this._listener_target, child);
        }
    }

     //设置Item红点显示
    public SetItemRedPoint(data: { parent: number, child: number, childChild?: number }, isShow: boolean) {
        let child = this.getItemChild(data);
        if (child !== null) {
            let num = isShow ? 1 : 0;
            child.data.redNumber = num;
            if (child._cell) {
                let item = child._cell as AccordionItem;
                item.SetRedPointNum(num);
            }

            if (!isShow) {
                let parent = child.parent;
                for (let index = 0; index < parent.numChildren; index++) {
                    if (parent.getChildAt(index)._cell) {
                        const element = parent.getChildAt(index)._cell as AccordionItem;
                        if (element.GetRedPointNum() === 1) {
                            num = 1;
                            break;
                        }
                    } else {
                        if (parent.getChildAt(index).data.redNumber === 1) {
                            num = 1;
                            break;
                        }
                    }
                }
                parent.data.redNumber = num;
                if (parent._cell) {
                    let parentItem = parent._cell as AccordionItem;
                    parentItem.SetRedPointNum(num);
                }
                if (data.childChild !== undefined) {
                    parent = parent.parent;
                    for (let index = 0; index < parent.numChildren; index++) {
                        const element_1 = parent.getChildAt(index);
                        for (let index_1 = 0; index_1 < element_1.numChildren; index_1++) {
                            if (element_1.getChildAt(index_1)._cell) {
                                const element_2 = element_1.getChildAt(index_1)._cell as AccordionItem;
                                if (element_2.GetRedPointNum() === 1) {
                                    num = 1;
                                    break;
                                }
                            } else {
                                if (element_1.getChildAt(index_1).data.redNumber === 1) {
                                    num = 1;
                                    break;
                                }
                            }
                        }
                    }
                    parent.data.redNumber = num;
                    if (parent._cell) {
                        let parentItem = parent._cell as AccordionItem;
                        parentItem.SetRedPointNum(num);
                    }
                }

            } else {
                child.parent.data.redNumber = num;
                if (child.parent._cell) {
                    let mChild = child.parent._cell as AccordionItem;
                    mChild.SetRedPointNum(num);
                }
                if (data.childChild !== undefined) {
                    child.parent.parent.data.redNumber = num;
                    let parent = child.parent.parent._cell as AccordionItem;
                    parent.SetRedPointNum(num);
                }
            }

        }
    }


    private renderTreeNode(node: fgui.GTreeNode, obj: AccordionItem) {
        if (node.level == 1)
            obj.SetParentName(node.data.name);
        else if (node.level == 2)
            obj.SetChildName(node.data.name);
        else if (node.level == 3)
            obj.SetChildChildName(node.data.name);

        let num = (node.data.redNumber && node.data.redNumber === 1) ? 1 : 0;
        obj.SetRedPointNum(num);
    }

    //外部使用自己的item资源 外部拓展并继承于AccordionItem
    public SetDefaultItem(defaultItem: string) {
        this.viewNode.List.defaultItem = defaultItem;
    }
}

export class AccordionItem extends fgui.GButton {
    private viewNode = {
        ParentName: <fgui.GTextField>null,
        ParentSelectName: <fgui.GRichTextField>null,
        ChildName: <fgui.GTextField>null,
        ChildSelectName: <fgui.GTextField>null,
        ChildChildName: <fgui.GTextField>null,
        ChildChildSelectName: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,

    };

    private redPointNum: number;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
    }
    public SetParentName(parent_name: string) {
        UH.SetText(this.viewNode.ParentName, parent_name);
        UH.SetText(this.viewNode.ParentSelectName, parent_name);
    }
    public SetChildName(child_name: string) {
        UH.SetText(this.viewNode.ChildName, child_name);
        UH.SetText(this.viewNode.ChildSelectName, child_name);
    }
    public SetChildChildName(child_child_name: string) {
        UH.SetText(this.viewNode.ChildChildName, child_child_name);
        UH.SetText(this.viewNode.ChildChildSelectName, child_child_name);
    }

    public SetRedPointNum(num: number) {
        this.redPointNum = num;
        this.viewNode.RedPoint.SetNum(num);
    }

    public GetRedPointNum() {
        return this.redPointNum;
    }
}