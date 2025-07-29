export class Slug {
	private constructor(private readonly _value: string) {
		if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(_value)) {
			throw new Error("Invalid slug format");
		}
	}

	static create(input: string): Slug {
		const normalized = input
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(normalized)) {
			throw new Error("Invalid slug format");
		}

		const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		let randomString = "";
		for (let i = 0; i < 6; i++) {
			randomString += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		const uniqueSlug = `${normalized}-${randomString}`;

		return new Slug(uniqueSlug);
	}

	static fromValue(value: string): Slug {
		return new Slug(value);
	}

	get value(): string {
		return this._value;
	}

	toString(): string {
		return this.value;
	}
}
