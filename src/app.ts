import * as http from 'http';
import * as cp from 'child_process';
import * as micro from 'micro';

async function main(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Content-Type', 'image/png');

  const args = [
    'dist/1.png',
    'dist/2.png',
    'dist/3.png',
    'dist/4.png',
    '-font',
    'Arial',
    '-tile',
    '2x2',
    '-border',
    '1',
    '-bordercolor',
    'black',
    '-',
  ];

  const child = cp.spawn('montage', args);

  child.once('exit', code => {
    if (code !== 0) {
      micro.send(res, 500, 'Error creating bingo card');
    }
  });

  child.once('error', () => {
    micro.send(res, 500, 'Error creating bingo card');
  });

  child.stderr.on('data', err => console.log(err.toString()));

  micro.send(res, 200, child.stdout);
}

const server = micro.default(main);
server.listen(3000);

process.on('SIGINT', () => server.close());
