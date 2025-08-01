import { Color } from "cc";
import { ItemColor } from "./CommonEnum";

//0~1
function _NC(r: number, g: number, b: number): Color {
	return new Color(r, g, b);
}

//(1,1,1) >> ffffff
function _MC(color: Color): string {
	return color.toHEX("#rrggbb");
}

export var COLORS = {
	White: _NC(255, 255, 255),
	Black: _NC(0, 0, 0),

	Gray1: _NC(81, 81, 81),
	Gray2: _NC(180, 180, 180),
	Gray4: _NC(237, 237, 237),

	Yellow1: _NC(250, 231, 189),
	Yellow2: _NC(49, 23, 0),
	Yellow3: _NC(245, 173, 0),
	Yellow4: _NC(163, 135, 96),
	Yellow5: _NC(148, 79, 32),
	Yellow6: _NC(193, 147, 83),
	Yellow7: _NC(75, 53, 38),
	Yellow8: _NC(255, 221, 130),
	Yellow9: _NC(255, 234, 116),

	Red1: _NC(255, 58, 58),
	Red2: _NC(79, 4, 0),
	Red3: _NC(254, 79, 145),
	Red4: _NC(74, 0, 28),
	Red5: _NC(212, 47, 30),
	Red6: _NC(255, 150, 150),
	Red7: _NC(254, 84, 84),

	Green1: _NC(69, 190, 41),
	Green2: _NC(9, 47, 0),
	Green3: _NC(42, 141, 19),
	Green4: _NC(119, 227, 94),

	Blue1: _NC(21, 172, 215),
	Blue2: _NC(8, 100, 123),
	Blue3: _NC(0, 11, 47),
	Blue4: _NC(126, 238, 255),

	Purple1: _NC(214, 87, 246),
	Purple2: _NC(47, 0, 45),
	Purple3: _NC(235, 173, 255),

	Orange1: _NC(245, 114, 18),
	Orange2: _NC(204, 79, 21),

	ColorDown: _NC(253, 234, 84),
	ColorUp: _NC(156, 254, 85),
}

export var COLORSTR = {
	White: _MC(COLORS.White),
	Black: _MC(COLORS.Black),

	Gray1: _MC(COLORS.Gray1),
	Gray2: _MC(COLORS.Gray2),
	Gray4: _MC(COLORS.Gray4),

	Yellow1: _MC(COLORS.Yellow1),
	Yellow2: _MC(COLORS.Yellow2),
	Yellow3: _MC(COLORS.Yellow3),
	Yellow4: _MC(COLORS.Yellow4),
	Yellow5: _MC(COLORS.Yellow5),
	Yellow6: _MC(COLORS.Yellow6),
	Yellow7: _MC(COLORS.Yellow7),
	Yellow8: _MC(COLORS.Yellow8),
	Yellow9: _MC(COLORS.Yellow9),

	Red1: _MC(COLORS.Red1),
	Red2: _MC(COLORS.Red2),
	Red3: _MC(COLORS.Red3),
	Red4: _MC(COLORS.Red4),
	Red5: _MC(COLORS.Red5),
	Red6: _MC(COLORS.Red6),
	Red7: _MC(COLORS.Red7),

	Green1: _MC(COLORS.Green1),
	Green2: _MC(COLORS.Green2),
	Green3: _MC(COLORS.Green3),
	Green4: _MC(COLORS.Green4),

	Blue1: _MC(COLORS.Blue1),
	Blue2: _MC(COLORS.Blue2),
	Blue3: _MC(COLORS.Blue3),
	Blue4: _MC(COLORS.Blue4),

	Purple1: _MC(COLORS.Purple1),
	Purple2: _MC(COLORS.Purple2),
	Purple3: _MC(COLORS.Purple3),

	Orange1: _MC(COLORS.Orange1),
	Orange2: _MC(COLORS.Orange2),
}

//道具品质色
export let QualityColor: { [key: number]: Color } = {
	[ItemColor.None]: COLORS.White,
	[ItemColor.Grey]: COLORS.Gray2,
	[ItemColor.Green]: COLORS.Green1,
	[ItemColor.Blue]: COLORS.Blue1,
	[ItemColor.Purple]: COLORS.Purple1,
	[ItemColor.Yellow]: COLORS.Yellow3,
	[ItemColor.Orange]: COLORS.Orange1,
	[ItemColor.Red]: COLORS.Red1,
	[ItemColor.Pink]: COLORS.Red3,
}

