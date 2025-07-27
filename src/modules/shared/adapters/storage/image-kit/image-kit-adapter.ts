import ImageKit from "imagekit";
import { _env } from "@/src/main/config/_env";
import { AppError, ErrorCode } from "../../../errors/app-error";
import type { StorageAdapter } from "../../../ports/storage-adapter";
import { type Url, url } from "../../../value-objects/url";

const imageKit = new ImageKit({
	publicKey: _env.IMAGE_KIT_PUBLIC_KEY,
	privateKey: _env.IMAGE_KIT_PRIVATE_KEY,
	urlEndpoint: _env.IMAGE_KIT_URL_ENDPOINT,
});

export class ImageKitAdapter implements StorageAdapter {
	constructor(private readonly imagekit: ImageKit = imageKit) {}

	async upload(file: File): Promise<Url> {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const result = await this.imagekit.upload({
				file: buffer,
				fileName: file.name,
				folder: "/uploads", 
				useUniqueFileName: true,
				tags: ["uploaded"], 
				responseFields: ["url", "fileId", "name"],
			});

			return url(result.url);
		} catch (error) {
			console.error("ImageKit upload error:", error);

			if (error instanceof Error) {
				throw new AppError(
					`Failed to upload file: ${error.message}`,
					500,
					ErrorCode.EXTERNAL_SERVICE_ERROR,
				);
			}

			throw new AppError(
				"Failed to upload file to ImageKit",
				500,
				ErrorCode.EXTERNAL_SERVICE_ERROR,
			);
		}
	}
}
