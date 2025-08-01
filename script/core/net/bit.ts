import { ByteBuffer } from "fairygui-cc";
import { KeyFunction } from "modules/common/CommonType";

export let bit: KeyFunction = {};

export let bit_data32: any[] = [];


bit.StringToUint8Array = function (str: string) {
	let arr = [];
	for (let i = 0, j = str.length; i < j; ++i) {
		arr.push(str.charCodeAt(i));
	}
	let tmpUint8Array = new Uint8Array(arr);
	return tmpUint8Array;
}

bit.Uint8ArrayToString = function (uint8Array: Uint8Array) {
	let dataString = "";
	for (let i = 0, j = uint8Array.length; i < j; ++i) {
		dataString += String.fromCharCode(uint8Array[i]);
	}
	return dataString
}

bit.GetByteBuffer = function(bytes: Uint8Array): ByteBuffer {
    var buffer: ByteBuffer = new ByteBuffer(bytes);
    buffer.littleEndian = true;
    return buffer;
}

//number转table, 1->32 高位->低位
bit.d2b = function (value: number): number[] {
	let tr = [];
	for (let i = 1; i <= 32; i++) {
		if (value >= Math.pow(2, 32 - i)) {
			tr[i] = 1;
			value = value - Math.pow(2, 32 - i)
		} else {
			tr[i] = 0;
		}
	}
	return tr;
}

//table转number
bit.b2d = function (arg: number[]): number {
	let nr = 0;
	for (let i = 1; i <= 32; i++) {
		if (arg[i] == 1) {
			nr = nr + Math.pow(2, 32 - i);
		}
	}
	return nr;
}

//判断值的第n位是否标记为1，n从0开始
bit.hasflag = function(a: number, n: number): boolean {
	if (bit_data32.length == 0){
		for (let i = 1; i <= 32; i++) {
			bit_data32[i] = Math.pow(2, 32 - i);
		}
	}
	let value = bit_data32[32 - n];
	return (a & value) == value;
}

function bytes(bytes: any, Uint8Array: Uint8ArrayConstructor) {
	throw new Error("Function not implemented.");
}
