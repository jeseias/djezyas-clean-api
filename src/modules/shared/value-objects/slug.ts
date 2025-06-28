export class Slug {
	private constructor(private readonly _value: string) {}

	static create(input: string): Slug {
		const normalized = input
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(normalized)) {
			throw new Error("Invalid slug format");
		}

		return new Slug(normalized);
	}

	get value(): string {
		return this._value;
	}

	toString(): string {
		return this.value;
	}
}
