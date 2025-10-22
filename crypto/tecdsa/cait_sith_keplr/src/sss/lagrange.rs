use elliptic_curve::Field;

use crate::compat::CSCurve;
use crate::sss::keyshares::KeysharePoints;
use crate::sss::point::Point256;

pub fn lagrange_coefficient_at_zero<C: CSCurve>(
    ksp: &KeysharePoints,
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
