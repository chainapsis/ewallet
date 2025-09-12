use elliptic_curve::{Field, Group};
use rand_core::CryptoRngCore;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use std::ops::{Add, AddAssign, Index, Mul, MulAssign};

use crate::{
    compat::CSCurve,
    serde::{deserialize_projective_points, serialize_projective_points},
};

// export function split(
//   secret: Bytes32,
//   ksNodeHashes: Bytes32[],
//   t: number,
// ): Result<Bytes32Point[], string> {
pub fn split<C: CSCurve>(secret: Vec<u8>, ks_node_hashes: Vec<Vec<u8>>, t: u32) {
    let coefficients: Vec<C::Scalar> = vec![];

    let mut rng = OsRng;

    let c = C::Scalar::random(&mut rng);
    println!("c: {:?}", c);
}
