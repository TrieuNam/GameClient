import { COLORSTR } from "modules/common/ColorEnum";
import { BATTLE_ATTR } from "modules/common/CommonEnum";

export var StarMapLineCfg: { [key: string]: any } = {
    map1_1: [[0, 1], [1, 2], [2, 3], [3, 6], [3, 4], [4, 5], [5, 9], [6, 7], [7, 8]],
    map1_2: [[0, 1], [1, 2], [1, 4], [2, 3], [3, 5], [5, 6], [6, 7], [7, 9], [7, 8]],
    map1_3: [[0, 1], [1, 3], [3, 6], [6, 7], [0, 2], [2, 4], [4, 5], [5, 8], [8, 9]],
    map1_4: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [3, 6], [6, 7], [7, 8], [7, 9]],
    map1_5: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [3, 6], [6, 7], [1, 8], [8, 9]],
    map1_6: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],

    map2_1: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [5, 7], [7, 8], [8, 9]],
    map2_2: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 9], [8, 9], [1, 6], [6, 7], [7, 8]],
    map2_3: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [2, 6], [6, 7], [2, 8], [8, 9]],
    map2_4: [[0, 1], [1, 4], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9]],
    map2_5: [[0, 1], [1, 4], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9]],
    map2_6: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 9]],
}

export var SuperStarMapLineCfg = [
    // 0~20
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
    [10, 11], [2, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18],
    [18, 19], [19, 20],
    // 20~40
    [20, 21], [21, 22], [22, 23], [23, 24], [24, 25], [25, 26], [26, 27], [27, 28],
    [28, 29], [29, 30], [30, 31], [28, 32], [25, 33], [33, 34], [34, 35], [35, 36],
    [36, 37], [37, 38], [38, 39],//[36,40],
    // 40~60
    [40, 41], [41, 42], [42, 43], [43, 44], [44, 45], [45, 46], [46, 47], [42, 48], [43, 49], [49, 50],
    [50, 51], [51, 52], [52, 53], [53, 54], [54, 55], [55, 56], [56, 57], [53, 70], [40, 58], [58, 59],
    // 60~80
    [59, 60], [59, 61], [61, 62], [62, 63], [63, 64], [64, 65], [65, 66], [66, 67], [67, 68], [68, 69],
    [69, 0], [70, 71], [71, 72], [72, 73], [73, 74], [74, 75], [75, 76], [76, 77], [77, 78], [74, 79], [79, 80],
    // 80~100
    [80, 81], [79, 82], [82, 83], [83, 84], [84, 85], [85, 86], [86, 87], [87, 88], [88, 89], [89, 90],
    [0, 91], [91, 92], [92, 93], [93, 94], [94, 95], [95, 127], [127, 128], [0, 97], [97, 96], [96, 98],
    [98, 99], [99, 100],
    // 100~120
    [100, 101], [101, 102], [102, 103], [103, 104], [104, 105], [105, 106], [106, 107], [107, 108],
    [5, 109], [109, 110], [110, 111], [112, 113], [113, 114], [114, 115], [115, 116], [116, 117],//[111,112]
    [117, 118], [118, 119], [119, 120],
    // 120~140
    [116, 121], [121, 122], [122, 123], [123, 124], [124, 125], [125, 126], [129, 130], [130, 131],//[74,129]
    [131, 132], [132, 133], [133, 136], [139, 136], [138, 137], [137, 135], [139, 140], [135, 137], [134, 135],
    [137, 138], [138, 140], [102, 126],
    // 140~160
    [134, 141], [141, 142], [142, 143], [143, 144], [144, 145], [145, 146], [146, 147], [147, 148], [148, 149], [149, 150],
    [150, 151], [149, 152], [152, 153], [153, 154], [154, 155], [155, 156], [156, 157], [157, 158], [155, 161], [161, 162],
    [162, 163], [161, 160], [160, 159], [159, 164], [164, 165], [128, 158]
]

