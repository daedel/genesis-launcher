
use reqwest::{self, header::{HeaderMap, HeaderValue}};
use serde::Deserialize;
use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};

use crate::platform_utils;


#[derive(Deserialize, Debug)]
pub struct ServerInfo {
    pub server_ip: String,
    pub server_port: String,
    pub test_server_ip: String,
    pub test_server_port: String,
    pub allow_login: bool,
}


pub fn get_http_client() -> reqwest::Client {
    return reqwest::Client::new();
}

pub fn get_common_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("Platform", HeaderValue::from_str(platform_utils::get_platform()).unwrap());
    headers
}

pub fn build_url(file_name: String) -> String {
    let encoded_file_name = utf8_percent_encode(&file_name, NON_ALPHANUMERIC).to_string();
    get_api_url()+"uo_files/get_file/?file_name="+&encoded_file_name
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


    // if !response.status().is_success() {
    //     return Err(format!("HTTP error: {}", response.status()));
    // }

    // let content = match response.bytes().await {
    //     Ok(bytes) => bytes,
    //     Err(err) => return Err(format!("Failed to read response body: {}", err)),
    // };

    // let mut content2 = std::io::Cursor::new(content);
    // let file_path = format!("./{}", file_name);
    // file::write_binary(&file_path, &mut content2).unwrap();

    // Ok(())

    // Ok(())
