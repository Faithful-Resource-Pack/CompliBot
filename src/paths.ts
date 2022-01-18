import 'module-alias/register';
import { addAliases } from 'module-alias';

addAliases({
  '@src': `${__dirname}`,
});