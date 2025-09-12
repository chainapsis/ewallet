use k256::Secp256k1;

use crate::{
    protocol::Participant,
    sss::split::{self, lagrange},
};

#[test]
fn test_foo_123() {
    println!("test 123");

    let _ret = split::split::<Secp256k1>(vec![1, 2, 3, 4, 5, 6, 7, 8], vec![], 3);
}

#[test]
fn test_lagrange() {
    let p1 = Participant::from(1u32);
    let p2 = Participant::from(2u32);
    // let p3 = Participant::from(3u32);

    let lagrange = lagrange::<Secp256k1>(&[p1, p2], p1);
    // 2 * inverse of 1
    println!("lagrange: {:?}", lagrange);
}