//道具品质色描边
export let QualityColorOL: { [key: number]: Color } = {
	[ItemColor.None]: COLORS.White,
	[ItemColor.Grey]: COLORS.Black,
	[ItemColor.Green]: COLORS.Green2,
	[ItemColor.Blue]: COLORS.Blue3,
	[ItemColor.Purple]: COLORS.Purple2,
	[ItemColor.Yellow]: COLORS.Yellow2,
	[ItemColor.Orange]: COLORS.Yellow2,
	[ItemColor.Red]: COLORS.Red2,
	[ItemColor.Pink]: COLORS.Red4,
	[ItemColor.Color]: COLORS.Yellow2,
}
//道具品质色 浅色
export let QualityColorStr: { [key: number]: string } = {
	[ItemColor.None]: COLORSTR.White,
	[ItemColor.Grey]: COLORSTR.Gray2,
	[ItemColor.Green]: COLORSTR.Green1,
	[ItemColor.Blue]: COLORSTR.Blue1,
	[ItemColor.Purple]: COLORSTR.Purple1,
	[ItemColor.Yellow]: COLORSTR.Yellow3,
	[ItemColor.Orange]: COLORSTR.Orange1,
	[ItemColor.Red]: COLORSTR.Red1,
	[ItemColor.Pink]: COLORSTR.Red3,
}
//道具品质色 深色
export let QualityColorOLStr: { [key: number]: string } = {
	[ItemColor.None]: COLORSTR.White,
	[ItemColor.Grey]: COLORSTR.Black,
	[ItemColor.Green]: COLORSTR.Green2,
	[ItemColor.Blue]: COLORSTR.Blue3,
	[ItemColor.Purple]: COLORSTR.Purple2,
	[ItemColor.Yellow]: COLORSTR.Yellow2,
	[ItemColor.Orange]: COLORSTR.Yellow2,
	[ItemColor.Red]: COLORSTR.Red2,
	[ItemColor.Pink]: COLORSTR.Red4,
	[ItemColor.Color]: COLORSTR.Yellow2,
}

// //道具品质色 深色
// export let QualityColorShallow:{[key:number]:Color} = {
// 	[ItemColor.None] : COLORS.White,
// 	[ItemColor.Green] : COLORS.QuaGreen2,
// 	[ItemColor.Blue] : COLORS.QuaBlue2,
// 	[ItemColor.Purple] : COLORS.QuaPurple2,
// 	[ItemColor.Orange] : COLORS.QuaOrange2,
// 	[ItemColor.Red] : COLORS.QuaRed2,
// 	[ItemColor.Yellow] : COLORS.QuaYellow2,
// }
//  //道具品质色 浅色
// export let QualityColorStr:{[key:number]:string} = {
// 	[ItemColor.None] : COLORSTR.White,
// 	[ItemColor.Green] : COLORSTR.QuaGreen1,
// 	[ItemColor.Blue] : COLORSTR.QuaBlue1,
// 	[ItemColor.Purple] : COLORSTR.QuaPurple2,
// 	[ItemColor.Orange] : COLORSTR.QuaOrange1,
// 	[ItemColor.Red] : COLORSTR.QuaRed1,
// 	[ItemColor.Yellow] : COLORSTR.QuaYellow1,
// }
// //道具品质色 深色
// export let QualityColorStrShallow:{[key:number]:string} = {
// 	[ItemColor.None] : COLORSTR.White,
// 	[ItemColor.Green] : COLORSTR.QuaGreen2,
// 	[ItemColor.Blue] : COLORSTR.QuaBlue2,
// 	[ItemColor.Purple] : COLORSTR.QuaPurple2,
// 	[ItemColor.Orange] : COLORSTR.QuaOrange2,
// 	[ItemColor.Red] : COLORSTR.QuaRed2,
// 	[ItemColor.Yellow] : COLORSTR.QuaYellow2,
// }
