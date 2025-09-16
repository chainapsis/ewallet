use elliptic_curve::bigint::Encoding;
use elliptic_curve::Field;

use crate::compat::CSCurve;
use crate::sss::keyshares::KeysharePoints;
use crate::sss::point::Point256;

pub fn combine<C: CSCurve>(split_points: Vec<Point256>, t: u32) -> Result<[u8; 32], String> {
    let mut secret_scalar: C::Scalar = C::Scalar::ZERO;
    let ksp = KeysharePoints::new(split_points.clone());
    let keyshare_points = match ksp {
        Ok(val) => val,
        Err(e) => return Err(e),
    };

    for (_, point) in keyshare_points.to_point_vec().iter().enumerate() {
        let lagrange_coefficient = lagrange_coefficient::<C>(keyshare_points.clone(), point);
        if lagrange_coefficient.is_err() {
            return Err(lagrange_coefficient.err().unwrap());
        }
        secret_scalar += point.y_scalar::<C>() * lagrange_coefficient.unwrap();
    }

    let secret_bytes = Into::<C::Uint>::into(secret_scalar).to_be_bytes();
    let secret: Result<[u8; 32], String> = secret_bytes
        .as_ref()
        .try_into()
        .map_err(|_| "Failed to convert secret to Vec<u8>".to_string());
    let secret = match secret {
        Ok(val) => val,
        Err(_) => return Err("Failed to convert secret to Vec<u8>".to_string()),
    };

    Ok(secret)
}

// participants.rs
// Get the lagrange coefficient for a participant, relative to this list.
pub fn lagrange_coefficient<C: CSCurve>(
    ksp: KeysharePoints,
    p: &Point256,
) -> Result<C::Scalar, String> {
    if !ksp.contain_point(p) {
        return Err("Participant p is not included in participants".to_string());
    }

    let p_scalar = p.x_scalar::<C>();

    let mut top = C::Scalar::ONE;
    let mut bot = C::Scalar::ONE;
    for q in ksp.to_point_vec() {
        if p.x_scalar::<C>() == q.x_scalar::<C>() {
            continue;
        }
        let q_scalar = q.x_scalar::<C>();
        top *= q_scalar;
        bot *= q_scalar - p_scalar;
    }

    let bot_inverse_opt = bot.invert();
    let bot_inverse = match bot_inverse_opt.is_none().into() {
        true => return Err("Failed to invert bot".to_string()),
        false => bot_inverse_opt.unwrap(),
    };
    let result = top * bot_inverse;

    Ok(result)
}
