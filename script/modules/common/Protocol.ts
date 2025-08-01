import { bit } from "core/net/bit";
// import { ByteBuffer } from "fairygui-cc";
// import { Item } from "modules/bag/ItemData";
// import { ITEM_BIG_TYPE } from "./CommonEnum";

// //解析装备净值
// function EquipmentParam(buffer: ByteBuffer){
//     let t:{[key:string]:any} = {};
//     t.has_random_net_value = buffer.readChar();
//     t.addition_attr_num = buffer.readChar();
//     buffer.readShort();
//     buffer.readChar();
//     t.addition_attr_type = [];
//     for (let i = 0; i < 3; i++) {
//         t.addition_attr_type[i] = buffer.readUchar();
//     }
//     t.addition_attr_value = [];
//     for (let i = 0; i < 3; i++) {
//         t.addition_attr_value[i] = buffer.readInt();
//     }
//     return t;
// }

// function PetParam(buffer: ByteBuffer) {
//     let t: { [key: string]: any } = {};
//     t.has_random_net_value = buffer.readChar(); //是否有净值
//     t.hold_ch = buffer.readChar();
//     t.hold_sh = buffer.readShort();

//     t.pet_cap = buffer.readLL();    //战力 Capablity_t
//     t.lock = buffer.readInt();      //是否锁定

//     t.mutate = buffer.readShort();  //变异等级
//     t.devour = buffer.readShort();  //吞噬等级

//     t.reborn = buffer.readShort();  //转生等级
//     t.level = buffer.readShort();   //等级
//     t.level_exp = buffer.readInt(); //升级经验

//     let TALENT_TYPE_MAX = 2;
//     t.total_train_times = [];       //洗练次数
//     for (let i = 0; i < TALENT_TYPE_MAX; i++) {
//         t.total_train_times[i] = buffer.readShort();
//     }
//     t.after_mutate_train_times = [];//变异后洗练次数
//     for (let i = 0; i < TALENT_TYPE_MAX; i++) {
//         t.after_mutate_train_times[i] = buffer.readShort();
//     }

//     let TALENT_MAX = 4;
//     t.train_talent = [];        //洗练资质
//     for (let i = 0; i < TALENT_MAX; i++) {
//         t.train_talent[i] = buffer.readInt();
//     }

//     let ACQUIRE_SKILL_MAX = 12;
//     t.acquire_skill_lock = 0; //buffer.readInt();
//     t.acquire_skill_id = []  //后天技能列表 SkillID
//     for (let i = 0; i < ACQUIRE_SKILL_MAX; i++) {
//         t.acquire_skill_id[i] = buffer.readUshort();
//     }
//     return t;
// }

// //解析净值
// export function ItemDataParam(item_id:number,bytes: Uint8Array) {
//     let buffer = bit.GetByteBuffer(bytes);
// 	let big_type = Item.GetBigType(item_id);
//     if (big_type == ITEM_BIG_TYPE.EQUIPMENT){
//         return EquipmentParam(buffer);
//     }
//     if (big_type == ITEM_BIG_TYPE.PET) {
//         return PetParam(buffer);
//     }
// }


