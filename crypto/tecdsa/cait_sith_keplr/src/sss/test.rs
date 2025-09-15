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
    let p1 = Point256 {
        x: [0; 32],
        y: [0; 32],
    };
    let p2 = Point256 {
        x: [1; 32],
        y: [1; 32],
    };
    // let p3 = Participant::from(3u32);

    let lagrange = lagrange_coefficient::<Secp256k1>(vec![p1.clone(), p2.clone()], &p1);
    // 2 * inverse of 1
    println!("lagrange: {:?}", lagrange);
}
