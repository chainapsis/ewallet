use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use crate::sss::point::Point256;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct KeysharePoints {
    keyshare_points: Vec<Point256>,
}

impl KeysharePoints {
    pub fn new(keyshare_points: Vec<Point256>) -> Result<Self, String> {
        if keyshare_points.len() < 2 {
            return Err("keyshare_points must have at least 2 points".to_string());
        }
        if !validate_x(&keyshare_points) {
            return Err("Duplicate x-coordinates found in keyshare_points".to_string());
        }
        Ok(Self { keyshare_points })
    }

    pub fn len(&self) -> usize {
        self.keyshare_points.len()
    }

    pub fn contain_point(&self, point: &Point256) -> bool {
        self.keyshare_points.contains(point)
    }

    pub fn to_point_vec(&self) -> Vec<Point256> {
        self.keyshare_points.clone()
    }
}

fn validate_x(keyshare_points: &Vec<Point256>) -> bool {
    let mut x_set = HashSet::new();
    for point in keyshare_points {
        if point.x == [0; 32] {
            return false;
        }
        if x_set.contains(&point.x) {
            return false;
        }
        x_set.insert(point.x);
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_duplicate_x() {
        let points = vec![
            Point256 {
                x: [0; 32],
                y: [0; 32],
            },
            Point256 {
                x: [0; 32],
                y: [0; 32],
            },
        ];
        assert!(!validate_x(&points));

        let points_2 = vec![
            Point256 {
                x: [1; 32],
                y: [0; 32],
            },
            Point256 {
                x: [0; 32],
                y: [0; 32],
            },
        ];
        assert!(!validate_x(&points_2));

        let points_3 = vec![
            Point256 {
                x: [1; 32],
                y: [0; 32],
            },
            Point256 {
                x: [2; 32],
                y: [0; 32],
            },
        ];
        assert!(validate_x(&points_3));
    }
}
