require('dotenv').config();

const { handlePlannerMessage } = require('../ai-trip-planner-management/services/plannerService');

const prompt =
  process.argv.slice(2).join(' ').trim() ||
  'Plan a 3 day relaxing beach trip in Sri Lanka for 2 people with a medium budget';

async function main() {
  const result = await handlePlannerMessage({
    message: prompt,
    plannerState: {},
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('AI planner test failed:');
  console.error(error.stack || error.message || error);
  process.exit(1);
});
