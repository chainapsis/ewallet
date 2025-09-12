use k256::Secp256k1;

use crate::{
    protocol::Participant,
    sss::split::{self, lagrange},
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
    let ret = split::split::<Secp256k1>(
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
    let ret = split::split::<Secp256k1>(
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
    let p1 = Participant::from(1u32);
    let p2 = Participant::from(2u32);
    // let p3 = Participant::from(3u32);

    let lagrange = lagrange::<Secp256k1>(&[p1, p2], p1);
    // 2 * inverse of 1
    println!("lagrange: {:?}", lagrange);
}
