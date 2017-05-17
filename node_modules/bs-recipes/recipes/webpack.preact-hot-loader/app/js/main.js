import {h, render} from 'preact';

if (module.hot) {
    module.hot.accept('./HelloWorld.jsx', () => requestAnimationFrame(() => {
        init();
    }));
}

let root;

function init() {
    const HellowWorld = require('./HelloWorld.jsx').default;
    root = render(<HellowWorld />, document.getElementById('preact-root'), root);
}

init();
