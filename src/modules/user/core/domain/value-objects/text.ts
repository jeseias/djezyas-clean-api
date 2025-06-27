export type Text = string & { readonly __brand: unique symbol };

export const createText = (value: string): Text => {
	if (value.length > 256) {
		throw new Error("Text must not exceed 256 characters");
	}
	return value as Text;
};
