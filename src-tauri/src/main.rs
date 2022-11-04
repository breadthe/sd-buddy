#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, path::Path};
use tauri::{AboutMetadata, Manager, Menu, MenuItem, Submenu};
mod funcs;

fn main() {
    const APP_NAME: &str = env!("CARGO_PKG_NAME");
    const VERSION: &str = env!("CARGO_PKG_VERSION");
    const AUTHORS: &str = env!("CARGO_PKG_AUTHORS");
    const LICENSE: &str = env!("CARGO_PKG_LICENSE");
    const REPOSITORY: &str = env!("CARGO_PKG_REPOSITORY");

    let about_metadata = AboutMetadata::new()
        .version(VERSION)
        .authors(vec![AUTHORS.to_string()])
        .website(REPOSITORY)
        .license(LICENSE);

    let about_menu = Submenu::new(
        "App",
        Menu::new()
        .add_native_item(MenuItem::About(
            APP_NAME.to_string(),
            about_metadata,
        ))
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let view_menu = Submenu::new(
        "View",
        Menu::new().add_native_item(MenuItem::EnterFullScreen),
    );

    let window_menu = Submenu::new(
        "Window",
        Menu::new()
          .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom),
    );

    let menu = Menu::new()
        .add_submenu(about_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(window_menu);

    tauri::Builder::default()
        // This is where you pass in your commands
        .invoke_handler(tauri::generate_handler![
            stable_diffusion_command,
            get_latest_image,
            close_splashscreen
        ])
        .menu(menu)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn stable_diffusion_command(directory: String, command: String) -> String {
    let stable_diffusion_directory = directory; // "/Users/zagreus/code/ml/stable-diffusion"
    let shell_command: String;
    let operating_system: String = env::consts::OS.to_string();

    println!("Operating System: {}", operating_system);
    println!("Stable Diffusion directory: {}", stable_diffusion_directory);
    println!("Command: {}", command);

    // identify virtual environments and prepend the appropriate loading command
    if Path::new(&stable_diffusion_directory).join("venv/bin/activate").exists() {
        shell_command = format!("source venv/bin/activate && {}", command);
    } else if Path::new(&stable_diffusion_directory).join(".direnv").exists() {
        shell_command = format!("direnv exec {} {}", stable_diffusion_directory, command);
    } else {
        if operating_system == "windows" {
            shell_command = format!("cmd /C {}", command);
        } else {
            shell_command = format!("sh -c {}", command);
        }
    }

    // execute the Stable Diffusion command
    let output = std::process::Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .current_dir(stable_diffusion_directory)
        .output()
        .expect("failed to execute Stable Diffusion command");

    // convert the output to a string
    let output = String::from_utf8(output.stdout)
        .expect("failed to convert Stable Diffusion output to string");

    output
}

// This command must be async so that it doesn't run on the main thread.
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

#[tauri::command]
async fn get_latest_image(dir_path: String) -> String {
    // latest_image_old(dir_path, elapsed)
    funcs::latest_image(dir_path)
}
