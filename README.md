Marker
======

**Marker** is a tool dependent on jQuery that can help you mark some words or sentences in website.

But now it is too weak, I will try to make it more interesting.

you can see a simple demo at [http://www.linkgod.net/marker/](http://www.linkgod.net/marker/)

## Installation

First you must load jquery

```html
<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
```

Then load **Marker** via tag:

```html
<link rel="stylesheet" href="src/markPer.css">
<script src="src/marker.js">
```

You can also load **Marker** by [RequireJS](http://requirejs.org/) or [Sea.js](http://seajs.org/docs/).

## Usage

Init marker

```js
var marker = new Marker({
        dom: 'article',
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
    });
```

After mark some words or sentences

```js
console.log(marker.getKeywordList())
```

## License

Licensed under MIT
