import type { Url } from "../value-objects";

export interface StorageAdapter {
	upload(file: File): Promise<Url>;
}
