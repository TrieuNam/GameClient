/**站位 
 * left 站左边 朝向 右边 
 * right 站右边 朝向 左边
*/
export enum SpineObjDirX {
    LEFT = 1,
    RIGHT = -1,
}

export enum SPINE_ANI_STATE {
    None = "",
    IDLE = "idle",
    ATTACK = "attack",
    RUN = "run",
    HIT = "hit",
    DIE = "die"
}
export enum SPINE_ANI_EVENT_STATE {
    ATTACK = "e_attack",
}

export enum SPINE_ANI_POINT {
    TOP = "top",
    CENTER = "center",
}

/**动作节点命名 */
export enum SPINE_ANI_SLOT {
    SKIN = "skin",
    WEAPON = "wuQi",
    HEAD = "tou",
    SHIELD = "dun",
    Body = "body",
    rHand = "rHand",
    zuoTui = "zuoTui",
    youTui = "youTui",
    ZUOQI = "zhujueguadian",
    ROOT = "root",
    HIP = "hip",
}

export enum SPINE_DEFAUT_SKIN {
    WEAPON = 4000,
    SHIELD = 3000,
    HEAD = 1000,
    BODY = 2000,
    MOUNT = 0,
}

export enum SPINE_OBJ_STATE {
    NORMAL = 0,
    ALIVE = 1,
}