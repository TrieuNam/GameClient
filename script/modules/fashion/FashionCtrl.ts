import { RemindRegister } from 'data/HandleCollectorCfg';
import { ViewManager } from 'manager/ViewManager';
import { BagData } from 'modules/bag/BagData';
import { Item } from 'modules/bag/ItemData';
import { BoxData } from 'modules/box/BoxData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { CommonGetView2 } from 'modules/CommonGet2/CommonGetView2';
import { CommGetData, CommGetType } from 'modules/common_account/CommonGetView';
import { FashionData } from './FashionData';

export class FashionCtrl extends BaseCtrl {
    data = FashionData.Inst()
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCAllShiZhuangInfo, func: this.recvAllShiZhuangInfo },
            { msgType: PB_SCShiZhuangInfo, func: this.recvShiZhuangInfo },
        ]
    }
    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Fashion.View, BagData.Inst().BagItemData, this.data.GetRedPoint.bind(this.data), "OtherChange"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Fashion.HuDun, BagData.Inst().BagItemData, this.data.GetRedPointByClothesType.bind(this.data, 0), "OtherChange"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Fashion.KaiJia, BagData.Inst().BagItemData, this.data.GetRedPointByClothesType.bind(this.data, 1), "OtherChange"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Fashion.WuQi, BagData.Inst().BagItemData, this.data.GetRedPointByClothesType.bind(this.data, 2), "OtherChange"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Fashion.TouKui, BagData.Inst().BagItemData, this.data.GetRedPointByClothesType.bind(this.data, 3), "OtherChange"));
    }

    private recvAllShiZhuangInfo(data: PB_SCAllShiZhuangInfo) {

        // console.log("时装信息all", data);
        this.data.FashionList = data.shizhuangList;

        this.data.FashionList.forEach(element => {
            this.data.active_info[element.id] = element.level
        });
        this.data.FlushData.flush_all = !this.data.FlushData.flush_all
    }

    private recvShiZhuangInfo(data: PB_SCShiZhuangInfo) {
        let has = false
        for (let index = 0; index < this.data.FashionList.length; index++) {
            const element = this.data.FashionList[index];
            if (element.id == data.shizhuang.id) {
                has = true
                this.data.FashionList[index].level = data.shizhuang.level
            }
        }
        /* this.data.FashionList.forEach(element => {
            if (element.id == data.shizhuang.id) {
                has = true
                element = data.shizhuang
            }
        }); */
        if (!has) {
            let cfg_data = this.data.GetCFGFashionClothesId(data.shizhuang.id)
            let box_shizhuang_id=BoxData.Inst().GetBoxShiZhuangId();
            if (box_shizhuang_id == 0 ){
                FashionData.Inst().SetFashionShowData(cfg_data.clothes_item);
                if (!ViewManager.Inst().IsOpen(CommonGetView2)) {
                    let get_data = FashionData.Inst().GetFashionShowData();
                    ViewManager.Inst().OpenView(CommonGetView2, get_data);
                }
            }
            this.data.FashionList.push(data.shizhuang)
        }
        this.data.FlushData.flush_single = !this.data.FlushData.flush_single
    }


}

