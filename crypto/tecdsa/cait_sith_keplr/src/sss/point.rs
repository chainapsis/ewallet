use elliptic_curve::Scalar;
use elliptic_curve::ScalarPrimitive;
use serde::{Deserialize, Serialize};

use crate::compat::CSCurve;

#[derive(Debug, Copy, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Point256 {
    pub x: [u8; 32],
    pub y: [u8; 32],
}

impl Point256 {
    pub fn x_scalar<C: CSCurve>(&self) -> C::Scalar {
        let x_scalar_primitive = ScalarPrimitive::<C>::from_slice(&self.x).unwrap();
        let x_scalar = Scalar::<C>::from(x_scalar_primitive);
        x_scalar
    }

    pub fn y_scalar<C: CSCurve>(&self) -> C::Scalar {
        let y_scalar_primitive = ScalarPrimitive::<C>::from_slice(&self.y).unwrap();
        let y_scalar = Scalar::<C>::from(y_scalar_primitive);
        y_scalar
    }
}

#[cfg(test)]
mod tests {
    use elliptic_curve::CurveArithmetic;
    use k256::Secp256k1;

    use super::*;

    #[test]
    fn test_point256() {
        let mut point = Point256 {
            x: [0; 32],
            y: [0; 32],
        };
        point.y[31] = 1;
        let x_scalar = point.x_scalar::<Secp256k1>();
        assert_eq!(x_scalar, <Secp256k1 as CurveArithmetic>::Scalar::ZERO);
        let y_scalar = point.y_scalar::<Secp256k1>();
        assert_eq!(y_scalar, <Secp256k1 as CurveArithmetic>::Scalar::ONE);
    }
}
