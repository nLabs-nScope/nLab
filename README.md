# nLab

This software is the graphical user interface (GUI) of nLab that runs on a computer running Windows, macOS, or Linux. It is based on the 

## Pre-built Binaries

Binaries are distributed as part of the release process. To download the latest versions of the software, visit the [releases page](https://github.com/nLabs-nScope/nLab/releases).

### Automatic Updates

On Windows and macOS, the nLab app should automatically check for updates whenever the computer is connected to the internet. If an update is found, the app will notify you and prompt you to restart the app to update.

## Building from Source

nLab can be built and run from source to enable users and developers to quickly iterate on nLab source code. To establish a development environment, follow the steps below.

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

> **Note** - macOS specifics
> 
> On macOS the project is configured to build a universal binary, including both x86 and Apple Silicon binaries in one. To enable that, we must add both rust target toolchains as follows:
> ```shell
> rustup target add x86_64-apple-darwin
> rustup target add aarch64-apple-darwin
> ```

> **Note** - Linux specifics
> 
> On linux distributions, we need the system library headers for `libusb` and `libudev`. To install these on an Ubuntu distribtion, the following command should work.
> ```shell
> sudo apt-get install libusb-1.0-0-dev libudev-dev
> ```
> On other distributions, developers should look to their package managers for these development headers. 

### Clone and Install Development Dependencies

```shell
$ git clone https://github.com/nLabs-nScope/nLab.git
$ cd nLab
$ npm install
```

### Build and Run
```shell
$ npm run build
$ npm start
```
