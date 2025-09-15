use digest::consts::U256;
use elliptic_curve::{bigint::Uint, Curve, CurveArithmetic, ScalarPrimitive};
use k256::Secp256k1;

use crate::{
    protocol::Participant,
    sss::{combine::lagrange_coefficient, point::Point256, split},
};

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
fn test_lagrange() {
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

    let lagrange_p1 = lagrange_coefficient::<Secp256k1>(vec![p1, p2], &p1);
    // 2 * inverse of (2 - 1) = 1
    assert_eq!(
        lagrange_p1,
        <Secp256k1 as CurveArithmetic>::Scalar::from(2u64)
    );

    let lagrange_p2 = lagrange_coefficient::<Secp256k1>(vec![p1, p2], &p2);
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
