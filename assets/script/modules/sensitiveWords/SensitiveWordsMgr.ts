//敏感词操作
export class SensitiveWordsMgr {
	public constructor() {
	}
	/**敏感词库 */
	private sensitiveWords: string[];
	/**只过滤最小敏感词*/
	public static type: FilterType;
	//非法词集
	private illegalWords: string[];
	//敏感词数量
	public get wordsSize(): number {
		return this.sensitiveWords.length;
	}
	//是否中文
	public isChinese(char: string): boolean {
		//  中文表意字符的范围 4E00-9FA5
		let charVal = char.charCodeAt(0);
		return (charVal >= 0x4e00 && charVal <= 0x9fa5);
	}
	//是否数字
	public isNumber(char: string): boolean {
		let charVal = char.charCodeAt(0);
		return (charVal >= 48 && charVal <= 57);
	}
	//是否是字母
	public isAlphabet(char: string) {
		let charVal = char.charCodeAt(0);
		return ((charVal >= 97 && charVal <= 122) || (charVal >= 65 && charVal <= 90));
	}
	//去掉特殊字符
	private static chearSpecialChar(s: string): string {
		// 去掉特殊字符    
		return s.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/g, '');
		//return c.replace(/ [^ a-zA-Z 0-9]/g, '');
	}
	//去掉转义字符
	public static chearEscapeChar(s: string): string {
		return s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');;
	}

	//过滤文本
	public static filter(label: string): string {
		return;
	}
	//检测文本
	public static check(label: string): string {
		return;
	}
	//是否包含敏感词
	public isContaintSensitiveWord(s: string, type: FilterType = FilterType.max): boolean {
		let flag = false;
		let len = s.length;
		for (let i = 0; i < len; i++) {
			//let count = 
		}
		return flag;
	}
	//检测敏感词数量
	public checkWordNum(txt: string, beginIndex: number = 0, type: FilterType = FilterType.max): number {
		let flag: boolean = false;
		let count: number = 0;//记录数量
		let len = txt.length;
		for (let i = beginIndex; i < len; i++) {
			let word = txt.charAt(i);
			if (this.sensitiveWords == null)
				break;

		}
		return count;
	}
}
/**敏感词过滤类型 */
enum FilterType {
	min,//只过滤最小敏感词
	max//过滤所有敏感词
}