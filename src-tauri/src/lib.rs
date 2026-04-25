use std::{
    fs,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
};

use serde::{Deserialize, Serialize};
use tauri::{
    image::Image,
    menu::{
        CheckMenuItem, CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, PredefinedMenuItem,
        SubmenuBuilder,
    },
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Listener, Manager, Runtime, WebviewUrl, WebviewWindowBuilder,
};

const MAIN_WINDOW_LABEL: &str = "main";
const SETTINGS_WINDOW_LABEL: &str = "settings";
const TRAY_ICON_ID: &str = "main-tray";
const APP_MENU_OPEN_SETTINGS_MENU_ID: &str = "app-open-settings";
const APP_MENU_MODE_STANDARD_MENU_ID: &str = "app-mode-standard";
const APP_MENU_MODE_MINIMAL_MENU_ID: &str = "app-mode-minimal";
const APP_MENU_MODE_FOCUS_MENU_ID: &str = "app-mode-focus";
const APP_MENU_MODE_AMBIENT_MENU_ID: &str = "app-mode-ambient";
const APP_MENU_TOGGLE_ALWAYS_ON_TOP_MENU_ID: &str = "app-toggle-always-on-top";
const APP_MENU_TOGGLE_VISIBILITY_MENU_ID: &str = "app-toggle-visibility";
const APP_MENU_QUIT_MENU_ID: &str = "app-quit";
const TRAY_OPEN_SETTINGS_MENU_ID: &str = "tray-open-settings";
const TRAY_MODE_STANDARD_MENU_ID: &str = "tray-mode-standard";
const TRAY_MODE_MINIMAL_MENU_ID: &str = "tray-mode-minimal";
const TRAY_MODE_FOCUS_MENU_ID: &str = "tray-mode-focus";
const TRAY_MODE_AMBIENT_MENU_ID: &str = "tray-mode-ambient";
const TRAY_TOGGLE_ALWAYS_ON_TOP_MENU_ID: &str = "tray-toggle-always-on-top";
const TRAY_TOGGLE_VISIBILITY_MENU_ID: &str = "tray-toggle-visibility";
const TRAY_QUIT_MENU_ID: &str = "tray-quit";
const SETTINGS_SYNC_EVENT: &str = "settings:sync";
const ALWAYS_ON_TOP_CHANGED_EVENT: &str = "settings:always-on-top-changed";
const DISPLAY_MODE_CHANGED_EVENT: &str = "settings:display-mode-changed";
const SETTINGS_FILE_NAME: &str = "config.json";
const TRAY_TEMPLATE_ICON_BYTES: &[u8] = include_bytes!("../icons/tray-template/64x64.png");
const UPDATER_PUBKEY_PLACEHOLDER: &str = "__TAURI_UPDATER_PUBKEY__";
const RAW_TAURI_CONFIG: &str = include_str!("../tauri.conf.json");

#[derive(Default)]
struct AppState {
    always_on_top: AtomicBool,
    display_mode: Mutex<DisplayMode>,
}

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
enum DisplayMode {
    #[default]
    Standard,
    Minimal,
    Focus,
    Ambient,
}

impl DisplayMode {
    fn from_str(value: &str) -> Option<Self> {
        match value {
            "standard" => Some(Self::Standard),
            "minimal" => Some(Self::Minimal),
            "focus" => Some(Self::Focus),
            "ambient" => Some(Self::Ambient),
            _ => None,
        }
    }

