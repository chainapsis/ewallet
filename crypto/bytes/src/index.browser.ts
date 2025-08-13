import type { Result } from "@keplr-ewallet/stdlib-js";

const HEX_STRING_REGEX = new RegExp("^[0-9a-fA-F]*$");

// Type definition for a fixed-length byte array
export class Bytes<N extends number> {
  private readonly _bytes: Uint8Array;
  readonly length: N;

  private constructor(bytes: Uint8Array, length: N) {
    if (bytes.length !== length) {
      throw new Error(
        `Invalid length. Expected: ${length}, Actual: ${bytes.length}`,
      );
    }
    this._bytes = new Uint8Array(bytes);
    this.length = length;
  }

  /**
   * Creates a fixed-length Bytes instance from a Uint8Array.
   * @param uint8Array Uint8Array input
   * @param length Fixed length of the Bytes instance to create
   * @returns A Bytes instance with the specified fixed length
   */
  static fromUint8Array<T extends number>(
    uint8Array: Uint8Array,
    length: T,
  ): Result<Bytes<T>, string> {
    if (!(uint8Array instanceof Uint8Array)) {
      return {
        success: false,
        err: "Input must be a Uint8Array.",
      };
    }

    if (uint8Array.length !== length) {
      return {
        success: false,
        err: `Invalid length. Expected: ${length}, Actual: ${uint8Array.length}`,
      };
    }
    return {
      success: true,
      data: new Bytes(uint8Array, length),
    };
  }

  /**
   * Creates a fixed-length Bytes instance from a hexadecimal string.
   * @param hexString Hexadecimal string input
   * @param length Fixed length of the Bytes instance to create
   * @returns A Bytes instance with the specified fixed length
   */
  static fromHexString<T extends number>(
    hexString: string,
    length: T,
  ): Result<Bytes<T>, string> {
    // Enhanced input validation
    if (typeof hexString !== "string") {
      return {
        success: false,
        err: "Input must be a string.",
      };
    }

    if (hexString.length === 0 && length !== 0) {
      return {
        success: false,
        err: "Empty string for non-zero length.",
      };
    }

    if (hexString.length !== length * 2) {
      return {
        success: false,
        err: `Invalid length. Expected: ${length * 2} characters, Actual: ${hexString.length}`,
      };
    }

    if (!HEX_STRING_REGEX.test(hexString)) {
      return {
        success: false,
        err: "Invalid hexadecimal string format.",
      };
    }

    const uint8Array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      uint8Array[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return {
      success: true,
      data: new Bytes(uint8Array, length),
    };
  }

  /**
   * Creates a fixed-length Bytes instance from another Bytes instance.
   * @param bytes Bytes instance input
   * @param length Fixed length of the Bytes instance to create
   * @returns A Bytes instance with the specified fixed length
   */
  static fromBytes<T extends number>(
    bytes: Bytes<any>,
    length: T,
  ): Result<Bytes<T>, string> {
    if (!(bytes instanceof Bytes)) {
      return {
        success: false,
        err: "Input must be a Bytes instance.",
      };
    }

    if (bytes.length !== length) {
      return {
        success: false,
        err: `Invalid length. Expected: ${length}, Actual: ${bytes.length}`,
      };
    }
    return {
      success: true,
      data: new Bytes(bytes.toUint8Array(), length),
    };
  }

  /**
   * Compares the current Bytes instance with another Bytes instance.
   * Uses constant-time comparison to prevent timing attacks.
   * @param other The other Bytes instance to compare with
   * @returns True if both instances are identical, false otherwise
   */
  equals(other: Bytes<N>): boolean {
    if (this.length !== other.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < this.length; i += 1) {
      result |= this._bytes[i] ^ other._bytes[i];
    }
    return result === 0;
  }

  /**
   * Returns the internal Uint8Array of the Bytes instance.
   * @returns A copy of the internal Uint8Array
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this._bytes);
  }

  /**
   * Converts the Bytes instance to a hexadecimal string.
   * @returns Hexadecimal string
   */
  toHex(): string {
    return Array.from(this._bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

// Type aliases for commonly used byte lengths
export type Byte = Bytes<1>;
export type Bytes16 = Bytes<16>;
export type Bytes32 = Bytes<32>;
export type Bytes33 = Bytes<33>; // e.g. compressed public key
export type Bytes60 = Bytes<60>; // 32bytes ciphertext + 12 bytes iv + 16 bytes tag
export type Bytes64 = Bytes<64>;
export type BytesN = Bytes<number>;
