import { readDir } from "@tauri-apps/api/fs";

async function isDirectory(path: string): Promise<boolean> {
    try {
      // Próbuje odczytać zawartość katalogu pod podaną ścieżką
      const entries = await readDir(path);
      // Jeśli nie ma błędów i są zwrócone wpisy, to ścieżka jest folderem
      console.log(entries);
      return Array.isArray(entries);
    } catch (error) {
      // Jeśli wystąpił błąd, ścieżka prawdopodobnie nie jest folderem
      console.error('Error checking if path is a directory:', error);
      return false;
    }
  }

  export default isDirectory;