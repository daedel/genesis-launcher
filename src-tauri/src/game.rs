
use std::env;
use std::process::{Command, Stdio};
use std::io::{self, BufRead};
use std::io::BufReader;

pub async fn add_os_secret_variable() -> Result<(), String> {
    env::set_var("TESTOWA", "1");
    println!("ustawiłem TESTOWA");

    Ok(())
}

pub async fn remove_os_secret_variable() -> Result<(), String> {
    env::remove_var("TESTOWA");
    Ok(())
}

pub async fn run_client(game_dir: std::path::PathBuf) -> Result<(), String> {
    println!("game_dir: {}", game_dir.to_string_lossy());
    println!("startuje klienta");
    let mut client_path = game_dir.clone();
    client_path.push("ClassicUO.bin.osx");
    println!("client_path: {}", client_path.to_string_lossy());

    let args = ["-uopath", "../"];

    let mut child = Command::new(client_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute command");

    // Tworzymy BufReader do czytania wyjścia standardowego (stdout)
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            println!("output: {}", line.expect("error reading line"));
        }
    }

    // Tworzymy BufReader do czytania błędów standardowych (stderr)
    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            eprintln!("error: {}", line.expect("error reading line"));
        }
    }

    // Czekamy na zakończenie procesu dziecka
    let status = child.wait().expect("blad procesu");
    println!("Process exited with status: {}", status);



    println!("koniec procesu klienta");

    Ok(())
}