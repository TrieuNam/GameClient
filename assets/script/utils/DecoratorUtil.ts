import { js } from "cc";
import { EDITOR } from "cc/env";

export var getName = function <T>(vClass: Function | (new (p?: any) => T)): string {
    return vClass?.prototype.name;
}

/**修饰器 */
export class DecoratorUtil {
    static registClassNameAndGet<T>(vClass: new (p?: any) => T): string {
        let key: string;
        if (!EDITOR) {
            let frameInfo = (cc['_RF'] as any).peek();
            js.setClassName(frameInfo.script, vClass);
            key = js.getClassName(vClass);
            vClass.prototype.name = key
        }
        return key;
    }
    static registClassName<T>(name?: string): (ctor: new (p?: any) => T) => void {
        return function (constructor: new (p?: any) => T) {
            constructor.prototype.name = name;
        }
    }

}