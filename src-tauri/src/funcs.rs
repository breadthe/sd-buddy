use std::{fs, fs::Metadata, process::{Command, Stdio}, time::SystemTime};

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
