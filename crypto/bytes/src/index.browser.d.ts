import type { Result } from "@keplr-ewallet/stdlib-js";

export declare class Bytes<N extends number> {
  private readonly _bytes;
  readonly length: N;
  
  private constructor(bytes: Uint8Array, length: N);
  
  static fromUint8Array<T extends number>(
    uint8Array: Uint8Array,
    length: T,
  ): Result<Bytes<T>, string>;
  
  static fromHexString<T extends number>(
    hexString: string,
    length: T,
  ): Result<Bytes<T>, string>;
  
  static fromBytes<T extends number>(
    bytes: Bytes<any>,
    length: T,
  ): Result<Bytes<T>, string>;
  
  equals(other: Bytes<N>): boolean;
  toUint8Array(): Uint8Array;
  toHex(): string;
}

export type Byte = Bytes<1>;
export type Bytes16 = Bytes<16>;
export type Bytes32 = Bytes<32>;
export type Bytes33 = Bytes<33>;
export type Bytes60 = Bytes<60>;
export type Bytes64 = Bytes<64>;
export type BytesN = Bytes<number>;