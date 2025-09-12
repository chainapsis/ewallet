use k256::Secp256k1;

use crate::sss::split;

#[test]
fn test_foo_123() {
    println!("test 123");
    // let participants = vec![Participant::from(0u32), Participant::from(1u32)];
    //

    let _ret = split::split::<Secp256k1>(vec![], vec![], 0);
}
