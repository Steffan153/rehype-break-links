import { visit } from 'unist-util-visit';
import { isElement } from 'hast-util-is-element';

export default function rehypeBreakLinks() {
  return function (tree) {
    visit(tree, 'element', (node) => {
      if (
        isElement(node, 'a') &&
        node.properties?.href &&
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        node.children[0].value === node.properties.href
      ) {
        let prevNode = { type: 'text', value: '' };
        const wbr = { type: 'element', tagName: 'wbr', properties: {}, children: [] };
        let nodes = [];
        for (const char of node.properties.href.match(/\/\/|./g) || []) {
          if (char === ':') {
            prevNode.value += char;
            nodes.push(prevNode, { ...wbr });
            prevNode = { type: 'text', value: '' };
          } else if (/^[/~.,\-_?#%]$/.test(char)) {
            nodes.push(prevNode, { ...wbr });
            prevNode = { type: 'text', value: char };
          } else if (/[=&]/.test(char) || char === '//') {
            nodes.push(prevNode, { ...wbr }, { type: 'text', value: char }, { ...wbr });
            prevNode = { type: 'text', value: '' };
          } else {
            prevNode.value += char;
          }
        }
        if (prevNode.value) nodes.push(prevNode);
        if (nodes[0]?.type === 'element') nodes.shift();
        if (nodes[nodes.length - 1]?.type === 'element') nodes.pop();
        nodes = nodes.filter((x) => x.type === 'element' || (x.type === 'text' && x.value));
        nodes = nodes.filter((x, i) => x.type !== 'element' || i === 0 || nodes[i - 1].type !== 'element');
        node.children = nodes;
      }
    });
  };
}
