import { writeFile } from "node:fs/promises";
import type { StorageAdapter } from "../../ports/storage-adapter";
import { id, type Url } from "../../value-objects";
import { join } from "node:path";

const UPLOAD_DIR = "./uploads";

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly serverUrl: string) {}

  async upload(file: File): Promise<Url> {
    const ext = file.name.split(".").pop();
    const filename = `${id()}.${ext}`;
    const buffer = await file.arrayBuffer();
    const path = join(UPLOAD_DIR, filename);

    await writeFile(path, Buffer.from(buffer));

    return `${this.serverUrl}/${path}`;
  }
}