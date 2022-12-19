# k6-load-test-examples
Examples of using k6 for load testing your services

## Use cases

### 1. Write to a file from a k6 test
K6 does not support out of the box writing to a file but it is possible to use a 3rd-party extension to enable a test to write to a file to the local filesystem. To do so, we need to build a custom version of k6 bundled with [this integration](https://github.com/avitalique/xk6-file).

1. Make sure that your `go` version is at least `1.17.0`

2. Install the `xk6` tool for bulding K6 `go install go.k6.io/xk6/cmd/xk6@latest`

3. Make a custom build of `k6` with the command `xk6 build v0.36.0 --with github.com/avitalique/xk6-file@latest`

4. Now you can use the new `k6` binary to run a test that writes into a local file, for example `./k6 run tests/print-user-file.js`