export var StarMapAttrIcon: { [key: string]: any } = {
    [BATTLE_ATTR.HP]: "6ShengMing",
    [BATTLE_ATTR.ATTACK]: "1GongJi",
    [BATTLE_ATTR.ARMOR]: "2FangYu",
    [BATTLE_ATTR.SPEED]: "3MinJie",
    [BATTLE_ATTR.TRUE_DAMAGE]: "30ZhenShiShangHai",

    [BATTLE_ATTR.VAMPIRIC]: "4HuiFu",
    [BATTLE_ATTR.COUNTER]: "22FanJiLv",
    [BATTLE_ATTR.COMBO]: "25BiShaShangHai",
    [BATTLE_ATTR.EVASION]: "21ShanBiLv",
    [BATTLE_ATTR.CRITICAL]: "19BiShaLv",
    [BATTLE_ATTR.STUN]: "24MoFang",

    [BATTLE_ATTR.VAMPIRIC_IMMUNITY]: "ShiHuaDiKang",
    [BATTLE_ATTR.COUNTER_IMMUNITY]: "BingFengDiKang",
    [BATTLE_ATTR.COMBO_IMMUNITY]: "28KongZhiDiKang",
    [BATTLE_ATTR.EVASION_IMMUNITY]: "20MingZhongLv",
    [BATTLE_ATTR.CRITICAL_IMMUNITY]: "ZhongDuDiKang",
    [BATTLE_ATTR.STUN_IMMUNITY]: "ZhongShangDiKang",

    [BATTLE_ATTR.TYRANNY]: "18FaShangZengShang",
    [BATTLE_ATTR.BENEVOLENCE]: "16FaMianJianMian",
    [BATTLE_ATTR.MUDDY]: "HunLuanDiKang",
    [BATTLE_ATTR.INTERDICTION]: "ChenMoDiKang",
    [BATTLE_ATTR.REJUVENATION]: "5JingShen",
    [BATTLE_ATTR.BULLYING]: "17WuShangZengShang",
    [BATTLE_ATTR.PILLAGE]: "26JianRen",
    [BATTLE_ATTR.GLADIATUS]: "15WuMianJianMian",
}

export var StarMapBgName: { [key: string]: any } = {
    ["1_1"]: "SheShouBeiJing",
    ["1_2"]: "TianXieBeiJing",
    ["1_3"]: "TianChengBeiJing",
    ["1_4"]: "ShuiPingBeiJing",
    ["1_5"]: "ShuangZiBeiJing",
    ["1_6"]: "ShuangYuBeiJing",
    ["2_1"]: "ShiZiBeiJing",
    ["2_2"]: "MoJieBeiJing",
    ["2_3"]: "JuXieBeiJing",
    ["2_4"]: "JinNiuBeiJing",
    ["2_5"]: "ChuNvBeiJing",
    ["2_6"]: "BaiYangBeiJing",
}

