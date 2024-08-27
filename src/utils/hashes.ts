import { readBinaryFile } from '@tauri-apps/api/fs';
import { SHA256, enc } from 'crypto-ts';
import { Buffer } from 'buffer'; // Import Buffer z pakietu buffer


async function calculateFileHash(filePath: string) {
    try {
      // Odczytaj plik jako buffer
      const fileBuffer = await readBinaryFile(filePath);
      console.log('fileBuffer ', fileBuffer)
      // Użyj Buffer do konwersji ArrayBuffer na base64
      const base64String = Buffer.from(fileBuffer).toString('base64');
  
      // Oblicz hash SHA-256
      const hash = SHA256(base64String);
      console.log('base64String ', base64String)
      console.log('hash ', hash)

      // Zwróć hash jako string w formacie hex
      return hash.toString(enc.Hex);
    } catch (error) {
      console.error('Error calculating hash:', error);
      return null;
    }
  }


export default calculateFileHash;
