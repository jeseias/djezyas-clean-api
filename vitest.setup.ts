import { vi } from "vitest";

const fixedDate = new Date("2023-12-18T00:00:00Z");

vi.useFakeTimers({
	now: fixedDate,
});