    fn from_menu_id(menu_id: &str) -> Option<Self> {
        match menu_id {
            APP_MENU_MODE_STANDARD_MENU_ID | TRAY_MODE_STANDARD_MENU_ID => Some(Self::Standard),
            APP_MENU_MODE_MINIMAL_MENU_ID | TRAY_MODE_MINIMAL_MENU_ID => Some(Self::Minimal),
            APP_MENU_MODE_FOCUS_MENU_ID | TRAY_MODE_FOCUS_MENU_ID => Some(Self::Focus),
            APP_MENU_MODE_AMBIENT_MENU_ID | TRAY_MODE_AMBIENT_MENU_ID => Some(Self::Ambient),
            _ => None,
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Standard => "standard",
            Self::Minimal => "minimal",
            Self::Focus => "focus",
            Self::Ambient => "ambient",
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SettingsSyncPayload {
    always_on_top: bool,
    display_mode: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AlwaysOnTopChangedPayload {
    always_on_top: bool,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DisplayModeChangedPayload {
    display_mode: String,
}

struct ModeMenuItems<R: Runtime> {
    standard: CheckMenuItem<R>,
    minimal: CheckMenuItem<R>,
    focus: CheckMenuItem<R>,
    ambient: CheckMenuItem<R>,
}

impl<R: Runtime> Clone for ModeMenuItems<R> {
    fn clone(&self) -> Self {
        Self {
            standard: self.standard.clone(),
            minimal: self.minimal.clone(),
            focus: self.focus.clone(),
            ambient: self.ambient.clone(),
        }
    }
}

fn settings_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;

    Ok(config_dir.join(SETTINGS_FILE_NAME))
}

#[tauri::command]
fn load_settings(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
    let path = settings_file_path(&app)?;

    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let settings = serde_json::from_str(&contents).map_err(|error| error.to_string())?;

    Ok(Some(settings))
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: serde_json::Value) -> Result<(), String> {
    let path = settings_file_path(&app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let contents = serde_json::to_string_pretty(&settings).map_err(|error| error.to_string())?;
    fs::write(path, contents).map_err(|error| error.to_string())
}

#[tauri::command]
fn open_settings(app: AppHandle) -> Result<(), String> {
    open_settings_window(&app).map_err(|error| error.to_string())
}

#[tauri::command]
fn hide_main_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.hide();
    }
}

#[tauri::command]
fn quit_time(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn set_show_dock_icon(app: AppHandle, show_dock_icon: bool) {
    #[cfg(target_os = "macos")]
    let _ = app.set_activation_policy(if show_dock_icon {
        tauri::ActivationPolicy::Regular
    } else {
        tauri::ActivationPolicy::Accessory
    });

    #[cfg(not(target_os = "macos"))]
    let _ = (app, show_dock_icon);
}

fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn open_settings_window<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW_LABEL) {
        let _ = window.set_always_on_top(true);
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    let window = WebviewWindowBuilder::new(app, SETTINGS_WINDOW_LABEL, WebviewUrl::default())
        .title("Settings")
        .inner_size(860.0, 520.0)
        .min_inner_size(720.0, 460.0)
        .resizable(true)
        .always_on_top(true)
        .center()
        .build()?;

    let _ = window.set_always_on_top(true);
    let _ = window.set_focus();
    Ok(())
}

fn sync_always_on_top<R: Runtime>(
    app: &AppHandle<R>,
    always_on_top: bool,
    tray_toggle_item: &CheckMenuItem<R>,
    app_menu_toggle_item: &CheckMenuItem<R>,
    emit_event: bool,
) {
    let state = app.state::<AppState>();
    let previous_value = state.always_on_top.swap(always_on_top, Ordering::Relaxed);

    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.set_always_on_top(always_on_top);
    }

    let _ = tray_toggle_item.set_checked(always_on_top);
    let _ = app_menu_toggle_item.set_checked(always_on_top);
    if emit_event && previous_value != always_on_top {
        let _ = app.emit(
            ALWAYS_ON_TOP_CHANGED_EVENT,
            AlwaysOnTopChangedPayload { always_on_top },
        );
    }
}

fn sync_display_mode<R: Runtime>(
    app: &AppHandle<R>,
    display_mode: DisplayMode,
    tray_mode_items: &ModeMenuItems<R>,
    app_menu_mode_items: &ModeMenuItems<R>,
    emit_event: bool,
) {
    let state = app.state::<AppState>();
    let mut should_emit = false;
    if let Ok(mut current_display_mode) = state.display_mode.lock() {
        should_emit = *current_display_mode != display_mode;
        *current_display_mode = display_mode;
    }

    update_mode_menu_items(tray_mode_items, display_mode);
    update_mode_menu_items(app_menu_mode_items, display_mode);
    if emit_event && should_emit {
        let _ = app.emit(
            DISPLAY_MODE_CHANGED_EVENT,
            DisplayModeChangedPayload {
                display_mode: display_mode.as_str().to_string(),
            },
        );
    }
}

fn update_mode_menu_items<R: Runtime>(items: &ModeMenuItems<R>, display_mode: DisplayMode) {
    let _ = items.standard.set_checked(display_mode == DisplayMode::Standard);
    let _ = items.minimal.set_checked(display_mode == DisplayMode::Minimal);
    let _ = items.focus.set_checked(display_mode == DisplayMode::Focus);
    let _ = items.ambient.set_checked(display_mode == DisplayMode::Ambient);
}

fn handle_menu_action<R: Runtime>(
    app: &AppHandle<R>,
    menu_id: &str,
    tray_toggle_item: &CheckMenuItem<R>,
    app_menu_toggle_item: &CheckMenuItem<R>,
    tray_mode_items: &ModeMenuItems<R>,
    app_menu_mode_items: &ModeMenuItems<R>,
) {
    match menu_id {
        APP_MENU_OPEN_SETTINGS_MENU_ID | TRAY_OPEN_SETTINGS_MENU_ID => {
            let _ = open_settings_window(app);
        }
        APP_MENU_TOGGLE_VISIBILITY_MENU_ID | TRAY_TOGGLE_VISIBILITY_MENU_ID => {
            toggle_main_window_visibility(app);
        }
        APP_MENU_TOGGLE_ALWAYS_ON_TOP_MENU_ID | TRAY_TOGGLE_ALWAYS_ON_TOP_MENU_ID => {
            let state = app.state::<AppState>();
            let next_value = !state.always_on_top.load(Ordering::Relaxed);

            sync_always_on_top(app, next_value, tray_toggle_item, app_menu_toggle_item, true);
        }
        APP_MENU_MODE_STANDARD_MENU_ID
        | APP_MENU_MODE_MINIMAL_MENU_ID
        | APP_MENU_MODE_FOCUS_MENU_ID
        | APP_MENU_MODE_AMBIENT_MENU_ID
        | TRAY_MODE_STANDARD_MENU_ID
        | TRAY_MODE_MINIMAL_MENU_ID
        | TRAY_MODE_FOCUS_MENU_ID
        | TRAY_MODE_AMBIENT_MENU_ID => {
            if let Some(display_mode) = DisplayMode::from_menu_id(menu_id) {
                sync_display_mode(
                    app,
                    display_mode,
                    tray_mode_items,
                    app_menu_mode_items,
                    true,
                );
            }
        }
        APP_MENU_QUIT_MENU_ID | TRAY_QUIT_MENU_ID => {
            app.exit(0);
        }
        _ => {}
    }
}

fn toggle_main_window_visibility<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        match window.is_visible() {
            Ok(true) => {
                let _ = window.hide();
            }
            _ => show_main_window(app),
        }
    }
}

