
use reqwest::{self, header::{HeaderMap, HeaderValue}};
use serde::Deserialize;

use crate::platform_utils;


#[derive(Deserialize, Debug)]
pub struct ServerInfo {
    pub server_ip: String,
    pub server_port: String,
    pub test_server_ip: String,
    pub test_server_port: String,
}


pub fn get_http_client() -> reqwest::Client {
    return reqwest::Client::new();
}

pub fn get_common_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("Platform", HeaderValue::from_str(platform_utils::get_platform()).unwrap());
    headers
}

pub fn build_url() -> String {
    get_api_url()+"uo_files/get_files/"
}   

pub async fn get_server_info() -> Result<ServerInfo, String>{
    let http_client = get_http_client();
    let url = get_api_url()+"server/info";
    
    let response = match http_client.get(url).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to send request: {}", err)),
    };

    // Sprawdzamy status odpowiedzi
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }
    let json_response = response.json::<ServerInfo>().await.unwrap();
    Ok(json_response)
}

fn get_api_url() -> String {
    "https://api.uogenesis.pl/".to_owned()
    // "http://localhost:8008/".to_owned()
}

