use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Point256 {
    pub x: [u8; 32],
    pub y: [u8; 32],
}