export var StarMapPointPos: { [key: string]: any } = {
    ["1_1"]: [
        { pos: 0, x: 235, y: 32 }, { pos: 1, x: 304, y: 104 }, { pos: 2, x: 356, y: 201 }, { pos: 3, x: 431, y: 259 }, { pos: 4, x: 528, y: 327 },
        { pos: 5, x: 484, y: 425 }, { pos: 6, x: 313, y: 317 }, { pos: 7, x: 153, y: 458 }, { pos: 8, x: 185, y: 555 }, { pos: 9, x: 607, y: 384 }],
    ["1_2"]: [
        { pos: 0, x: 557, y: 69 }, { pos: 1, x: 486, y: 165 }, { pos: 2, x: 367, y: 231 }, { pos: 3, x: 343, y: 335 }, { pos: 4, x: 570, y: 294 },
        { pos: 5, x: 291, y: 453 }, { pos: 6, x: 199, y: 510 }, { pos: 7, x: 42, y: 440 }, { pos: 8, x: 209, y: 266 }, { pos: 9, x: 63, y: 275 }],
    ["1_3"]: [
        { pos: 0, x: 526, y: 87 }, { pos: 1, x: 386, y: 146 }, { pos: 2, x: 563, y: 275 }, { pos: 3, x: 329, y: 239 }, { pos: 4, x: 497, y: 359 },
        { pos: 5, x: 424, y: 458 }, { pos: 6, x: 253, y: 356 }, { pos: 7, x: 76, y: 458 }, { pos: 8, x: 302, y: 527 }, { pos: 9, x: 156, y: 543 }],
    ["1_4"]: [
        { pos: 0, x: 301, y: 20 }, { pos: 1, x: 245, y: 121 }, { pos: 2, x: 154, y: 226 }, { pos: 3, x: 196, y: 327 }, { pos: 4, x: 287, y: 258 },
        { pos: 5, x: 386, y: 195 }, { pos: 6, x: 185, y: 433 }, { pos: 7, x: 328, y: 503 }, { pos: 8, x: 485, y: 390 }, { pos: 9, x: 591, y: 473 }],
    ["1_5"]: [
        { pos: 0, x: 168, y: 112 }, { pos: 1, x: 333, y: 144 }, { pos: 2, x: 402, y: 50 }, { pos: 3, x: 129, y: 285 }, { pos: 4, x: 93, y: 386 },
        { pos: 5, x: 54, y: 188 }, { pos: 6, x: 219, y: 372 }, { pos: 7, x: 351, y: 443 }, { pos: 8, x: 434, y: 307 }, { pos: 9, x: 525, y: 402 }],
    ["1_6"]: [
        { pos: 0, x: 597, y: 16 }, { pos: 1, x: 557, y: 101 }, { pos: 2, x: 487, y: 143 }, { pos: 3, x: 402, y: 266 }, { pos: 4, x: 387, y: 365 },
        { pos: 5, x: 326, y: 426 }, { pos: 6, x: 244, y: 549 }, { pos: 7, x: 175, y: 441 }, { pos: 8, x: 110, y: 267 }, { pos: 9, x: 105, y: 155 }],
    ["2_1"]: [
        { pos: 0, x: 416, y: 118 }, { pos: 1, x: 315, y: 64 }, { pos: 2, x: 228, y: 129 }, { pos: 3, x: 310, y: 261 }, { pos: 4, x: 418, y: 291 },
        { pos: 5, x: 482, y: 413 }, { pos: 6, x: 617, y: 466 }, { pos: 7, x: 248, y: 527 }, { pos: 8, x: 135, y: 458 }, { pos: 9, x: 46, y: 526 }],
    ["2_2"]: [
        { pos: 0, x: 516, y: 35 }, { pos: 1, x: 526, y: 139 }, { pos: 2, x: 473, y: 272 }, { pos: 3, x: 506, y: 461 }, { pos: 4, x: 401, y: 549 },
        { pos: 5, x: 286, y: 509 }, { pos: 6, x: 332, y: 344 }, { pos: 7, x: 188, y: 355 }, { pos: 8, x: 97, y: 329 }, { pos: 9, x: 170, y: 457 }],
    ["2_3"]: [
        { pos: 0, x: 105, y: 219 }, { pos: 1, x: 225, y: 179 }, { pos: 2, x: 369, y: 281 }, { pos: 3, x: 362, y: 74 }, { pos: 4, x: 462, y: 212 },
        { pos: 5, x: 598, y: 212 }, { pos: 6, x: 439, y: 393 }, { pos: 7, x: 547, y: 450 }, { pos: 8, x: 266, y: 393 }, { pos: 9, x: 122, y: 450 }],
    ["2_4"]: [
        { pos: 0, x: 148, y: 14 }, { pos: 1, x: 219, y: 110 }, { pos: 2, x: 61, y: 184 }, { pos: 3, x: 184, y: 285 }, { pos: 4, x: 285, y: 296 },
        { pos: 5, x: 378, y: 337 }, { pos: 6, x: 368, y: 428 }, { pos: 7, x: 444, y: 487 }, { pos: 8, x: 513, y: 404 }, { pos: 9, x: 600, y: 470 }],
    ["2_5"]: [
        { pos: 0, x: 468, y: 61 }, { pos: 1, x: 420, y: 174 }, { pos: 2, x: 606, y: 114 }, { pos: 3, x: 572, y: 213 }, { pos: 4, x: 460, y: 290 },
        { pos: 5, x: 341, y: 448 }, { pos: 6, x: 230, y: 388 }, { pos: 7, x: 60, y: 350 }, { pos: 8, x: 196, y: 523 }, { pos: 9, x: 83, y: 524 }],
    ["2_6"]: [
        { pos: 0, x: 542, y: 89 }, { pos: 1, x: 424, y: 56 }, { pos: 2, x: 318, y: 145 }, { pos: 3, x: 459, y: 212 }, { pos: 4, x: 532, y: 305 },
        { pos: 5, x: 467, y: 423 }, { pos: 6, x: 230, y: 214 }, { pos: 7, x: 138, y: 284 }, { pos: 8, x: 209, y: 430 }, { pos: 9, x: 153, y: 545 }],
}

