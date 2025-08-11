export interface MongoDBErrorInfo {
	type: "validation" | "cast" | "duplicate" | "connection" | "unknown";
	message: string;
	suggestions: string[];
	field?: string;
	value?: any;
}

export const analyzeMongoDBError = (error: any): MongoDBErrorInfo => {
	const message = error?.message || String(error);

	// Cast to ObjectId errors
	if (message.includes("Cast to ObjectId failed")) {
		const match = message.match(
			/Cast to ObjectId failed for value "([^"]+)" \(type ([^)]+)\) at path "([^"]+)"/,
		);
		if (match) {
			const [, value, type, path] = match;
			return {
				type: "cast",
				message: `Invalid ObjectId format at field '${path}'`,
				suggestions: [
					`Field '${path}' expects an ObjectId but received '${value}' (${type})`,
					"Convert string ID to ObjectId using mongoose.Types.ObjectId(id)",
					"Or change schema to use String type instead of ObjectId",
					"Check if you're passing the correct ID format",
				],
				field: path,
				value,
			};
		}
	}

	// Validation errors
	if (message.includes("validation failed")) {
		const match = message.match(/([^:]+): (.+)/);
		if (match) {
			const [, field, details] = match;
			return {
				type: "validation",
				message: `Validation failed for field '${field}'`,
				suggestions: [
					`Check the requirements for field '${field}'`,
					"Verify data types match schema definition",
					"Ensure required fields are provided",
					"Check for minimum/maximum value constraints",
				],
				field,
				value: details,
			};
		}
	}

	// Duplicate key errors
	if (message.includes("duplicate key error")) {
		const match = message.match(/index: ([^ ]+)/);
		if (match) {
			const [, index] = match;
			return {
				type: "duplicate",
				message: `Duplicate value for unique field`,
				suggestions: [
					`A record with this value already exists in index '${index}'`,
					"Check if you're trying to create a duplicate record",
					"Consider using upsert or findOneAndUpdate instead of create",
					"Verify the unique constraint requirements",
				],
				field: index,
			};
		}
	}

	// Connection errors
	if (message.includes("ECONNREFUSED") || message.includes("ENOTFOUND")) {
		return {
			type: "connection",
			message: "Database connection failed",
			suggestions: [
				"Check if MongoDB server is running",
				"Verify connection string and credentials",
				"Check network connectivity",
				"Ensure database host and port are correct",
			],
		};
	}

	// Unknown error
	return {
		type: "unknown",
		message: "Unknown MongoDB error",
		suggestions: [
			"Check MongoDB server logs for more details",
			"Verify your schema definitions",
			"Check data types and constraints",
			"Review the operation being performed",
		],
	};
};

export const logMongoDBError = (error: any, context?: string) => {
	const errorInfo = analyzeMongoDBError(error);

	console.log(`🚨 MongoDB Error${context ? ` in ${context}` : ""}:`);
	console.log(`  📝 Type: ${errorInfo.type}`);
	console.log(`  📄 Message: ${errorInfo.message}`);
	if (errorInfo.field) {
		console.log(`  🏷️ Field: ${errorInfo.field}`);
	}
	if (errorInfo.value) {
		console.log(`  💾 Value: ${errorInfo.value}`);
	}
	console.log(`  💡 Suggestions:`);
	errorInfo.suggestions.forEach((suggestion, index) => {
		console.log(`    ${index + 1}. ${suggestion}`);
	});

	return errorInfo;
};
