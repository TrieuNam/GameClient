export interface IBaseView {

	/**
	 * 面板数据初始化
	*/
	InitData(parm: any): void;

	/**
	 * 面板进行显示初始化
	 */
	InitUI(): void;

	
	/**
	 * 面板进行显示初始化
	 */
	InitListener(): void;

	/**
	 * 面板开启前等待已添加Handle完成
	 */
	DoOpenWaitHandle(): void;

	/**
	 * 面板开启执行函数
	 */
	OpenCallBack(): void;

	/**
	 * 面板关闭执行函数
	 */
	CloseCallBack(): void;

}