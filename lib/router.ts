'use client';

export type RouteTask = {
  task?: string;
  model?: string;
};

/** Select a model without overriding an explicit model supplied by the caller. */
export function pickModel(task: string, explicitModel?: string): string {
  if (explicitModel) return explicitModel;

  const t = task.trim().toLowerCase();
  if (t.length > 500 || /เขียนโค้ด|วิเคราะห์|debug|ดีบัก|reason|reasoning|แปล|translate/.test(t)) {
    return 'gpt-5';
  }

  return 'gpt-5-nano';
}
