use elliptic_curve::bigint::Encoding;
use elliptic_curve::ScalarPrimitive;
use rand_core::OsRng;

use crate::compat::CSCurve;
use crate::math::Polynomial;
use crate::sss::point::Point256;

pub fn split<C: CSCurve>(
    secret: [u8; 32],
    ks_node_hashes: Vec<[u8; 32]>,
    t: u32,
) -> Result<Vec<Point256>, String> {
    if secret.len() != 32 {
        return Err("Secret must be 32 bytes".to_string());
    }

    if (ks_node_hashes.len() as u32) < t {
        return Err("KS node hashes must be greater than t".to_string());
    }

    if t < 2 {
        return Err("T must be greater than 2".to_string());
    }

    let secret_scalar = ScalarPrimitive::<C>::from_slice(&secret)
        .map_err(|err| format!("Failed to convert secret to scalar, err: {}", err))?;
    let constant = C::Scalar::from(secret_scalar);

    let mut rng = OsRng;

    let polynomial = Polynomial::<C>::extend_random(&mut rng, t as usize, &constant);

    let truncate_hashes = ks_node_hashes
        .iter()
        // .take(t as usize)
        .collect::<Vec<_>>();

    let ks_node_hash_scalars = truncate_hashes
        .iter()
        .map(|&hash| {
            let sp = ScalarPrimitive::<C>::from_slice(hash)
                .map_err(|err| format!("Failed to convert hash to scalar, err: {}", err))?;
            Ok(C::Scalar::from(sp))
        })
        .collect::<Result<Vec<C::Scalar>, String>>()?;

    let points = ks_node_hash_scalars
        .iter()
        .map(|x_scalar| {
            let x_bytes = Into::<C::Uint>::into(*x_scalar).to_be_bytes();

            let y_scalar = polynomial.evaluate(x_scalar);
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
