import { ImageKitAdapter } from "./image-kit-adapter";

// biome-ignore lint/complexity/noStaticOnlyClass: <just a simple factory>
export class ImageKitFactory {
	static create(): ImageKitAdapter {
		return new ImageKitAdapter();
	}
}
