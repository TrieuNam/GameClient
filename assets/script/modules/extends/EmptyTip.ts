import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";

enum BG_TYPE
{
    Deep = 1,//深色
    Light = 2//浅色
}


// export class EmptyTip extends fgui.GComponent {
//     private viewNode = {
//         kuangone:<fgui.GImage>null,
//         kuangtwo:<fgui.GImage>null,
//         text:<fgui.GTextField>null,
//     };

//     public constructor() {
//         super();
//     }

//     protected onConstruct(): void {
//         ViewManager.Inst().RegNodeIofo(this.viewNode,this);
//     }

//     public SetText(value:string){
//         this.viewNode.text.text = value;
//     }

//     public SetBgType(type:number){
//         let show = true;
//         switch (type) {
//             case BG_TYPE.Deep:
//                 show = true;
//                 break;
        
//             case BG_TYPE.Light:
//                 show = false;
//                 break;
//         }
//         this.viewNode.kuangone.visible = show;
//         this.viewNode.kuangtwo.visible = !show;
//     }

// }