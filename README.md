# Barebones
Barebones is simple, responsive boilerplate based off the popular [Skeleton](http://getskeleton.com) project by [Dave Gamache](https://twitter.com/dhg).

While there are several other active forks of Skeleton, Barebones differs by requiring no external tools or dependencies such as CSS pre-processors. Simply download and go.

## Getting started


Barebones can be downloaded via [zip file](https://github.com/acahir/Barebones/archive/master.zip) or the repo can be cloned using `git clone https://github.com/acahir/Barebones.git`.

Once you have your bare hands on Barebones, use the [documentation and examples](https://acahir.github.io/Barebones/) to get started.


### What's in the download?

The download includes Skeleton's CSS, [Normalize CSS](https://github.com/necolas/normalize.css/) as a reset, a sample favicon, and an index.html as a starting point. It also includes skeleton-legacy.css in case you are updating an existing site, though this stylesheet is not linked in the index.html template.

```
Skeleton/
├── index.html
├── css/
│   ├── barebones.css
│   ├── normalize.css
│   └── skeleton-legacy.css
└── images/
    └── favicon.png

```

## Why Barebones?

Building off of Skeleton's [awesomeness](https://github.com/dhg/Skeleton#why-its-awesome):
- Updated to use CSS variables
- Uses CSS Grid to replace 12-column grid system
- Updated normalize to current version (3.0.2 -> 8.0.1)
- Maintains backwards compatibility with Skeleton

Additional features planned and possible:
- Support for @media prefers-color-scheme (aka Dark Mode)
- Pending Release: Uses CSS env() function
- Include "extensions": instructions and templates for frequently used features:
    - Navigation boilerplate
    - Code formatting
    - Smooth Scrolling
- Add additional example site demonstrating CSS Grid layout flexibility
    



## Browser support

Barebones does make use of modern CSS features, but the base functionality is well supported.

- CSS Grid: [88% global browser support](https://caniuse.com/#feat=css-grid)
- CSS Variables: [87% global browser support](https://caniuse.com/#feat=css-variables)

The most notable missing support for both features is from IE 11 or earlier. That's probably the browser that your decision will depend on.

Barebones includes a few experimental features that are not yet widely supported. If not supported, the brower will simply ignore those directives:
- prefers-color-scheme media query: Only currently available in Safari Technology Preview
- scroll-behavior: Chrome, Firefox
- CSS env(): Nothing included in Barebones, but media queries were structured in such as way to make use of env() variables in the future
Both of these features can be achived using other methods. In fact, both are implemented using css and vanilla javascript on the [Barebones documentation page](https://acahir.github.io/Barebones/) in ~50 lines of code. In the future these may be added to Barebones as "extensions".

#### External dependencies

- normalize.css: Chrome, Edge, Firefox ESR+, Internet Explorer 10+, Safari 8+, Opera


## Acknowledgements

Barebones is build upon the great work of the Skeleton project by [Dave Gamache](https://twitter.com/dhg). It wouldn't be possible without him, and Barebones only exists because Skeleton is no longer being maintained.

The [documentation page](https://acahir.github.io/Barebones/) makes use of icons by [FontAwesome](https://fontawesome.com), [smoothscroll](https://github.com/iamdustan/smoothscroll) by [Dustan Kasten](https://github.com/iamdustan), [Google Prettify](https://code.google.com/p/google-code-prettify/), and other great tidbits shared by many.


## License

All parts of Barebones are free to use and abuse under the MIT license.


