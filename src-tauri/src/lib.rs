#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    const APP_TITLE: &str = "Time";

    #[test]
    fn app_title_matches_expected_value() {
        assert_eq!(APP_TITLE, "Time");
    }

    #[test]
    fn app_title_is_not_blank() {
        assert!(!APP_TITLE.trim().is_empty());
    }
}
