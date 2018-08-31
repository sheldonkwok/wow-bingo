import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as http from 'http';
import * as cp from 'child_process';
import * as micro from 'micro';
import * as lodash from 'lodash';

const { captions } = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

const TOTAL_SQUARES = 25;
const FREE_SQUARE = 12;
const CAPTION_IMGS = Array.from({ length: captions.length - 1 }, (_, i) => ++i).map(i => `dist/${i}.png`);
const BASE_MONTAGE_ARGS = ['-font', 'Arial', '-tile', '5x5', '-border', '1', '-bordercolor', 'black', '-'];

function createBoardProcess(): cp.ChildProcess {
  const imgs = lodash.shuffle(CAPTION_IMGS).slice(0, TOTAL_SQUARES);
  imgs[FREE_SQUARE] = 'dist/0.png';

  const args = imgs.concat(BASE_MONTAGE_ARGS);
  return cp.spawn('montage', args);
}

async function main(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Content-Type', 'image/png');

  const child = createBoardProcess();

  child.once('error', () => micro.send(res, 500, 'Error creating bingo card'));
  child.once('exit', code => {
    if (code !== 0) micro.send(res, 500, 'Error creating bingo card');
  });

  child.stderr.on('data', err => console.log(err.toString()));
  micro.send(res, 200, child.stdout);
}

const server = micro.default(main);
server.listen(3000);

process.on('SIGINT', () => server.close());
