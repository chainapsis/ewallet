use elliptic_curve::{Curve, CurveArithmetic, ScalarPrimitive};
use k256::Secp256k1;
use rand_core::OsRng;
use rand_core::RngCore;

use crate::sss::split::split;
use crate::sss::{combine::combine, combine::lagrange_coefficient, point::Point256, split};

#[test]
#[should_panic]
fn test_split_overflow() {
    let ret = split::split::<Secp256k1>(
        vec![
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        ], // 32bytes
        vec![],
        3,
    );
}

#[test]
#[should_panic]
fn test_split_shorter_length() {
    let _ret = split::split::<Secp256k1>(
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0,
        ], // 31 bytes
        vec![],
        3,
    );
}

#[test]
#[should_panic]
fn test_split_longer_length() {
    let _ret = split::split::<Secp256k1>(
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 1,
        ], // 33 bytes
        vec![],
        3,
    );
}

#[test]
fn test_split_success() {
    let ks_node_hashes = vec![
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 3,
        ],
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 4,
        ],
    ];

    let ret = split::split::<Secp256k1>(
        vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
        ks_node_hashes,
        3,
    );
}

#[test]
fn test_simple_lagrange_coeffs() {
    // p1 = (1, 1), p2 = (2, 2)
    let p1 = Point256 {
        x: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
        y: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
    };
    let p2 = Point256 {
        x: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
        y: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
    };

    let lagrange_p1 = lagrange_coefficient::<Secp256k1>(vec![p1, p2], &p1).unwrap();
    // 2 * inverse of (2 - 1) = 1
    assert_eq!(
        lagrange_p1,
        <Secp256k1 as CurveArithmetic>::Scalar::from(2u64)
    );

    let lagrange_p2 = lagrange_coefficient::<Secp256k1>(vec![p1, p2], &p2).unwrap();
    // 1 * inverse of (1 - 2) = neg_one
    println!("lagrange_p2: {:?}", lagrange_p2);

    let neg_one = Secp256k1::ORDER.sub_mod(
        &<Secp256k1 as CurveArithmetic>::Scalar::ONE.into(),
        &Secp256k1::ORDER,
    );
    let neg_one_inverse = neg_one.inv_mod(&Secp256k1::ORDER);
    println!("mo_inverse: {:?}", neg_one_inverse.0);

    let neg_one_scalar_primitive = ScalarPrimitive::<Secp256k1>::new(neg_one_inverse.0).unwrap();
    let neg_one_scalar = <Secp256k1 as CurveArithmetic>::Scalar::from(neg_one_scalar_primitive);

    assert_eq!(lagrange_p2, neg_one_scalar);
}

#[test]
fn test_lagrange_coeffs() {
    // N = 3 & T = 3
    // random 32 bytes
    let mut rng = OsRng;
    let mut random_bytes = [0u8; 32];
    let _ = rng.try_fill_bytes(&mut random_bytes);
    let random_bytes = random_bytes;
    let p1 = Point256 {
        x: random_bytes,
        y: random_bytes,
    };

    let mut random_bytes_2 = [0u8; 32];
    let _ = rng.try_fill_bytes(&mut random_bytes_2);
    let p2 = Point256 {
        x: random_bytes_2,
        y: random_bytes_2,
    };
    let mut random_bytes_3 = [0u8; 32];
    let _ = rng.try_fill_bytes(&mut random_bytes_3);
    let p3 = Point256 {
        x: random_bytes_3,
        y: random_bytes_3,
    };

    let mut secret = [0u8; 32];
    let _ = rng.try_fill_bytes(&mut secret);
    let secret = secret.to_vec();

    let ks_node_hashes = vec![p1.x.to_vec(), p2.x.to_vec(), p3.x.to_vec()];
    let t = ks_node_hashes.len();

    let split_points = split::<Secp256k1>(secret.clone(), ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);

    let combined_secret = combine::<Secp256k1>(split_points).unwrap();
    println!("combined_secret: {:?}", combined_secret);

    assert_eq!(secret, combined_secret);
}

#[test]
#[should_panic]
fn test_secret_overflow_split() {
    // p1 = (1, 1), p2 = (2, 2)
    let p1 = Point256 {
        x: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
        y: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
    };
    let p2 = Point256 {
        x: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
        y: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
    };
    let secret = [255u8; 32].to_vec();

    let ks_node_hashes = vec![p1.x.to_vec(), p2.x.to_vec()];
    let t = ks_node_hashes.len();

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);
}

#[test]
#[should_panic]
fn test_hashes_overflow_split() {
    let secret = [1u8; 32].to_vec();

    let p1 = [255u8; 32].to_vec();
    let mut p2 = [255u8; 32].to_vec();
    p2[31] = 1;
    let ks_node_hashes = vec![p1, p2];
    let t = ks_node_hashes.len();

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);
}
