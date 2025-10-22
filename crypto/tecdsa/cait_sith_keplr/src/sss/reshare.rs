use elliptic_curve::bigint::Encoding;
use elliptic_curve::Field;
use elliptic_curve::ScalarPrimitive;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};

use crate::compat::CSCurve;
use crate::math::Polynomial;
use crate::sss::keyshares::KeysharePoints;
use crate::sss::lagrange_coefficient_at_x;
use crate::sss::lagrange_coefficient_at_zero;
use crate::sss::point::Point256;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReshareResult {
    pub t: u32,
    pub reshared_points: Vec<Point256>,
    pub secret: [u8; 32],
}

pub fn reshare<C: CSCurve>(
    split_points: Vec<Point256>,
    new_ks_node_hashes: Vec<[u8; 32]>,
    t: u32,
) -> Result<ReshareResult, String> {
    let mut secret_scalar: C::Scalar = C::Scalar::ZERO;

    if split_points.len() < t as usize {
        return Err("Split points must be greater than t".to_string());
    }

    if new_ks_node_hashes.len() < t as usize {
        return Err("New KS node hashes must be greater than t".to_string());
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

    let secret_scalar = ScalarPrimitive::<C>::from_slice(&secret)
        .map_err(|err| format!("Failed to convert secret to scalar, err: {}", err))?;
    let constant = C::Scalar::from(secret_scalar);

    let mut rng = OsRng;

    // random sampling
    let polynomial = Polynomial::<C>::extend_random(&mut rng, t as usize, &constant);

    let new_ks_node_hash_scalars = new_ks_node_hashes
        .iter()
        .map(|&hash| {
            let sp = ScalarPrimitive::<C>::from_slice(hash.as_slice())
                .map_err(|err| format!("Failed to convert hash to scalar, err: {}", err))?;
            Ok(C::Scalar::from(sp))
        })
        .collect::<Result<Vec<C::Scalar>, String>>()?;

    let new_points = new_ks_node_hash_scalars
        .iter()
        .map(|x_scalar| {
            let x_bytes = Into::<C::Uint>::into(*x_scalar).to_be_bytes();

            let y_scalar = polynomial.evaluate(x_scalar);
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

    Ok(ReshareResult {
        t,
        reshared_points: new_points,
        secret,
    })
}

pub fn expand_shares<C: CSCurve>(
    split_points: Vec<Point256>,
    additional_ks_node_hashes: Vec<[u8; 32]>,
    t: u32,
) -> Result<ReshareResult, String> {
    if split_points.len() < t as usize {
        return Err("split points must be greater than t".to_string());
    }
    for (_, split_point) in split_points.iter().enumerate() {
        for (_, new_ks_node_hash) in additional_ks_node_hashes.iter().enumerate() {
            if split_point.x == *new_ks_node_hash {
                return Err("new hash is already included in split points".to_string());
            }
        }
    }

    // take first t points
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

    // recover secret
    let mut secret_scalar: C::Scalar = C::Scalar::ZERO;
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

    // commit new points for new KS nodes
    let new_ks_node_hash_scalars = additional_ks_node_hashes
        .iter()
        .map(|&hash| {
            let sp = ScalarPrimitive::<C>::from_slice(hash.as_slice())
                .map_err(|err| format!("Failed to convert hash to scalar, err: {}", err))?;
            Ok(C::Scalar::from(sp))
        })
        .collect::<Result<Vec<C::Scalar>, String>>()?;

    let new_points = new_ks_node_hash_scalars
        .iter()
        .map(|x_scalar| {
            let x_bytes = Into::<C::Uint>::into(*x_scalar).to_be_bytes();

            let mut y_scalar: C::Scalar = C::Scalar::ZERO;
            for (_, point) in keyshare_points.to_point_vec().iter().enumerate() {
                let lagrange_coefficient =
                    lagrange_coefficient_at_x::<C>(&keyshare_points, point, x_scalar);
                if lagrange_coefficient.is_err() {
                    return Err(lagrange_coefficient.err().unwrap());
                }
                y_scalar += point.y_scalar::<C>() * lagrange_coefficient.unwrap();
            }
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

    let reshared_points = [split_points.clone(), new_points].concat();

    Ok(ReshareResult {
        t,
        reshared_points,
        secret,
    })
}
