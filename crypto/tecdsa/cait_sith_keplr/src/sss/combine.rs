use elliptic_curve::Field;

use crate::compat::CSCurve;
use crate::protocol::Participant;
use crate::sss::point::Point256;

// export function combine(
//   points: Bytes32Point[],
//   t: number,
// ): Result<Bytes32, string> {

pub fn combine(points: Vec<Point256>, t: usize) -> Result<Vec<u8>, String> {
    if points.len() < 2 {
        return Err("Need at least 2 points to reconstruct".to_string());
    }

    if points.len() < t {
        return Err("Need at least t points to reconstruct".to_string());
    }

    Ok(vec![0; 32])

    // 1. interplate

    // 2. validate rest points
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
