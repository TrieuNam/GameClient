import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { DuoBaoTypeBtn, LoopMineView } from './LoopMineView';
import { ViewManager } from 'manager/ViewManager';
import { ItemCell } from 'modules/extends/ItemCell';
import { UH } from '../../helpers/UIHelper';
import { Language } from 'modules/common/Language';
import { BoardData } from 'modules/common_board/BoardData';
import { LoopMineData } from './LoopMineData';

@BaseView.registView 
export class LoopMineRecordView extends BaseView {
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "LoopMineExtra",
        ViewName: "LoopMineRecordView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        record_list:<fgui.GList>null,
    }
    protected extendsCfg = [
        { ResName: "LoopRecordCell", ExtendsClass: LoopRecordCell },
    ]

    InitData(data:any) {
        this.viewNode.Board.SetData(new BoardData(LoopMineRecordView, Language.LoopMine.RecordTitle,1))
        let rec_list =  LoopMineData.Inst().GetRecordList(data.show_type)
        
        this.viewNode.record_list.SetData(rec_list)
    }
}

export class LoopRecordCell extends fgui.GComponent {
    private viewNode = {
        rec_str:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data;
        UH.SetText(this.viewNode.rec_str, data.rec_str);
    }
    
}