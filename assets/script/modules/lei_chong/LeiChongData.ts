import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { DataBase } from "../../data/DataBase";

export class LeiChongData extends DataBase {
    public GetLeiChongIsOPen() {
        let data = this.GetOpenActivityList()
        return data.length != 0
    }

    public GetOpenActivityList() {
        return ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.LeiChong);
        // return [{ act_type: 2053, sprite: "LeiChongYouLi", mod_key:9001 }, { act_type: 21111, sprite:"LianChongZengLi" }] 
    }

}
