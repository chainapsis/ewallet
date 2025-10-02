use elliptic_curve::bigint::Encoding;
use elliptic_curve::Field;
use elliptic_curve::ScalarPrimitive;
use rand_core::OsRng;

use crate::compat::CSCurve;
use crate::math::Polynomial;
use crate::sss::keyshares::KeysharePoints;
use crate::sss::lagrange_coefficient;
use crate::sss::point::Point256;

pub fn reshare<C: CSCurve>(split_points: Vec<Point256>, t: u32) -> Result<Vec<Point256>, String> {
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
        let lagrange_coefficient = lagrange_coefficient::<C>(&keyshare_points, point);
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

    let secret_scalar = ScalarPrimitive::<C>::from_slice(&secret)
        .map_err(|err| format!("Failed to convert secret to scalar, err: {}", err))?;
    let constant = C::Scalar::from(secret_scalar);

    let mut rng = OsRng;

    let polynomial = Polynomial::<C>::extend_random(&mut rng, t as usize, &constant);

    let points = split_points
        .iter()
        .map(|point| {
            let x_scalar = point.x_scalar::<C>();
            let x_bytes = Into::<C::Uint>::into(x_scalar).to_be_bytes();

            let y_scalar = polynomial.evaluate(&x_scalar);
            {}
            let y_bytes = Into::<C::Uint>::into(y_scalar).to_be_bytes();

            let x: Result<[u8; 32], String> = x_bytes
                .as_ref()
                .try_into()
                .map_err(|_| "Failed to convert x to [u8; 32]".to_string());
            let y: Result<[u8; 32], String> = y_bytes
                .as_ref()
                .try_into()
                .map_err(|_| "Failed to convert y to [u8; 32]".to_string());

            let x = match x {
                Ok(val) => val,
                Err(_) => return Err("Failed to convert x to [u8; 32]".to_string()),
            };
            let y = match y {
                Ok(val) => val,
                Err(_) => return Err("Failed to convert y to [u8; 32]".to_string()),
            };

            let point = Point256 { x, y };

            Ok(point)
        })
        .collect::<Result<Vec<Point256>, String>>()?;

    Ok(points)
}