fn build_system_ui<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let app_menu_open_settings =
        MenuItemBuilder::with_id(APP_MENU_OPEN_SETTINGS_MENU_ID, "Settings...")
            .accelerator("CmdOrCtrl+,")
            .build(app)?;
    let app_menu_toggle_visibility =
        MenuItemBuilder::with_id(APP_MENU_TOGGLE_VISIBILITY_MENU_ID, "Show / Hide").build(app)?;
    let app_menu_mode_items = ModeMenuItems {
        standard: CheckMenuItemBuilder::with_id(APP_MENU_MODE_STANDARD_MENU_ID, "Standard")
            .checked(true)
            .build(app)?,
        minimal: CheckMenuItemBuilder::with_id(APP_MENU_MODE_MINIMAL_MENU_ID, "Minimal").build(app)?,
        focus: CheckMenuItemBuilder::with_id(APP_MENU_MODE_FOCUS_MENU_ID, "Focus").build(app)?,
        ambient: CheckMenuItemBuilder::with_id(APP_MENU_MODE_AMBIENT_MENU_ID, "Ambient")
            .build(app)?,
    };
    let app_menu_mode_submenu = SubmenuBuilder::new(app, "Mode")
        .items(&[
            &app_menu_mode_items.standard,
            &app_menu_mode_items.minimal,
            &app_menu_mode_items.focus,
            &app_menu_mode_items.ambient,
        ])
        .build()?;
    let app_menu_toggle_always_on_top = CheckMenuItemBuilder::with_id(
        APP_MENU_TOGGLE_ALWAYS_ON_TOP_MENU_ID,
        "Always on Top",
    )
    .checked(false)
    .build(app)?;
    let app_menu_close_window = PredefinedMenuItem::close_window(app, None)?;
    let app_menu_quit = MenuItemBuilder::with_id(APP_MENU_QUIT_MENU_ID, "Quit")
        .accelerator("CmdOrCtrl+Q")
        .build(app)?;
    let app_submenu = SubmenuBuilder::new(app, "Time")
        .items(&[
            &app_menu_mode_submenu,
            &app_menu_open_settings,
            &app_menu_toggle_visibility,
            &app_menu_toggle_always_on_top,
            &app_menu_close_window,
        ])
        .separator()
        .item(&app_menu_quit)
        .build()?;
    let app_menu = MenuBuilder::new(app).item(&app_submenu).build()?;
    app.set_menu(app_menu)?;

    let tray_open_settings =
        MenuItemBuilder::with_id(TRAY_OPEN_SETTINGS_MENU_ID, "Settings...").build(app)?;
    let tray_toggle_visibility =
        MenuItemBuilder::with_id(TRAY_TOGGLE_VISIBILITY_MENU_ID, "Show / Hide").build(app)?;
    let tray_mode_items = ModeMenuItems {
        standard: CheckMenuItemBuilder::with_id(TRAY_MODE_STANDARD_MENU_ID, "Standard")
            .checked(true)
            .build(app)?,
        minimal: CheckMenuItemBuilder::with_id(TRAY_MODE_MINIMAL_MENU_ID, "Minimal").build(app)?,
        focus: CheckMenuItemBuilder::with_id(TRAY_MODE_FOCUS_MENU_ID, "Focus").build(app)?,
        ambient: CheckMenuItemBuilder::with_id(TRAY_MODE_AMBIENT_MENU_ID, "Ambient").build(app)?,
    };
    let tray_mode_submenu = SubmenuBuilder::new(app, "Mode")
        .items(&[
            &tray_mode_items.standard,
            &tray_mode_items.minimal,
            &tray_mode_items.focus,
            &tray_mode_items.ambient,
        ])
        .build()?;
    let tray_toggle_always_on_top = CheckMenuItemBuilder::with_id(
        TRAY_TOGGLE_ALWAYS_ON_TOP_MENU_ID,
        "Always on Top",
    )
    .checked(false)
    .build(app)?;
    let tray_quit = MenuItemBuilder::with_id(TRAY_QUIT_MENU_ID, "Quit").build(app)?;
    let tray_menu = MenuBuilder::new(app)
        .items(&[
            &tray_mode_submenu,
            &tray_open_settings,
            &tray_toggle_visibility,
            &tray_toggle_always_on_top,
            &tray_quit,
        ])
        .build()?;

    let tray_toggle_always_on_top_for_menu = tray_toggle_always_on_top.clone();
    let tray_toggle_always_on_top_for_sync = tray_toggle_always_on_top.clone();
    let app_menu_toggle_always_on_top_for_menu = app_menu_toggle_always_on_top.clone();
    let app_menu_toggle_always_on_top_for_sync = app_menu_toggle_always_on_top.clone();
    let tray_mode_items_for_menu = tray_mode_items.clone();
    let tray_mode_items_for_sync = tray_mode_items.clone();
    let app_menu_mode_items_for_menu = app_menu_mode_items.clone();
    let app_menu_mode_items_for_sync = app_menu_mode_items.clone();
    let app_handle = app.clone();

    app.listen_any(SETTINGS_SYNC_EVENT, move |event| {
        if let Ok(payload) = serde_json::from_str::<SettingsSyncPayload>(event.payload()) {
            sync_always_on_top(
                &app_handle,
                payload.always_on_top,
                &tray_toggle_always_on_top_for_sync,
                &app_menu_toggle_always_on_top_for_sync,
                false,
            );
            if let Some(display_mode) = DisplayMode::from_str(&payload.display_mode) {
                sync_display_mode(
                    &app_handle,
                    display_mode,
                    &tray_mode_items_for_sync,
                    &app_menu_mode_items_for_sync,
                    false,
                );
            }
        }
    });

    let tray_toggle_always_on_top_for_app_menu = tray_toggle_always_on_top.clone();
    let app_menu_toggle_always_on_top_for_app_menu = app_menu_toggle_always_on_top.clone();
    let tray_mode_items_for_app_menu = tray_mode_items.clone();
    let app_menu_mode_items_for_app_menu = app_menu_mode_items.clone();

    app.on_menu_event(move |app, event| {
        handle_menu_action(
            app,
            event.id().as_ref(),
            &tray_toggle_always_on_top_for_app_menu,
            &app_menu_toggle_always_on_top_for_app_menu,
            &tray_mode_items_for_app_menu,
            &app_menu_mode_items_for_app_menu,
        );
    });

    let icon = Image::from_bytes(TRAY_TEMPLATE_ICON_BYTES)?;

    TrayIconBuilder::with_id(TRAY_ICON_ID)
        .icon(icon)
        .icon_as_template(true)
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .tooltip("Time")
        .on_menu_event(move |app, event| {
            handle_menu_action(
                app,
                event.id().as_ref(),
                &tray_toggle_always_on_top_for_menu,
                &app_menu_toggle_always_on_top_for_menu,
                &tray_mode_items_for_menu,
                &app_menu_mode_items_for_menu,
            );
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window_visibility(&tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn updater_is_configured() -> bool {
    RAW_TAURI_CONFIG.contains("\"pubkey\"")
        && !RAW_TAURI_CONFIG.contains(UPDATER_PUBKEY_PLACEHOLDER)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))?;

            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_window_state::Builder::default().build())?;

            #[cfg(desktop)]
            if updater_is_configured() {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            }

            build_system_ui(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            open_settings,
            hide_main_window,
            quit_time,
            set_show_dock_icon
        ])
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
