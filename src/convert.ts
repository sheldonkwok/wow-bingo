import * as cp from 'mz/child_process';
import * as fs from 'mz/fs';
import * as yaml from 'js-yaml';
import * as bluebird from 'bluebird';

export interface Config {
  captions: string[];
}

const BASE_CONVERT_ARGS = [
  '-font',
  'Arial',
  '-fill',
  'black',
  '-pointsize',
  '28',
  '-size',
  '180x180',
  '-extent',
  '200x200',
  '-gravity',
  'center',
];

async function createImg(filename: string, caption: string): Promise<void> {
  const args = BASE_CONVERT_ARGS.concat([`caption:${caption}`, filename]);
  await cp.execFile('convert', args);
}

async function main(): Promise<void> {
  const { captions } = yaml.safeLoad(await fs.readFile('config.yaml', 'utf8')) as Config;

  await cp.execFile('mkdir', ['-p', 'dist']);
  await bluebird.map(captions, (caption, i) => createImg(`dist/${i}.png`, caption), { concurrency: 50 });
}

main().catch(err => {
  console.warn(err.stack);
  process.exit(1);
});