export var SuperStarMapPointPos: { [key: string]: any } = [
    // 0~20
    { pos: 0, x: 1410, y: 890 }, { pos: 1, x: 1410, y: 730 }, { pos: 2, x: 1410, y: 571 }, { pos: 3, x: 1490, y: 490 }, { pos: 4, x: 1570, y: 412 },
    { pos: 5, x: 1650, y: 331 }, { pos: 6, x: 1570, y: 250 }, { pos: 7, x: 1490, y: 170 }, { pos: 8, x: 1410, y: 250 }, { pos: 9, x: 1330, y: 330 },
    { pos: 10, x: 1410, y: 412 }, { pos: 11, x: 1490, y: 330 }, { pos: 12, x: 1330, y: 490 }, { pos: 13, x: 1250, y: 412 }, { pos: 14, x: 1170, y: 330 },
    { pos: 15, x: 1250, y: 250 }, { pos: 16, x: 1330, y: 170 }, { pos: 17, x: 1410, y: 90 }, { pos: 18, x: 1250, y: 90 }, { pos: 19, x: 1090, y: 91 },
    // 20~40
    { pos: 20, x: 1010, y: 170 }, { pos: 21, x: 930, y: 250 }, { pos: 22, x: 850, y: 331 }, { pos: 23, x: 770, y: 250 }, { pos: 24, x: 690, y: 170 },
    { pos: 25, x: 610, y: 90 }, { pos: 26, x: 290, y: 90 }, { pos: 27, x: 210, y: 250 }, { pos: 28, x: 290, y: 412 }, { pos: 29, x: 210, y: 570 },
    { pos: 30, x: 290, y: 730 }, { pos: 31, x: 370, y: 570 }, { pos: 32, x: 370, y: 249 }, { pos: 33, x: 530, y: 170 }, { pos: 34, x: 610, y: 250 },
    { pos: 35, x: 610, y: 412 }, { pos: 36, x: 610, y: 570 }, { pos: 37, x: 770, y: 570 }, { pos: 38, x: 770, y: 730 }, { pos: 39, x: 930, y: 731 },
    // 40~60
    { pos: 40, x: 611, y: 730 }, { pos: 41, x: 530, y: 810 }, { pos: 42, x: 450, y: 890 }, { pos: 43, x: 290, y: 890 }, { pos: 44, x: 370, y: 970 },
    { pos: 45, x: 370, y: 1130 }, { pos: 46, x: 450, y: 1210 }, { pos: 47, x: 530, y: 1290 }, { pos: 48, x: 530, y: 970 }, { pos: 49, x: 290, y: 1050 },
    { pos: 50, x: 210, y: 1130 }, { pos: 51, x: 290, y: 1210 }, { pos: 52, x: 370, y: 1290 }, { pos: 53, x: 450, y: 1370 }, { pos: 54, x: 370, y: 1450 },
    { pos: 55, x: 290, y: 1529 }, { pos: 56, x: 210, y: 1610 }, { pos: 57, x: 210, y: 1450 }, { pos: 58, x: 690, y: 810 }, { pos: 59, x: 770, y: 890 },
    // 60~80
    { pos: 60, x: 690, y: 970 }, { pos: 61, x: 930, y: 890 }, { pos: 62, x: 1010, y: 810 }, { pos: 63, x: 1010, y: 650 }, { pos: 64, x: 930, y: 570 },
    { pos: 65, x: 1090, y: 570 }, { pos: 66, x: 1170, y: 650 }, { pos: 67, x: 1170, y: 810 }, { pos: 68, x: 1090, y: 890 }, { pos: 69, x: 1250, y: 890 },
    { pos: 70, x: 610, y: 1610 }, { pos: 71, x: 850, y: 1610 }, { pos: 72, x: 1010, y: 1610 }, { pos: 73, x: 1250, y: 1610 }, { pos: 74, x: 1410, y: 1370 },
    { pos: 75, x: 1250, y: 1130 }, { pos: 76, x: 1010, y: 1130 }, { pos: 77, x: 850, y: 1130 }, { pos: 78, x: 610, y: 1130 }, { pos: 79, x: 1250, y: 1370 },
    // 80~100
    { pos: 80, x: 1170, y: 1530 }, { pos: 81, x: 690, y: 1530 }, { pos: 82, x: 1170, y: 1210 }, { pos: 83, x: 690, y: 1210 }, { pos: 84, x: 610, y: 1370 },
    { pos: 85, x: 770, y: 1370 }, { pos: 86, x: 850, y: 1290 }, { pos: 87, x: 1010, y: 1289 }, { pos: 88, x: 1090, y: 1370 }, { pos: 89, x: 1010, y: 1450 },
    { pos: 90, x: 850, y: 1451 }, { pos: 91, x: 1410, y: 1050 }, { pos: 92, x: 1410, y: 1210 }, { pos: 93, x: 1490, y: 1130 }, { pos: 94, x: 1570, y: 1050 },
    { pos: 95, x: 1650, y: 970 }, { pos: 96, x: 1730, y: 891 }, { pos: 97, x: 1570, y: 889 }, { pos: 98, x: 1570, y: 730 }, { pos: 99, x: 1730, y: 570 },
    // 100~120
    { pos: 100, x: 1889, y: 810 }, { pos: 101, x: 2211, y: 810 }, { pos: 102, x: 2210, y: 330 }, { pos: 103, x: 1890, y: 330 }, { pos: 104, x: 1890, y: 570 },
    { pos: 105, x: 1970, y: 730 }, { pos: 106, x: 2130, y: 730 }, { pos: 107, x: 2130, y: 412 }, { pos: 108, x: 1970, y: 412 }, { pos: 109, x: 1730, y: 250 },
    { pos: 110, x: 1810, y: 170 }, { pos: 111, x: 1970, y: 170 }, { pos: 112, x: 2130, y: 170 }, { pos: 113, x: 2290, y: 170 }, { pos: 114, x: 2370, y: 250 },
    { pos: 115, x: 2450, y: 330 }, { pos: 116, x: 2530, y: 413 }, { pos: 117, x: 2610, y: 330 }, { pos: 118, x: 2690, y: 250 }, { pos: 119, x: 2610, y: 170 },
    // 120~140
    { pos: 120, x: 2530, y: 90 }, { pos: 121, x: 2610, y: 490 }, { pos: 122, x: 2690, y: 570 }, { pos: 123, x: 2610, y: 650 }, { pos: 124, x: 2530, y: 730 },
    { pos: 125, x: 2450, y: 650 }, { pos: 126, x: 2370, y: 570 }, { pos: 127, x: 1810, y: 970 }, { pos: 128, x: 1970, y: 970 }, { pos: 129, x: 1570, y: 1370 },
    { pos: 130, x: 1490, y: 1450 }, { pos: 131, x: 1570, y: 1530 }, { pos: 132, x: 1490, y: 1610 }, { pos: 133, x: 1650, y: 1610 }, { pos: 134, x: 1730, y: 1531 },
    { pos: 135, x: 1810, y: 1450 }, { pos: 136, x: 1810, y: 1610 }, { pos: 137, x: 1890, y: 1531 }, { pos: 138, x: 1970, y: 1450 }, { pos: 139, x: 1970, y: 1610 },
    // 140~160
    { pos: 140, x: 2050, y: 1530 }, { pos: 141, x: 1650, y: 1450 }, { pos: 142, x: 1730, y: 1370 }, { pos: 143, x: 1890, y: 1370 }, { pos: 144, x: 1810, y: 1290 },
    { pos: 145, x: 1730, y: 1210 }, { pos: 146, x: 1810, y: 1130 }, { pos: 147, x: 1890, y: 1050 }, { pos: 148, x: 1970, y: 1130 }, { pos: 149, x: 2050, y: 1211 },
    { pos: 150, x: 1970, y: 1290 }, { pos: 151, x: 1890, y: 1210 }, { pos: 152, x: 2131, y: 1450 }, { pos: 153, x: 2370, y: 1450 }, { pos: 154, x: 2611, y: 1450 },
    { pos: 155, x: 2690, y: 1210 }, { pos: 156, x: 2610, y: 970 }, { pos: 157, x: 2370, y: 970 }, { pos: 158, x: 2130, y: 970 }, { pos: 159, x: 2290, y: 1370 },
    // 160~165
    { pos: 160, x: 2450, y: 1369 }, { pos: 161, x: 2530, y: 1210 }, { pos: 162, x: 2450, y: 1050 }, { pos: 163, x: 2290, y: 1050 }, { pos: 164, x: 2209, y: 1210 },
    { pos: 165, x: 2371, y: 1210 },
]

