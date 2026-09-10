import 'dotenv/config';

import {
  PRODUCTION_REQUIRED_ENV,
  validateProductionEnvironment,
} from '../config/productionEnv.js';

const { errors, warnings } = validateProductionEnvironment(process.env);

if (warnings.length) {
  console.warn('\n[Bastly production configuration warnings]');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length) {
  console.error('\n[Bastly production configuration check failed]');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error(
    '\nNo secret values were printed. Fix the environment variables and run the check again.\n',
  );
  process.exit(1);
}

console.log(
  `[Bastly] Production environment contract passed (${PRODUCTION_REQUIRED_ENV.length} required server values checked).`,
);
