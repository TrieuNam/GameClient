
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
export enum DialogTipsTypes {
    login = 0,
    box_sell = 1,
    guild_create = 2,
    guild_train_reset = 3,
    guild_fight = 4,
    guild_dismiss = 5,
    fashion_active = 6,
    block_compose = 7,
}

export class MainFlushData {
    @smartdata
    MainOpen: boolean = false;

    @smartdata
    AttrShow: boolean = false;
}

export class PublicPopupData extends DataBase {
    public MainFlushData: MainFlushData;
    private dialogTipsNotTips: Map<DialogTipsTypes, boolean>

    constructor() {
        super();
        this.createSmartData();
    }


    private createSmartData() {
        this.MainFlushData = CreateSMD(MainFlushData);
        this.dialogTipsNotTips = new Map();
    }

    public SetDialogTipsNotTips(type: DialogTipsTypes, val: boolean) {
        this.dialogTipsNotTips.set(type, val)
    }

    public GetDialogTipsNotTips(type: DialogTipsTypes) {
        return this.dialogTipsNotTips.get(type) ?? false
    }

    public set MainViewOpen(value: boolean) {
        this.MainFlushData.MainOpen = value
    }

    public get MainViewOpen() {
        return this.MainFlushData.MainOpen
    }

    public set MainAttrShow(value: boolean) {
        this.MainFlushData.AttrShow = !this.MainFlushData.AttrShow
    }
}