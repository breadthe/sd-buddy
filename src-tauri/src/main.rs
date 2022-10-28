#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, fs, fs::Metadata, path::Path, process::{Command, Stdio}, time::SystemTime};
use tauri::{AboutMetadata, Manager, Menu, MenuItem, Submenu};

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
    latest_image(dir_path)
}

// Get the latest image created in the output directory
fn latest_image(dir_path: String) -> String {
    let mut files: Vec<(String, SystemTime)> = Vec::new();
    let mut file_name: String;
    let mut metadata: Metadata;

    for entry in fs::read_dir(dir_path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();

        metadata = fs::metadata(&path).unwrap();

        // get the modified date
        let _modified = metadata.modified().unwrap();

        // get the created date
        let created = metadata.created().unwrap();

        let _file_type = metadata.file_type();

        let file_extension = path.extension().unwrap_or_default().to_str().unwrap_or_default().to_string();

        file_name = path.file_name().unwrap_or_default().to_str().unwrap().to_string();

        if file_extension == "png" {
            files.push((file_name, created));
        }
    }

    // sort the files by the modified date
    files.sort_by(|a, b| a.1.cmp(&b.1));

    // return the most recent image
    let mut latest_image: String = "".to_string(); // "" by default
    if files.len() > 0 {
        latest_image = files.last().unwrap().0.to_string();
    }

    latest_image
}

// Runs the find command to get the latest image:
// find . -depth 1 -type f -ctime -2130s | sort -r | head -n1
// "find all files in the current directory, depth of 1 (no subfolders), created in the last  2130s, sort by time created, and return the first one"
// Output: grid-0034.png
// @see https://rust-lang-nursery.github.io/rust-cookbook/os/external.html#run-piped-external-commands
// @deprecated
fn _latest_image_old(dir_path: String, elapsed: String) -> String {
    let mut output: String = "".to_string();

    let find_args: [&str; 9] = [
        &dir_path,
        "-name",
        "*.png",
        "-depth",
        "1",
        "-type",
        "f",
        "-ctime",
        &format!("-{}s", elapsed),
    ];
    let mut find_output_child = std::process::Command::new("find")
        .args(&find_args)
        .current_dir(&dir_path)
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to execute `find` command");

    if let Some(find_output) = find_output_child.stdout.take() {
        let mut sort_output_child = Command::new("sort")
            .arg("-r")
            .stdin(find_output)
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to execute `sort` command");

        find_output_child.wait().expect("Failed to wait on `find`");

        if let Some(sort_output) = sort_output_child.stdout.take() {
            let head_output_child = Command::new("head")
                .args(&["-n", "1"])
                .stdin(sort_output)
                .stdout(Stdio::piped())
                .spawn()
                .expect("Failed to execute `head` command");

            let head_stdout = head_output_child
                .wait_with_output()
                .expect("Failed to wait on `head`");

            sort_output_child.wait().expect("Failed to wait on `sort`");

            // convert the output to a string
            // /absolute/path/to/Stable/Diffusion/directory/output/grid-0034.png
            output = String::from_utf8(head_stdout.stdout)
                .expect("failed to convert find output to string");

            // remove the path from the beginning of the string
            let from: String = format!("{}/", &dir_path); // /absolute/path/to/Stable/Diffusion/directory/output/
            output = output.replace(&from, ""); // grid-0034.png\n

            // remove the newline from the end of the string
            output = output.replace("\n", ""); // grid-0034.png
        }
    }

    output
}
