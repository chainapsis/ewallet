use elliptic_curve::{Curve, CurveArithmetic, ScalarPrimitive};
use k256::Secp256k1;
use rand_core::OsRng;
use rand_core::RngCore;

use crate::sss::keyshares::KeysharePoints;
use crate::sss::{combine::combine, combine::lagrange_coefficient, point::Point256, split};

#[test]
fn test_no_ks_node_hashes() {
    let ret = split::split::<Secp256k1>(
        [
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        ], // 32bytes
        vec![],
        3,
    );
    assert_eq!(
        ret.err(),
        Some("KS node hashes must be greater than t".to_string())
    );
}

#[test]
fn test_split_success() {
    let ks_node_hashes = vec![
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 3,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 4,
        ],
    ];

    let ret = split::split::<Secp256k1>(
        [
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

    let lagrange_p1 =
        lagrange_coefficient::<Secp256k1>(&KeysharePoints::new(vec![p1, p2]).unwrap(), &p1)
            .unwrap();
    // 2 * inverse of (2 - 1) = 1
    assert_eq!(
        lagrange_p1,
        <Secp256k1 as CurveArithmetic>::Scalar::from(2u64)
    );

    let lagrange_p2 =
        lagrange_coefficient::<Secp256k1>(&KeysharePoints::new(vec![p1, p2]).unwrap(), &p2)
            .unwrap();
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
fn test_split_and_combine() {
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
    let secret = secret;

    let ks_node_hashes = vec![p1.x, p2.x, p3.x];
    let t = ks_node_hashes.len() as u32;

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);

    let combined_secret = combine::<Secp256k1>(split_points, t).unwrap();
    println!("combined_secret: {:?}", combined_secret);

    assert_eq!(secret, combined_secret);
}

#[test]
fn test_split_and_combine_n3_t2() {
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
    let secret = secret;

    let ks_node_hashes = vec![p1.x, p2.x, p3.x];
    let t = 2; // threshold = 2

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points (N=3, T=2): {:?}", split_points);

    // Test combining with first 2 points
    let first_two_points = vec![split_points[0].clone(), split_points[1].clone()];
    let combined_secret_1_2 = combine::<Secp256k1>(first_two_points, t).unwrap();
    println!("combined_secret (points 1,2): {:?}", combined_secret_1_2);
    assert_eq!(secret, combined_secret_1_2);

    // Test combining with points 1 and 3
    let points_1_3 = vec![split_points[0].clone(), split_points[2].clone()];
    let combined_secret_1_3 = combine::<Secp256k1>(points_1_3, t).unwrap();
    println!("combined_secret (points 1,3): {:?}", combined_secret_1_3);
    assert_eq!(secret, combined_secret_1_3);

    // Test combining with points 2 and 3
    let points_2_3 = vec![split_points[1].clone(), split_points[2].clone()];
    let combined_secret_2_3 = combine::<Secp256k1>(points_2_3, t).unwrap();
    println!("combined_secret (points 2,3): {:?}", combined_secret_2_3);
    assert_eq!(secret, combined_secret_2_3);
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
    let secret = [255u8; 32];

    let ks_node_hashes = vec![p1.x, p2.x];
    let t = ks_node_hashes.len() as u32;

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);
}

#[test]
#[should_panic]
fn test_hashes_overflow_split() {
    let secret = [1u8; 32];

    let p1 = [255u8; 32];
    let mut p2 = [255u8; 32];
    p2[31] = 1;
    let ks_node_hashes = vec![p1, p2];
    let t = ks_node_hashes.len() as u32;

    let split_points = split::<Secp256k1>(secret, ks_node_hashes, t).unwrap();
    println!("split_points: {:?}", split_points);
}

#[test]
fn test_t_too_small() {
    let ret = split::split::<Secp256k1>(
        [0; 32],
        vec![[0; 32], [1; 32]],
        1, // t = 1, should be >= 2
    );
    assert_eq!(ret.err(), Some("T must be greater than 2".to_string()));
}

#[test]
fn test_combine_insufficient_points() {
    let ret = combine::<Secp256k1>(vec![], 0); // Empty points
                                               //
                                               // println!("ret: {:?}", ret);

    assert_eq!(ret.is_err(), true);

    let single_point = vec![Point256 {
        x: [0; 32],
        y: [1; 32],
    }];
    let ret = combine::<Secp256k1>(single_point, 1);
    assert_eq!(ret.is_err(), true);
}

#[test]
fn test_combine_zero_x_point() {
    let points = vec![
        Point256 {
            x: [0; 32], // x is zero, should fail
            y: [1; 32],
        },
        Point256 {
            x: [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 2,
            ],
            y: [2; 32],
        },
    ];
    let ret = combine::<Secp256k1>(points, 2);

    assert_eq!(ret.is_err(), true);
}

#[test]
fn test_keyshares_points_duplicate_x() {
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
            0, 0, 1,
        ], // Same x as p1
        y: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2,
        ],
    };

    // This should work since duplicate x values are skipped in lagrange_coefficient
    assert!(KeysharePoints::new(vec![p1, p2]).is_err());
}
