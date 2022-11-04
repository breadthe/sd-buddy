use std::{fs, fs::Metadata, process::{Command, Stdio}, time::SystemTime};

use anyhow::anyhow;
use anyhow::Result;

// Returns a concatenated string representing the python binary and version "python3--Python 3.10.8", or "NOT_FOUND"
pub fn get_python_binary_and_version() -> String {
    let python_binary_and_version: String = "NOT_FOUND".to_string();

    // first check if "python" exists by running "python --version"
    let check_python = || -> Result<String> {
        let python_version_output = Command::new("python")
            .arg("--version")
            .output();

        let python_binary_and_version_output = match python_version_output {
            Ok(output) => {
                let python_version = String::from_utf8(output.stdout)
                    .expect("failed to convert python version output to string");
                let python_version = python_version.replace("\n", "");
                Ok("python--".to_string() + &python_version)
            },
            Err(e) => Err(e)
        };

        if python_binary_and_version_output.is_ok() {
            return Ok(python_binary_and_version_output.unwrap());
        } else {
            return Err(anyhow!("PYTHON_NOT_FOUND"));
        }
    };

    // then check if "python3" exists by running "python3 --version"
    let check_python3 = || -> Result<String> {
        let python_version_output = Command::new("python3")
            .arg("--version")
            .output();

        let python_binary_and_version_output = match python_version_output {
            Ok(output) => {
                let python_version = String::from_utf8(output.stdout)
                    .expect("failed to convert python3 version output to string");
                let python_version = python_version.replace("\n", "");
                Ok("python3--".to_string() + &python_version)
            },
            Err(e) => Err(e)
        };

        if python_binary_and_version_output.is_ok() {
            return Ok(python_binary_and_version_output.unwrap());
        } else {
            return Err(anyhow!("PYTHON3_NOT_FOUND"));
        }
    };

    if let Ok(python_version) = check_python() {
        return python_version;
    } else if let Ok(python_version) = check_python3() {
        return python_version;
    }

    python_binary_and_version
}

pub fn get_python_path(python_binary: String) -> String {
    let mut python_path: String;
    let mut command: String = "".to_string();

    // check if MacOS
    if cfg!(target_os = "macos") ||  cfg!(target_os = "linux") {
        // get the python path on Mac
        command = "which".to_string();
    } else if cfg!(target_os = "windows") {
        // get the python path on Windows
        command = "where".to_string();
    }

    let python_path_output = Command::new(&command)
        .arg(&python_binary)
        .output()
        .expect(&format!("Failed to execute `{} {}` command", &command, &python_binary));

    // convert the output to a string
    python_path = String::from_utf8(python_path_output.stdout)
        .expect(&format!("failed to convert `{} {}` output to string", &command, &python_binary));

    // remove the newline from the end of the string
    python_path = python_path.replace("\n", "");

    python_path
}

// Get the latest image created in the output directory
pub fn latest_image(dir_path: String) -> String {
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

        let file_extension = path
            .extension()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default()
            .to_string();

        file_name = path
            .file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap()
            .to_string();

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
pub fn _latest_image_old(dir_path: String, elapsed: String) -> String {
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
