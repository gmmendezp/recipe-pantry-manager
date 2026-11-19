import { resetDemoDataIfDue } from '#/features/demo/demo-reset.server';

export default async function resetDemoData() {
  const result = await resetDemoDataIfDue();

  console.info(`Demo data reset check completed: ${result.status}`);
}
