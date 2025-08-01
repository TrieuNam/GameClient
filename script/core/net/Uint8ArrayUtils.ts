/**
 * Collection of often used {Uint8Array} operations.
 */
export class Uint8ArrayUtils {
    /**
     * Converts a 32 bit integer to an {Uint8Array}.
     * @param int32 A 32 bit integer.
     * @returns {Uint8Array} A {Uint8Array} containing the specified 32 bit integer.
     */
    public static convertToByteArray(int32: number): Uint8Array {
        let byteArray = new Uint8Array(4);
        byteArray[0] = (int32 >> 24) & 0xFF; // byte cao nhất
        byteArray[1] = (int32 >> 16) & 0xFF;
        byteArray[2] = (int32 >> 8) & 0xFF;
        byteArray[3] = int32 & 0xFF;         // byte thấp nhất
        return byteArray;
    }

    /**
     * Removes all high (left) bytes from the specified {Uint8Array} which are 0.
     * Example: Input: [0x00, 0x00, 0x12, 0xD3, 0x00] -> Output: [0x12, 0xD3, 0x00]
     * @param int8ByteArray
     * @returns {Uint8Array} An {Uint8Array} without any high (left) bytes which are 0.
     */
    public static removeEmptyHighBytes(int8ByteArray: Uint8Array): Uint8Array {
        let countUsedBytes = this.countUsedLowBytes(int8ByteArray);

        if (countUsedBytes == int8ByteArray.byteLength) {   // no bytes to remove
            return int8ByteArray;
        }

        // remove unused bytes
        let byteArray = new Uint8Array(countUsedBytes);
        for (let i = 0; i < countUsedBytes; i++) {
            byteArray[i] = int8ByteArray[i];
        }

        return byteArray;
    }

    /**
     * Counts the number of used low bytes.
     * Example: Input: [0x00, 0x00, 0x12, 0xD3, 0x00] -> Output: 3
     * @param int8ByteArray
     * @returns {number} The number of used low bytes.
     */
    private static countUsedLowBytes(int8ByteArray: Uint8Array): number {
        let count = 0;
        for (let i = 0; i < int8ByteArray.byteLength; i++) {
            if (int8ByteArray[i] == 0) {
                break;
            }

            count += 1;
        }

        return count;
    }
}