import axios from 'axios';
import { type } from '@tauri-apps/api/os';

const getPlatform = async () => {
  const platform = await type();
  if (platform === 'Darwin') {
    return 'osx';
  } else if (platform === 'Linux') {
    return 'linux';
  } else if (platform === 'Windows_NT') {
    return 'win';
  } else {
    return platform;
  }
}
const getHttpClient = async () => {

  const HTTP = axios.create({
    baseURL: 'https://api.uogenesis.pl/',
    headers: {
      'Platform': await getPlatform()
    },
  })
  
  return HTTP;
}

export { getPlatform, getHttpClient }