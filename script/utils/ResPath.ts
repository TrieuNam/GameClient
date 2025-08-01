import { sys } from "cc";

export class ResPath {
    // private static root = ""
    static Actors(path: string) {
        return `actors/${path}`;
    }

    static ActorRole(res_id: string | number) {
        return this.Actors(`role/${res_id}`)
    }

    static ActorWeapon(res_id: string | number) {
        return this.Actors(`weapon/${res_id}`);
    }

    static ActorShiled(res_id: string | number) {
        return this.Actors(`shiled/${res_id}`);
    }

    static ActorHelmet(res_id: string | number) {
        return this.Actors(`helmet/${res_id}`);
    }

    static ActorBody(res_id: string | number, id2: string | number = 1) {
        return this.Actors(`armor/${res_id}/${res_id}_${id2}`);
    }

    static Fazheng(res_id: string | number) {
        return `effect/Uitexiao/${res_id}`
    }

    static UIPackage(packName: string) {
        return `ui/${packName}/${packName}`
    }

    static Npc(res_id: string | number) {
        return this.Actors(`npc/${res_id}`);
    }

    static Ride(res_id: string | number) {
        return this.Actors(`ride/${res_id}`);
    }

    static UIEffect(effect_id: string | number) {
        return `effect/Uitexiao/${effect_id}`;
    }

    static JiNengEffect(effect_id: string | number) {
        return `effect/jineng/${effect_id}`;
    }

    static Shizhuang(effect_id: string | number) {
        return `effect/Shizhuang/${effect_id}`;
    }

    static Box(level: number) {
        return `box/sp_box${level}`;
    }
    
    static Spine(res_name: string) {
        return `spine/${res_name}`;
    }

    static WxAvatar(url: string) {
        return `${url}?aaa=aa.jpg`;
    }

    static BattleBuff(url: string) {
        return `loader/battle_buff/${url}`;
    }
}