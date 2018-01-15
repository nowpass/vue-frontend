# NOWPASS Vue.js 2 Frontend

> Please note that NOWPASS is currently in an early alpha stage and not ready for productive use.

> This App is used Google Chrome Extension and the Desktop application and should only be used for development standalone. 

This is the frontend app of the Open Source NOWPASS password manager.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

Clone the project and install all dependencies needed to run the application.

```
git clone --depth 1 https://github.com/nowpass/vue-frontend
```

### Installing

After checking out the repository, you first have to install all needed dependencies.

```
cd vue-frontend
npm install
```

After this you need to start your [NOWPASS API server](https://github.com/nowpass/server) (please don't use the production one at nowpass.org)


## Running the app

The App is a normal Vue.js web-loader application, so you can just bring an server up with

```
npm run dev
```

Visit http://localhost:8080/ to access the application.

## Building

To build the application (into the /dist folder) run

```
npm run build
```

After that you get a bundled and minified ready to use application, check the index.html on how to integrate it into a live site. 

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/nowpass/vue-frontend/tags). 

## License

This project is licensed under the GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details
