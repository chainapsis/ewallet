use std::fmt::Debug;

use crate::{bytes::HexSerializedBytes, curve::CurveType, error::CryptoError};

pub trait SharedSecret<const N: usize>: Debug + Clone + Send + Sync {
    fn curve_type(&self) -> CurveType;
    fn from_hex_ser_bytes(bytes: &HexSerializedBytes<N>) -> Result<Self, CryptoError>;
    fn to_hex_ser_bytes(&self) -> HexSerializedBytes<N>;

    fn encrypt_aes_256_gcm(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError>;
    fn decrypt_aes_256_gcm(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError>;
}

pub trait PublicKey: Debug + Clone + Send + Sync {
    fn curve_type(&self) -> CurveType;
    fn is_compressed(&self) -> bool;
    fn from_compressed_hex_ser_bytes(bytes: &HexSerializedBytes<33>) -> Result<Self, CryptoError>;
    fn from_uncompressed_hex_ser_bytes(bytes: &HexSerializedBytes<64>)
        -> Result<Self, CryptoError>;
    fn to_compressed_hex_ser_bytes(&self) -> Result<HexSerializedBytes<33>, CryptoError>;
    fn to_uncompressed_hex_ser_bytes(&self) -> HexSerializedBytes<64>;

    // fn verify(&self, message: &[u8], signature: &[u8]) -> Result<bool, Self::Error>;
}

pub trait PrivateKey: Debug + Clone + Send + Sync {
    type PublicKey: PublicKey;
    type SharedSecret: SharedSecret<64>;

    fn curve_type(&self) -> CurveType;
    fn from_hex_ser_bytes(bytes: &HexSerializedBytes<32>) -> Result<Self, CryptoError>;
    fn to_hex_ser_bytes(&self) -> HexSerializedBytes<32>;

    fn public_key(&self) -> Self::PublicKey;
    fn diffie_hellman(
        &self,
        counter_party_public_key: &Self::PublicKey,
    ) -> Result<Self::SharedSecret, CryptoError>;

    // fn sign(&self, message: &[u8]) -> Result<Vec<u8>, Self::Error>;
}
