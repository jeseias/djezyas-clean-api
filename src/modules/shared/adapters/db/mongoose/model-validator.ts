import mongoose from "mongoose";

/**
 * Utility to validate mongoose models and detect potential issues
 */
export class ModelValidator {
	/**
	 * Check if a model with the given name already exists
	 */
	static isModelRegistered(modelName: string): boolean {
		return mongoose.models[modelName] !== undefined;
	}

	/**
	 * Get all registered model names
	 */
	static getRegisteredModelNames(): string[] {
		return Object.keys(mongoose.models);
	}

	/**
	 * Validate that all expected models are registered
	 */
	static validateModelRegistration(expectedModels: string[]): {
		isValid: boolean;
		missing: string[];
		extra: string[];
	} {
		const registeredModels = ModelValidator.getRegisteredModelNames();
		const missing = expectedModels.filter(
			(model) => !registeredModels.includes(model),
		);
		const extra = registeredModels.filter(
			(model) => !expectedModels.includes(model),
		);

		return {
			isValid: missing.length === 0,
			missing,
			extra,
		};
	}

	/**
	 * Log model registration status for debugging
	 */
	static logModelStatus(): void {
		const models = ModelValidator.getRegisteredModelNames();
		console.log("📊 Registered Models:", models.length);
		models.forEach((model) => {
			console.log(`  - ${model}`);
		});
	}

	/**
	 * Check for potential duplicate schema issues
	 */
	static checkForDuplicateIssues(): {
		hasIssues: boolean;
		issues: string[];
	} {
		const issues: string[] = [];
		const models = ModelValidator.getRegisteredModelNames();

		// Check for duplicate model names (case-insensitive)
		const modelNamesLower = models.map((name) => name.toLowerCase());
		const duplicates = modelNamesLower.filter(
			(name, index) => modelNamesLower.indexOf(name) !== index,
		);

		if (duplicates.length > 0) {
			issues.push(`Duplicate model names detected: ${duplicates.join(", ")}`);
		}

		// Check if models are properly registered
		models.forEach((modelName) => {
			const model = mongoose.models[modelName];
			if (!model) {
				issues.push(`Model ${modelName} is not properly registered`);
			}
		});

		return {
			hasIssues: issues.length > 0,
			issues,
		};
	}
}
