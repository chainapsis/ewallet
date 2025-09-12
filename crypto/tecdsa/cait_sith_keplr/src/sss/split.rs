use elliptic_curve::bigint::Encoding;
use elliptic_curve::ScalarPrimitive;
use rand_core::OsRng;

use crate::compat::CSCurve;
use crate::math::Polynomial;
use crate::sss::point::Point256;

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
    if secret.len() != 32 {
        return Err("Secret must be 32 bytes".to_string());
    }

    if ks_node_hashes.len() < t {
        return Err("KS node hashes must be greater than t".to_string());
    }

    if t < 2 {
        return Err("T must be greater than 2".to_string());
    }

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