export interface IStarMapSuperNewCfg{
    route:number;
    color:string;
    tabImg:string;
    NodeBG:string;
    NodeBGMax:string;
    AttrIcon:string;
    AttrIconMax:string;
    FontColor:string;
}
export var StarMapSuperNewCfg : { [key: number]: IStarMapSuperNewCfg } = {
    [0] : {
        route: 1,
        color: "e2b2a3",
        tabImg: "BiaoQianGongJi",
        NodeBG: "HongDi1",
        NodeBGMax: "HongDi2",
        AttrIcon: "TuBiaoGongJi1",
        AttrIconMax: "TuBiaoGongJi2",
        FontColor: COLORSTR.Yellow8,
    },
    [1] :{
        route: 2,
        color: "d7c488",
        tabImg: "BiaoQianFangYu",
        NodeBG: "HuangDi1",
        NodeBGMax: "HuangDi2",
        AttrIcon: "TuBiaoFangYu1",
        AttrIconMax: "TuBiaoFangYu2",
        FontColor: COLORSTR.Yellow8,
    },
    [2] : {
        route: 3,
        color: "a3e2a9",
        tabImg: "BiaoQianShengMing",
        NodeBG: "LvDi1",
        NodeBGMax: "LvDi2",
        AttrIcon: "TuBiaoShengMing1",
        AttrIconMax: "TuBiaoShengMing2",
        FontColor: COLORSTR.Green4,
    },
    [3] : {
        route: 4,
        color: "a0afda",
        tabImg: "BiaoQianSuDu",
        NodeBG: "LanDi1",
        NodeBGMax: "LanDi2",
        AttrIcon: "TuBiaoSuDu1",
        AttrIconMax: "TuBiaoSuDu2",
        FontColor: COLORSTR.Blue4,
    }
}