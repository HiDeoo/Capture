<p align="center">
  <img alt="Capture" src="https://i.imgur.com/YdidRlp.png" width="128">
  <h1 align="center">Capture</h1>
</p>

<p align="center">
  <a href="https://i.imgur.com/oYWO6j1.png" title="Library"><img alt="Capture" src="https://i.imgur.com/oYWO6j1.png" width="180"></a>
  <a href="https://i.imgur.com/FCAvfh4.png" title="Details"><img alt="Capture" src="https://i.imgur.com/FCAvfh4.png" width="180"></a>
  <a href="https://i.imgur.com/MbeEYod.png" title="Delete"><img alt="Capture" src="https://i.imgur.com/MbeEYod.png" width="180"></a>
  <a href="https://i.imgur.com/2vIzyWm.png" title="Editor"><img alt="Capture" src="https://i.imgur.com/2vIzyWm.png" width="180"></a>
  <a href="https://i.imgur.com/Dl9tKXK.png" title="Annotations"><img alt="Capture" src="https://i.imgur.com/Dl9tKXK.png" width="180"></a>
</p>
<p align="center">
  <a href="https://i.imgur.com/Pp5bQhf.png" title="Settings"><img alt="Capture" src="https://i.imgur.com/Pp5bQhf.png" width="180"></a>
  <a href="https://i.imgur.com/g6cSeAX.png" title="Shortcuts"><img alt="Capture" src="https://i.imgur.com/g6cSeAX.png" width="180"></a>
  <a href="https://i.imgur.com/Y7ShPaZ.png" title="Imgur"><img alt="Capture" src="https://i.imgur.com/Y7ShPaZ.png" width="180"></a>
  <a href="https://i.imgur.com/ubFxJlv.png" title="Dropbox"><img alt="Capture" src="https://i.imgur.com/ubFxJlv.png" width="180"></a>
</p>

<p align="center">
  <a href="https://github.com/HiDeoo/Capture/actions?query=workflow%3Aintegration"><img alt="Integration Status" src="https://github.com/HiDeoo/Capture/workflows/integration/badge.svg"></a>
  <a href="https://github.com/HiDeoo/Capture/blob/master/LICENSE"><img alt="License" src="https://badgen.now.sh/badge/license/MIT/blue"></a>
  <br /><br />
</p>

**Capture, Annotate & Share screenshots…**

## Motivations

As I couldn't find any application to quickly & easily capture, annotate and share screenshots to various destinations, I decided to build my own.

At the moment, only macOS is supported as the application internally uses [`screencapture`](https://ss64.com/osx/screencapture.html) to capture screenshots. The end goal is to make it at least compatible for Linux too as I mainly uses these 2 OSes.

## Destinations

The following destinations are currently supported to share screenshots:

- [Imgur](https://imgur.com) _(anonymously or logged in)_
- [Dropbox](https://www.dropbox.com)
- [OneDrive](https://onedrive.live.com)
- [Gyazo](https://gyazo.com)
- [Vgy.me](https://vgy.me)

## Usage

At the moment, only the source code of the application is available and no bundled versions are provided. To use it, you'll need to build the application yourself using the `yarn dist` command.

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo) & [clone](https://help.github.com/articles/cloning-a-repository) this repository.
2. Install all the dependencies using [Yarn](https://yarnpkg.com): `yarn`.
3. Set up the development environment by creating & filling a `.env.local` file based on the provided `.env` file.
4. Build & run the development version: `yarn start`.

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/Capture/blob/master/LICENSE) for more information.
