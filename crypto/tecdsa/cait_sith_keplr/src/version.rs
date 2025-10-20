pub fn get_version() -> &'static str {
    let crate_version = env!("CARGO_PKG_VERSION");
    return crate_version;
}
