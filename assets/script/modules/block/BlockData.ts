
import { CfgBlockData } from "config/CfgBlock";
import { GetCfgValue } from "config/CfgCommon";
import { CfgShopData } from "config/CfgShop";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { GET_TYPE } from "modules/bag/BagEnum";
import { Item } from "modules/bag/ItemData";
import { COLORSTR, QualityColorStr } from "modules/common/ColorEnum";
import { ITEM_BIG_TYPE, ItemColor } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { FunOpen } from "modules/guide/FunOpen";
import { BlockConfig } from "./BlockConfig";

export class BlockResultData {
    Info: PB_SCBuildBlockInfo
}

export class BlockFlushData {
    @smartdata
    FlushInfo: boolean = false;

    @smartdata
    FlushInfoAdd: boolean = false;

    @smartdata
    FlushInfoDelet: boolean = false;

    @smartdata
    FlushInfoInlay: boolean = false;

    @smartdata
    FlushInfoRemove: boolean = false;

    @smartdata
    FlushInfoAchieve: boolean = false;

    @smartdata
    FlushInfoMapWear: boolean = false;

    @smartdata
    FlushInfoCompose: boolean = false;

    @smartdata
    FlushInfoComposeFail: boolean = false;


    @smartdata
    FillRemoveIndexFlush: boolean = false;

    FillRemoveIndex: number = -1;
    FillNum: number;
    AddItems: any[] = []
}

