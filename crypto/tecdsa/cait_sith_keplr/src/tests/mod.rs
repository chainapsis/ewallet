use crate::get_version;

#[cfg(test)]
mod test2;

#[cfg(test)]
mod test_keygen_centralized;

#[cfg(test)]
mod cli_srv;

#[cfg(test)]
mod cli_srv_2;

#[test]
pub fn test_get_version() {
    get_version();
}
