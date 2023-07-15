# nScope

This version of nScope is based on the Electron framework. To use it, you must have the nScope hardware, updated to the latest version. Find more information about the hardware at https://www.nscope.org/

## Pre-built Binaries

Binaries are not yet distributed, but are built as part of the Github Actions pipelines. A release process in will be established in the near future to enable end users to download nScope without needing to access github.

## Building from Source

nScope can be built and run from source to enable users and developers to quickly iterate on nScope source code. To establish a development environment, follow the steps below.

### Prerequisites

1. Rust Toolchain (https://rustup.rs)
2. Node Development Environment (https://nodejs.org/en/download)

After installing the development dependencies, check to make sure you have a working environment by running version commands for each of the required tools.

```shell
$ rustup --version
$ cargo --version
$ node --version
$ npm --version
```
The above commands should print a version successfully.

> **Note**
> On macOS the project is configured to build a universal binary, including both x86 and Apple Silicon binaries in one. To enable that, we must add both rust target toolchains as follows:
> ```shell
> rustup target add x86_64-apple-darwin
> rustup target add aarch64-apple-darwin
> ```

> **Note**
> On linux distributions, we need the system library headers for `libusb` and `libudev`. To install these on an Ubuntu distribtion, the following command should work.
> ```shell
> sudo apt-get install libusb-1.0-0-dev libudev-dev
> ```
> On other distributions, developers should look to their package managers for these development headers. 

### Clone and Install Development Dependencies

```shell
$ git clone https://github.com/nLabs-nScope/nScope.git
$ cd nScope
$ npm install
```

### Build and Run
```shell
$ npm run build
$ npm start
```
