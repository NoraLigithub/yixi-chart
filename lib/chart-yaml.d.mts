import type { ChartDocument } from "../app/content";

export function chartToHumanObject(document: ChartDocument): Record<string, unknown>;
export function chartToHumanYaml(document: ChartDocument): string;
