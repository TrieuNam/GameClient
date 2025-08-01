import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { CoreCrisisType } from "./CoreCrisisConfig";

export class CoreCrisisCard extends fgui.GComponent {

    private static cardImgs = {
        [CoreCrisisType.Mount] : "Ka-ZuoQi",
        [CoreCrisisType.Angel] : "Ka-FaZhen",
        [CoreCrisisType.Gem] : "Ka-BaoShi",
        [CoreCrisisType.StarMap]:"Ka-XingTu",
        [CoreCrisisType.Inscription]:"Ka-FuWen",
        [CoreCrisisType.ShenQi]:"Ka-ShenQi",
    };
    private static nameImgs = {
        [CoreCrisisType.Mount] : "MingChen-ZuoQiZhiXin",
        [CoreCrisisType.Angel] : "MingChen-FaZhenZhiXin",
        [CoreCrisisType.Gem] : "MingChen-BaoShiZhiXin",
        [CoreCrisisType.StarMap]:"MingChen-XingTuZhiXin",
        [CoreCrisisType.Inscription]:"MingChen-MingWenZhiXin",
        [CoreCrisisType.ShenQi]:"MingChen-ShenQiZhiXin",
    }
    coreCrisisType = CoreCrisisType.Mount;
    
    private viewNode = {
        GpLv: <fgui.GGroup>null,
        LblLv:<fgui.GLabel>null,
        LrType:<fgui.GLoader>null,
        LrName:<fgui.GLoader>null,
    };   
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);        
    }

    public SetType(type: CoreCrisisType){
        this.coreCrisisType = type;
        UH.SpriteName(this.viewNode.LrType, "CoreCrisisCard",CoreCrisisCard.cardImgs[this.coreCrisisType]);
        if(this.viewNode.LrName.visible){
            UH.SpriteName(this.viewNode.LrName, "CoreCrisisCard",CoreCrisisCard.nameImgs[this.coreCrisisType]);
        }
    }

    public SetNameVisible(b:boolean){
        this.viewNode.LrName.visible = b;
        if(b){
            UH.SpriteName(this.viewNode.LrName, "CoreCrisisCard",CoreCrisisCard.nameImgs[this.coreCrisisType]);
        }
    }

    public SetLv(lv: number){
        this.viewNode.LblLv.text = lv.toString();
    }
    
    public ShowLv(b:boolean){
        this.viewNode.GpLv.visible = b;
    }
}