import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = "uploads";

// Sub-folders under uploads/. Keeps sensitive NIC images separate from portfolio.
export type StorageFolder = "nic" | "work";

export interface FileStorage {
  // Saves the bytes and returns the stored path/key to persist in the DB.
  save(folder: StorageFolder, buffer: Buffer, extension: string): Promise<string>;
}

// Local-disk implementation. Swap this for an S3/MinIO one later; callers and
// the DB only ever deal with the returned path, so nothing else has to change.
export class LocalFileStorage implements FileStorage {
  async save(folder: StorageFolder, buffer: Buffer, extension: string): Promise<string> {
    const dir = path.join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });

    const fileName = `${randomUUID()}${extension}`;
    await writeFile(path.join(dir, fileName), buffer);

    // Store a forward-slash relative path so it is portable across OSes.
    return path.posix.join(UPLOAD_ROOT, folder, fileName);
  }
}

export const fileStorage: FileStorage = new LocalFileStorage();
