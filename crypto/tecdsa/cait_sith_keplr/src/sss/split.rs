use elliptic_curve::bigint::{ArrayEncoding, Encoding};
use elliptic_curve::scalar;
use elliptic_curve::{Field, Group, ScalarPrimitive};
use k256::pkcs8::der::Encode;
use k256::FieldBytes;
use rand_core::CryptoRngCore;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use std::ops::{Add, AddAssign, Index, Mul, MulAssign};

use crate::math::Polynomial;
use crate::protocol::Participant;
use crate::sss::point::Point256;
use crate::{
    compat::CSCurve,
    serde::{deserialize_projective_points, serialize_projective_points},
};

// export function split(
//   secret: Bytes32,
//   ksNodeHashes: Bytes32[],
//   t: number,
// ): Result<Bytes32Point[], string> {
pub fn split<C: CSCurve>(
    secret: Vec<u8>,
    ks_node_hashes: Vec<Vec<u8>>,
    t: usize,
) -> Result<Vec<Point256>, String> {
    let secret_scalar = ScalarPrimitive::<C>::from_slice(&secret)
        .map_err(|_| "Failed to convert secret to scalar".to_string())?;
    let constant = C::Scalar::from(secret_scalar);

    println!("constant: {:?}", constant);

    let mut rng = OsRng;

    let polynomial = Polynomial::<C>::extend_random(&mut rng, t, &constant);

    println!("polynomial: {:?}", polynomial);

    println!("node length: {:?}", ks_node_hashes.len());

    let ks_node_hash_scalars = ks_node_hashes
        .iter()
        .map(|hash| {
            // println!("hash: {:?}", hash);
            let sp = ScalarPrimitive::<C>::from_slice(hash)
                .map_err(|_| "Failed to convert hash to scalar".to_string())?;
            Ok(C::Scalar::from(sp))
        })
        .collect::<Result<Vec<C::Scalar>, String>>()?;

    let points = ks_node_hash_scalars
        .iter()
        .map(|x_scalar| {
            let x_bytes = Into::<C::Uint>::into(*x_scalar).to_be_bytes();

            let y_scalar = polynomial.evaluate(x_scalar);
            let y_bytes = Into::<C::Uint>::into(y_scalar).to_be_bytes();

            Ok(Point256 {
                x: x_bytes
                    .as_ref()
                    .try_into()
                    .map_err(|_| "Failed to convert x to [u8; 32]".to_string())?,
                y: y_bytes
                    .as_ref()
                    .try_into()
                    .map_err(|_| "Failed to convert y to [u8; 32]".to_string())?,
            })
        })
        .collect::<Result<Vec<Point256>, String>>()?;

    println!("points: {:?}", points.len());
    println!("points: {:?}", points);

    Ok(points)
}

// participants.rs
// Get the lagrange coefficient for a participant, relative to this list.
pub fn lagrange<C: CSCurve>(participants: &[Participant], p: Participant) -> C::Scalar {
    let p_scalar = p.scalar::<C>();

    let mut top = C::Scalar::ONE;
    let mut bot = C::Scalar::ONE;
    for q in participants {
        if p == *q {
            continue;
        }
        let q_scalar = q.scalar::<C>();
        println!("q_scalar: {:?}", q_scalar);
        top *= q_scalar;
        bot *= q_scalar - p_scalar;

        println!("top: {:?}, bot: {:?}", top, bot);
    }

    println!(
        "RESULT top: {:?}, bot_inv: {:?}",
        top,
        bot.invert().unwrap()
    );

    top * bot.invert().unwrap()
}
