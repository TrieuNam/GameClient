// assets/script/modules/create_role/CreateRoleData.ts

import { smartdata, CreateSMD } from "data/SmartData";

/** Dữ liệu tạm khi tạo nhân vật mới */
export class FinishCreateDataModel {
    @smartdata
    public isFinishSign: number = -1; // -1: chưa tạo, 1: đã tạo (đặt tên gì cũng được)
    @smartdata
    public roleName: string = "";
    @smartdata
    public gender: number = 1;
    @smartdata
    public avatarId: number = 0;
    // Thêm thuộc tính khác nếu muốn (classId, hair, ...)
}

export class CreateRoleData {
    private static _inst: CreateRoleData;
    public static Inst(): CreateRoleData {
        if (!this._inst) this._inst = new CreateRoleData();
        return this._inst;
    }

    // SmartData dùng để binding UI hoặc handle event
    public FinishCreateData: FinishCreateDataModel;

    constructor() {
        this.FinishCreateData = CreateSMD(FinishCreateDataModel);
    }

    /** Đã tạo role thành công chưa */
    public IsCreateRole(): boolean {
        return this.FinishCreateData.isFinishSign === 1;
    }

    /** Gọi khi tạo role thành công */
    public onCreateRoleSuccess(roleName: string, gender: number, avatarId?: number) {
        this.FinishCreateData.isFinishSign = 1;
        this.FinishCreateData.roleName = roleName;
        this.FinishCreateData.gender = gender;
        if (avatarId !== undefined) this.FinishCreateData.avatarId = avatarId;
    }

    /** Reset lại khi vào màn login hoặc tạo mới */
    public reset() {
        this.FinishCreateData.isFinishSign = -1;
        this.FinishCreateData.roleName = "";
        this.FinishCreateData.gender = 1;
        this.FinishCreateData.avatarId = 0;
    }
}