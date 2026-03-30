import { CfgAttrUp } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Equip } from "modules/bag/ItemData";
import { AttrListName, Language } from "modules/common/Language";
import { EnChantData } from "modules/Enchant/EnchantData";
import { EnchantView } from "modules/Enchant/EnchantView";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { EquipInfoView } from "./EquipInfoView";

export class EquipEnchantShow extends fgui.GComponent {
    private cache_timer = 0;
    private item : Equip;
    private part_data:any;
    private handleCollector: HandleCollector;

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    private viewNode = {
        timer:<TimeMeter>null,
        EnchantTime:<fgui.GTextField> null,
        active:<fgui.GGroup> null,
        unactive:<fgui.GGroup> null,
        attr_name:<fgui.GTextField>null,
        attr_num:<fgui.GTextField>null,
        attr_desc:<fgui.GTextField>null,
        BtnOpen:<fgui.GButton>null,
    };
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnOpen.onClick(this.OpenEnchantView.bind(this));
        this.addSmartDataCare(EnChantData.Inst().ResultData, this.FlushAll.bind(this), "ChantOneInfo");

        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));

        GuideCtrl.Inst().AddGuideUi("EnchantBtnOpen",this.viewNode.BtnOpen)
    }
    
    public SetData(item:Equip) {
        // LogError("")
        // let equip_type =  item.Vo().equipType
        // this.level = EnChantData.Inst().GetEquipEnchantLevel(equip_type)
        this.item = item
        // let item_vo =  this.Item.Vo()
        // this.part_data = EnChantData.Inst().GetEquipEnchantLevel(this.item.Vo().equipType)
        // this.cache_timer = this.part_data.endTime
        this.FlushAll()
        // this.FlushAttrShow()
    }

    private FlushAll(){

        this.part_data = EnChantData.Inst().GetEquipEnchantLevel(this.item.Vo().equipType)
        this.cache_timer = this.part_data.endTime
        // LogError("this.cache_timer = "+this.cache_timer)
        this.FlushFlushTime()
        this.FlushAttrShow()
    }

    private FlushFlushTime() {
        let time = this.cache_timer-TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.active.visible = time > 0
        this.viewNode.unactive.visible = time <= 0

        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }
    
    private FlushUpdateTime(realtime:number,total_time:number) {
        let time = Math.max(total_time - realtime, 0);
        // let time_t = TimeHelper.TimeformatDHMS(time);

        let time_t = TimeHelper.FormatDHMS(time);
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr1, time_t.day * 24 + time_t.hour, time_t.minute , time_t.second);
        // let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr4, time_t.day, time_t.hour,time_t.minute);
        if (ViewManager.Inst().IsOpen(EquipInfoView) && this.viewNode.EnchantTime){
            UH.SetText(this.viewNode.EnchantTime,t_str)
            // UH.SetText(this.viewNode.EnchantTime,time_t)
        }
    }

    private FlushAttrShow(){
        let level_data = EnChantData.Inst().GetEquipEnchantLevelData(this.item.Vo().equipType,this.part_data.level)
        // let str = ""
        // if (typeof(level_data.att_type) == "string"){
        //     let attr_data = level_data.att_type.split("|")
        //     for (let i = 0 ; i < attr_data.length ; i ++ ){
        //         str = str + AttrListName[Number(attr_data[i])]
        //     }
        // }else{
        //     str = AttrListName[level_data.att_type]
        // }
        UH.SetText(this.viewNode.attr_name,level_data.dec)
        UH.SetText(this.viewNode.attr_desc,level_data.dec2)
        // this.viewNode.attr_num.visible = false
        UH.SetText(this.viewNode.attr_num,TextHelper.Format(Language.Enchant.ShowBuffDesc2,level_data.parm/100))
    }

    private OpenEnchantView(){
        ViewManager.Inst().OpenView(EnchantView,this.item)
        // ViewManager.Inst().CloseView(EquipInfoView)
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}
