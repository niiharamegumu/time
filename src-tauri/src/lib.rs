use std::sync::atomic::{AtomicBool, Ordering};

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
const APP_MENU_TOGGLE_ALWAYS_ON_TOP_MENU_ID: &str = "app-toggle-always-on-top";
const APP_MENU_TOGGLE_VISIBILITY_MENU_ID: &str = "app-toggle-visibility";
const APP_MENU_QUIT_MENU_ID: &str = "app-quit";
const TRAY_OPEN_SETTINGS_MENU_ID: &str = "tray-open-settings";
const TRAY_TOGGLE_ALWAYS_ON_TOP_MENU_ID: &str = "tray-toggle-always-on-top";
const TRAY_TOGGLE_VISIBILITY_MENU_ID: &str = "tray-toggle-visibility";
const TRAY_QUIT_MENU_ID: &str = "tray-quit";
const SETTINGS_SYNC_EVENT: &str = "settings:sync";
const ALWAYS_ON_TOP_CHANGED_EVENT: &str = "settings:always-on-top-changed";
const TRAY_TEMPLATE_ICON_BYTES: &[u8] = include_bytes!("../icons/tray-template/64x64.png");
const UPDATER_PUBKEY_PLACEHOLDER: &str = "__TAURI_UPDATER_PUBKEY__";
const RAW_TAURI_CONFIG: &str = include_str!("../tauri.conf.json");

#[derive(Default)]
struct AppState {
    always_on_top: AtomicBool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SettingsSyncPayload {
    always_on_top: bool,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AlwaysOnTopChangedPayload {
    always_on_top: bool,
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
) {
    let state = app.state::<AppState>();
    state.always_on_top.store(always_on_top, Ordering::Relaxed);

    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.set_always_on_top(always_on_top);
    }

    let _ = tray_toggle_item.set_checked(always_on_top);
    let _ = app_menu_toggle_item.set_checked(always_on_top);
    let _ = app.emit(
        ALWAYS_ON_TOP_CHANGED_EVENT,
        AlwaysOnTopChangedPayload { always_on_top },
    );
}

fn handle_menu_action<R: Runtime>(
    app: &AppHandle<R>,
    menu_id: &str,
    tray_toggle_item: &CheckMenuItem<R>,
    app_menu_toggle_item: &CheckMenuItem<R>,
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

            sync_always_on_top(app, next_value, tray_toggle_item, app_menu_toggle_item);
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
    let tray_toggle_always_on_top = CheckMenuItemBuilder::with_id(
        TRAY_TOGGLE_ALWAYS_ON_TOP_MENU_ID,
        "Always on Top",
    )
    .checked(false)
    .build(app)?;
    let tray_quit = MenuItemBuilder::with_id(TRAY_QUIT_MENU_ID, "Quit").build(app)?;
    let tray_menu = MenuBuilder::new(app)
        .items(&[
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
    let app_handle = app.clone();

    app.listen_any(SETTINGS_SYNC_EVENT, move |event| {
        if let Ok(payload) = serde_json::from_str::<SettingsSyncPayload>(event.payload()) {
            sync_always_on_top(
                &app_handle,
                payload.always_on_top,
                &tray_toggle_always_on_top_for_sync,
                &app_menu_toggle_always_on_top_for_sync,
            );
        }
    });

    let tray_toggle_always_on_top_for_app_menu = tray_toggle_always_on_top.clone();
    let app_menu_toggle_always_on_top_for_app_menu = app_menu_toggle_always_on_top.clone();

    app.on_menu_event(move |app, event| {
        handle_menu_action(
            app,
            event.id().as_ref(),
            &tray_toggle_always_on_top_for_app_menu,
            &app_menu_toggle_always_on_top_for_app_menu,
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
            );
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(&tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn updater_is_configured() -> bool {
    !RAW_TAURI_CONFIG.contains(UPDATER_PUBKEY_PLACEHOLDER)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .setup(|app| {
            #[cfg(desktop)]
            if updater_is_configured() {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            }

            build_system_ui(&app.handle())?;
            Ok(())
        })
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
