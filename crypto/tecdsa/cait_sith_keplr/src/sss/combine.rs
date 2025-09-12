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

// export function combine(
//   points: Bytes32Point[],
//   t: number,
// ): Result<Bytes32, string> {

pub fn combine(points: Vec<Point256>, t: usize) {}

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
