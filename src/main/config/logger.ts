import pino from "pino";

export const Logger = pino({
	level: "info",
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});
