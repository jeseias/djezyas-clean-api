import { ImageKitAdapter } from "./image-kit-adapter";

export class ImageKitFactory {
	static create(): ImageKitAdapter {
		return new ImageKitAdapter();
	}
}
