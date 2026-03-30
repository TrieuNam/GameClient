import { CfgSensitivewordsData } from "config/CfgSensitivewords";
import { Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";

/**
 * 违禁词过滤器 DFA算法
 */
export class BannedWordFilter {
	// 是否已初始化
	private _inited: boolean;
	// 脏词库
	private dirtyWordArray: Array<string>;
	// 检测源字符串
	private sourceWord: string;
	// 脏词库构造的 DFA 敏感词索引树结构
	private treeRoot: WordNode;
	public constructor() {
	}
	// 单例
	private static _ins: BannedWordFilter;
	public static get ins() {
		if (!this._ins) {
			this._ins = new BannedWordFilter();
		}
		if (!this._ins._inited) {
			this._ins.initTreeConfs();//初始化生成树
		}
		return this._ins;
	}
	public clear(): void {
		this.dirtyWordArray = null;
		this.treeRoot = null;
		this._inited = false;
	}
	//初始化树，把敏感词集构造成树
	private initTreeConfs(): void {
		this.dirtyWordArray = CfgSensitivewordsData.Config_SensitiveWords_list;
		//this.dirtyWordArray = ["王八蛋", "小崽子", "王小二", "小鸡鸡", "肯跌呀"];
		if (!this.dirtyWordArray || this.dirtyWordArray.length <= 0)
			return;
		//这是一个预处理步骤，生成敏感词索引树，功耗大于查找时使用的方法，但只在程序开始时调用一次。
		this.treeRoot = new WordNode();//树根
		this.treeRoot.value = '';//初始化赋值
		let leng = this.dirtyWordArray.length;
		for (let i = 0; i < leng; i++) {
			let word = this.dirtyWordArray[i];
			let charCount = word.length;
			if (charCount > 0) {
				let node = this.treeRoot;
				for (let j = 0; j < charCount; j++) {
					let char = word.slice(j, j + 1);
					let tempNode = node.getChild(char);
					if (tempNode) {
						node = tempNode;
					} else {
						// 树根
						node = node.addChild(char)
					}
				}
				// 词尾标识
				node.isEnd = true;
			}
		}
		this.dirtyWordArray = null;
		this._inited = true;
	}
	/**
	 * 检测一个词并返回是否带敏感词和替换敏感词之后的结果
	 * @param word 检测的词
	 * @param repChar 代替敏感字的字符
	 */
	public filterWord(word: string, repChar: string = "*"): { has: boolean, filteredWord: string } {
		let has_disty = false;
		this.sourceWord = word;//词源
		let filtered_word = word;//过滤保存
		let charCount = filtered_word.length;
		// 确保敏感词索引树有内容
		if (charCount > 0 && this.treeRoot) {
			has_disty = this.judge(charCount, has_disty, filtered_word, repChar).has;
			filtered_word = this.judge(charCount, has_disty, filtered_word, repChar).filteredWord;
		}
		if (charCount > 1 && !has_disty) {
			let arr2 = this.sourceWord.concat().split("");
			if (arr2.length > 0 && !has_disty) {
				this.sourceWord = arr2.join("");
				filtered_word = arr2.join("");
				charCount = filtered_word.length;
				has_disty = this.judge(charCount, has_disty, filtered_word, repChar).has;
				filtered_word = this.judge(charCount, has_disty, filtered_word, repChar).filteredWord;
			}
		}
		return { has: has_disty, filteredWord: filtered_word };
	}

	private judge(charCount: number, has_disty: boolean, filtered_word: string, repChar: string): { has: boolean, filteredWord: string } {
		let char: string;
		// 敏感字替换字符
		let node = this.treeRoot;
		let chilhNode: WordNode;
		let dirtyWord: string = "";
		for (let i = 0; i < charCount; i++) {
			char = this.sourceWord.slice(i, i + 1);
			chilhNode = node.getChild(char);
			if (!chilhNode) {
				dirtyWord = '';
				//重新开始下个敏感词检测
				node = this.treeRoot;
			}
			chilhNode = node.getChild(char);
			if (chilhNode) {
				dirtyWord += chilhNode.value;
				if (chilhNode.isEnd) {
					has_disty = true;
					if (dirtyWord.length > 0) {
						// 替换敏感字
						filtered_word = filtered_word.replace(dirtyWord, this.getReplaceStr(repChar, dirtyWord.length));
					}
				}
				node = chilhNode;
			}
		}
		return { has: has_disty, filteredWord: filtered_word };
	}

	// 替换字符串
	public getReplaceStr(repChar: string, leng: number): string {
		let result = '';
		for (let i = 0; i < leng; i++) {
			result += repChar;
		}
		return result;
	}
	//玩家输入词语提示
	public wordHint(word: string, tip?: string): { has: boolean, filteredWord: string } {
		let result = this.filterWord(word);
		if (result.has) {
			tip = tip ? tip : Language.Common.bannedWordTip;
			PublicPopupCtrl.Inst().Center(tip);
		}
		return result;
	}
	//个别地方不能用*号 return boolean
	public symbolFilter(word: string, symbol = "*"): boolean {
		return word.indexOf(symbol) >= 0;
	}
}

//敏感词树结构
class WordNode {
	//是否敏感词尾
	public isEnd = false;
	//父节点
	public parentNode: WordNode;
	//子节点
	public children: Map<string, WordNode>;
	public value: string;
	public constructor() {
		this.children = new Map<string, WordNode>();
	}

	public getChild(name: string): WordNode {
		return this.children.get(name);
	}
	public addChild(char: string): WordNode {
		let node = new WordNode();
		node.value = char;
		node.parentNode = this;
		this.children.set(char, node);
		return node;
	}
}


function findItinerary(tickets: string[][]): string[] {
	//this.dirtyWordArray = ["王八蛋", "小崽子", "王小二", "小鸡鸡", "肯跌呀"];
	if (!tickets || tickets.length <= 0)
		return;
	//这是一个预处理步骤，生成敏感词索引树，功耗大于查找时使用的方法，但只在程序开始时调用一次。
	let treeRoot = new WordNode();//树根
	this.treeRoot.value = "JFK";//初始化赋值
	let leng = this.tickets.length;
	for (let i = 0; i < leng; i++) {
		let word = this.tickets[i];
		let charCount = word.length;
		if (charCount > 0 && word[0] == "JFK") {
			let node = this.treeRoot;
			for (let j = 0; j < charCount; j++) {
				let char = word.slice(j, j + 1);
				let tempNode = node.getChild(char);
				if (tempNode) {
					node = tempNode;
				} else {
					// 树根
					node = node.addChild(char)
				}
			}
			// 词尾标识
			node.isEnd = true;
		}
	}
};