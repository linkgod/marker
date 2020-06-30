Marker
======

**Marker** is a tool that can help you mark some words or sentences in website.

But now it is too weak, I will try to make it more interesting.

you can see a simple demo at [https://linkgod.github.io/marker/demo](https://linkgod.github.io/marker/demo)

## Installation

First load **Marker** via tag:

```html
<link rel="stylesheet" href="src/markPer.css">
<script src="src/marker.js">
```

You can also load **Marker** by [RequireJS](http://requirejs.org/) or [Sea.js](http://seajs.org/docs/).

## Usage

init with id attribute

```js
var editor = new Marker('#marker');
```

init with an element

```js
var editor = new Marker(document.getElementById('marker'));
```

init with options

```js
var options = {
    dom: document.getElementById('marker'), // {DOM Element} [required]
    type: [
        {
            name: '精粹',
            color: '#00f127'
        },
        {
            name: '糟粕',
            color: '#a0a0a0'
        }
    ]
}

var marker = new Marker(options);
```

After mark some words or sentences

```js
console.log(marker.getKeywordList());
console.log(marker.getTemplet());
```

## License

Licensed under MIT
