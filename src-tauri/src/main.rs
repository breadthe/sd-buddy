#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};

fn main() {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let menu = Menu::new() // configure the menu
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
        .add_native_item(MenuItem::Cut)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        // This is where you pass in your commands
        .invoke_handler(tauri::generate_handler![
            stable_diffusion_command,
            close_splashscreen
        ])
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "quit" => {
                std::process::exit(0);
            }
            "close" => {
                event.window().close().unwrap();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn stable_diffusion_command(command: String) -> String {
    // let stable_diffusion_directory = Path::new("/Users/zagreus/code/ml/stable-diffusion");
    let stable_diffusion_directory = "/Users/zagreus/code/ml/stable-diffusion";
    let virtual_env_cmd = "venv/bin/activate";

    println!("Stable Diffusion directory: {}", stable_diffusion_directory);
    println!("Command: {}", command);

    // execute the Stable Diffusion command
    let output = std::process::Command::new("bash")
        .arg("-c")
        .arg(format!("source {} && {}", virtual_env_cmd, command))
        .current_dir(stable_diffusion_directory)
        .output()
        .expect("failed to execute Stable Diffusion command");

    // convert the output to a string
    let output = String::from_utf8(output.stdout).expect("failed to convert Stable Diffusion output to string");

    // let output = "Hi back from Rust".to_string();
    // let output = dev_string.to_string();
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