export class BlockData extends DataBase {
    public ResultData: BlockResultData;
    public FlushData: BlockFlushData;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.FlushData = CreateSMD(BlockFlushData);
        this.ResultData = new BlockResultData()
    }

    public SetBuildBlockInfo(protocol: PB_SCBuildBlockInfo) {
        switch (protocol.sendType) {
            case BlockConfig.Ret.init:
                this.ResultData.Info = protocol;
                this.FlushData.FlushInfo = !this.FlushData.FlushInfo;
                this.FillNum = 0
                break
            case BlockConfig.Ret.add:
                if (this.ResultData.Info) {
                    for (let element of protocol.blockList) {
                        this.ResultData.Info.blockList.push(element)
                    }
                    this.FlushData.FlushInfoAdd = !this.FlushData.FlushInfoAdd;
                    let reward_data = this.AddItems
                    for (let element of protocol.blockList) {
                        reward_data.push(element)
                    }
                    ViewManager.Inst().OpenView(CommonRewardView, { reward_data: reward_data, call_back: null, get_type: GET_TYPE.PUT_REASON_CUSTOM_BLOCK })
                }
                break
            case BlockConfig.Ret.delet:
                if (this.ResultData.Info) {
                    for (let element of protocol.blockList) {
                        let index = this.ResultData.Info.blockList.findIndex(cfg => cfg.blockIndex == element.blockIndex)
                        this.ResultData.Info.blockList.splice(index, 1)
                        break
                    }
                    this.FlushData.FlushInfoDelet = !this.FlushData.FlushInfoDelet;
                }
                break
            case BlockConfig.Ret.inlay:
                if (this.ResultData.Info) {
                    for (let element of protocol.blockList) {
                        let index = this.ResultData.Info.blockList.findIndex(cfg => cfg.blockIndex == element.blockIndex)
                        this.ResultData.Info.blockList[index] = element
                        break
                    }
                    this.FlushData.FlushInfoInlay = !this.FlushData.FlushInfoInlay;
                    this.FillNum = 0;
                }
                break
            case BlockConfig.Ret.remove:
                if (this.ResultData.Info) {
                    for (let element of protocol.blockList) {
                        let index = this.ResultData.Info.blockList.findIndex(cfg => cfg.blockIndex == element.blockIndex)
                        this.ResultData.Info.blockList[index] = element
                        break
                    }
                    this.FlushData.FlushInfoRemove = !this.FlushData.FlushInfoRemove;
                    this.FillNum = 0;
                }
                break
            case BlockConfig.Ret.activate:
                this.ResultData.Info.activateSeq = protocol.activateSeq;
                this.FlushData.FlushInfoAchieve = !this.FlushData.FlushInfoAchieve;
                break
            case BlockConfig.Ret.map_wear:
                this.ResultData.Info.mapId = protocol.mapId;
                this.FlushData.FlushInfoMapWear = !this.FlushData.FlushInfoMapWear;
                break
            case BlockConfig.Ret.compose:
                if (this.ResultData.Info) {
                    for (let element of protocol.blockList) {
                        this.ResultData.Info.blockList.push(element)
                    }
                    this.FlushData.FlushInfoCompose = !this.FlushData.FlushInfoCompose;
                }
                break
            case BlockConfig.Ret.compose_fail:
                this.FlushData.FlushInfoComposeFail = !this.FlushData.FlushInfoComposeFail;
                break
        }
    }

    public get InfoActivateSeq() {
        return this.ResultData.Info ? this.ResultData.Info.activateSeq : 0
    }

    public get InfoMapId() {
        return this.ResultData.Info ? this.ResultData.Info.mapId : 0
    }

    public get InfoBlockList() {
        return this.ResultData.Info ? this.ResultData.Info.blockList : []
    }

    public get InfoBlockListLast() {
        return this.InfoBlockList[this.InfoBlockList.length - 1]
    }

    get FillRemoveIndex(): number {
        return this.FlushData.FillRemoveIndex;
    }

    set FillRemoveIndex(value: number) {
        this.FlushData.FillRemoveIndex = value;
        if (-2 != value) {
            this.FlushData.FillRemoveIndexFlush = !this.FlushData.FillRemoveIndexFlush
        }
    }

    get FillNum(): number {
        return this.FlushData.FillNum;
    }

    set AddItems(value: any) {
        this.FlushData.AddItems = value
    }

    get AddItems(): any[] {
        return this.FlushData.AddItems;
    }

    set FillNum(value: number) {
        let fill_num = 0
        for (let [key, value] of BagData.Inst().getItemMap(ITEM_BIG_TYPE.BlockModel)) {
            let blocks = BlockData.Inst().GetBlocksByModelId(key)
            let num: number = 0
            for (let element of blocks) {
                let colors = element.color.toString().split('').map(Number);
                while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                    colors.unshift(0);
                }
                for (let color of colors) {
                    if (color > 0) {
                        num++;
                    }
                }
            }
            fill_num = BlockConfig.MODEL_POS_MAX == num ? (fill_num + 1) : fill_num
        }
        this.FlushData.FillNum = fill_num
    }


    public CfgOtherJiMuQuanId() {
        return CfgBlockData.other[0].jimuquan_id ?? 0;
    }

    public CfgBlockModelByModelId(model_id: number) {
        return CfgBlockData.block_model.filter(cfg => cfg.model_id == model_id);
    }

    public CfgBlockUpByColor(color: number) {
        return CfgBlockData.block_up.find(cfg => cfg.block_type == color);
    }

    public GetModelBagList() {
        let show_list = []
        for (let [key, value] of BagData.Inst().getItemMap(ITEM_BIG_TYPE.BlockModel)) {
            show_list.push({ item_id: key, num: value })
        }
        return show_list
    }

    public GetBlockBagList(sel_qua: number, sel_color: number) {
        let show_list = []
        let params_qua = BlockData.Inst().GetQualityParam()
        let params_color = BlockData.Inst().GetColorParam()
        for (let element of this.InfoBlockList) {
            let colors = element.color
            let qua = Item.GetColor(element.blockId)
            if ((+params_qua[params_qua.length - 1] == sel_qua || qua == sel_qua) && (+params_color[params_color.length - 1] == sel_color || `${colors}`.includes(`${sel_color}`))) {
                show_list.push(element)
            }
        }
        if (+params_color[params_color.length - 1] == sel_color) {
            show_list.sort((a: any, b: any) => {
                let quaa = Item.GetColor(a.blockId)
                let quab = Item.GetColor(b.blockId)
                return quab - quaa
            })
            return show_list
        } else {
            show_list.sort((a, b) => {
                let aq = Item.GetColor(a.blockId)
                let bq = Item.GetColor(b.blockId)
                if (aq < bq) {
                    return 1;
                } else if (aq > bq) {
                    return -1;
                } else {
                    let an = (`${a.color}`.match(new RegExp(`${sel_color}`, "g")) || []).length
                    let bn = (`${b.color}`.match(new RegExp(`${sel_color}`, "g")) || []).length;
                    if (an < bn) {
                        return 1;
                    } else if (an > bn) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });
            return show_list
        }
    }

    public GetBlockModelShow(model_id: number) {
        let list = new Array(BlockConfig.MODEL_POS_MAX).fill(0)
        for (let element of this.InfoBlockList) {
            if (element.mapId == model_id) {
                let colors = element.color.toString().split('').map(Number);
                while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                    colors.unshift(0);
                }
                for (let [index, color] of colors.entries()) {
                    if (color > 0) {
                        let offset_x = ((index + 1) % 3 === 0) ? 3 : (index + 1) % 3;
                        let offset_y = Math.floor((index + 1) / 3) - ((index + 1) % 3 === 0 ? 1 : 0);
                        let pos = element.posX - 1 + offset_x + (element.posY - 1 + offset_y) * 6
                        list[pos - 1] = color
                    }
                }
            }
        }
        return list
    }

    public GetBlockModelInfoShow(model_id: number) {
        const list = Array.from({ length: BlockConfig.MODEL_POS_MAX }, () => ({ color: 0, block: undefined }));
        for (let element of this.InfoBlockList) {
            if (element.mapId == model_id && this.FillRemoveIndex != element.blockIndex) {
                let colors = element.color.toString().split('').map(Number);
                while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                    colors.unshift(0);
                }
                for (let [index, color] of colors.entries()) {
                    if (color > 0) {
                        let offset_x = ((index + 1) % 3 === 0) ? 3 : (index + 1) % 3;
                        let offset_y = Math.floor((index + 1) / 3) - ((index + 1) % 3 === 0 ? 1 : 0);
                        let pos = element.posX - 1 + offset_x + (element.posY - 1 + offset_y) * 6
                        list[pos - 1].color = color
                        list[pos - 1].block = element
                    }
                }
            }
        }
        return list
    }

    public IsBlockSameQua(block_id1: number, block_id2: number) {
        return Item.GetQuality(block_id1) == Item.GetQuality(block_id2)
    }

    public GetShopShowList() {
        let show_list = []
        let page_1 = 0
        let elements = CfgShopData.shop.filter(cfg => cfg.page == 3)
        let page = []
        for (let element of elements) {
            if (page_1 != element.page_1) {
                if (page_1 > 0) {
                    if (page.length > 0) {
                        show_list.push(page)
                    }
                    page = []
                    show_list.push({ space: true })
                }
                page_1 = element.page_1
                show_list.push(CfgShopData.shop_label_1.find(cfg => cfg.seq == page_1).name)
            }
            if (3 == page.length) {
                show_list.push(page)
                page = []
            } else {
                page.push(element)
            }
        }
        return show_list
    }


    public GetAchieveShowList() {
        let show_list = []
        for (let element of CfgBlockData.model_level) {
            show_list.push(element)
        }
        return show_list
    }

    public GetAchieveActive(seq: number, model_num: number) {
        let activateSeq = this.InfoActivateSeq;
        let fill_num = this.FillNum;
        let is_active = activateSeq >= seq
        let can_active = fill_num >= model_num
        return { is_active, can_active }
    }

    public GetBlocksByModelId(model_id: number) {
        return this.InfoBlockList.filter(cfg => cfg.mapId == model_id)
    }

    public GetQualityDesc() {
        let list = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink; i++) {
            if (GetCfgValue(Language.Block.QuaDesc, i - 2)) {
                list.push(GetCfgValue(Language.Block.QuaDesc, i - 2))
            }
        }
        list.push(Language.Block.All)
        return list;
    }

    public GetQualityColor() {
        let list: string[] = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink; i++) {
            if (GetCfgValue(Language.Block.QuaDesc, i - 2)) {
                list.push(QualityColorStr[i]);
            }
        }
        list.push(COLORSTR.Black)
        return list;
    }


    public GetQualityParam() {
        let list: string[] = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink + 1; i++) {
            if (GetCfgValue(Language.Block.QuaDesc, i - 2) || i == ItemColor.Pink + 1) {
                list.push(i.toString());
            }
        }
        return list;
    }

    public GetColorDesc() {
        let list = [];
        for (let i = 1; i <= BlockConfig.Block_COLOR_NUM; i++) {
            list.push(GetCfgValue(Language.Block.QuaColor, i))
        }
        list.push(Language.Block.All)
        return list;
    }

    public GetColorColor() {
        let list: string[] = [];
        for (let i = 1; i <= BlockConfig.Block_COLOR_NUM; i++) {
            list.push(COLORSTR.Black);
        }
        list.push(COLORSTR.Black)
        return list;
    }


    public GetColorParam() {
        let list: string[] = [];
        for (let i = 1; i <= BlockConfig.Block_COLOR_NUM + 1; i++) {
            list.push(i.toString());
        }
        return list;
    }

    public GetBlockMaxColor() {
        let color = ItemColor.Green
        if (this.InfoMapId > 0) {
            color = Item.GetColor(this.InfoMapId)
        }
        return color
    }

    public GetBlockRedNum() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Block.View));
        if (!open_t.is_open) {
            return 0
        }
        return 1 == this.GetBlockAchieveRedPoint()
    }

    public GetBlockAchieveRedPoint() {
        let rp = 0
        for (let element of CfgBlockData.model_level) {
            let active_info = BlockData.Inst().GetAchieveActive(element.seq, element.model_num)
            if (!active_info.is_active && active_info.can_active) {
                rp = 1
                break
            }
        }
        return rp
    }
}
