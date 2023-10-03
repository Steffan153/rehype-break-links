import fs from 'fs';
import { rehype } from 'rehype';
import rehypeBreakLinks from './index.js';

const buffer = fs.readFileSync('example.html');

rehype()
  .use(rehypeBreakLinks)
  .process(buffer)
  .then((file) => {
    console.log(file.toString());
  });
