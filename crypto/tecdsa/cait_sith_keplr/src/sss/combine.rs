use elliptic_curve::bigint::Encoding;
use elliptic_curve::Field;

use crate::compat::CSCurve;
use crate::sss::keyshares::KeysharePoints;
use crate::sss::lagrange_coefficient_at_zero;
use crate::sss::point::Point256;

pub fn combine<C: CSCurve>(split_points: Vec<Point256>, t: u32) -> Result<[u8; 32], String> {
    let mut secret_scalar: C::Scalar = C::Scalar::ZERO;

    if split_points.len() < t as usize {
        return Err("Split points must be greater than t".to_string());
    }

    let ksp = KeysharePoints::new(
        split_points
            .iter()
            .take(t as usize)
            .cloned()
            .collect::<Vec<_>>(),
    );
    let keyshare_points = match ksp {
        Ok(val) => val,
        Err(e) => return Err(e),
    };

    for (_, point) in keyshare_points.to_point_vec().iter().enumerate() {
        let lagrange_coefficient = lagrange_coefficient_at_zero::<C>(&keyshare_points, point);
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
