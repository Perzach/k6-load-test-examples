# k6-load-test-examples
Examples of using k6 for load testing your services

## Pre-requisites
- Install [K6](https://k6.io/docs/get-started/installation/)
```
brew install k6
```

## Use cases

## 1 - Run a test locally
```
k6 run tests/simple-service-test.js
```

### 2 - Control ramping up to fixed throughput in test
By using the [Ramping Arrival Rate](https://k6.io/docs/using-k6/scenarios/executors/ramping-arrival-rate/) k6 executor you can configure your tests to ramp up and then hold a fixed throughput rate. 

For example, the following `options` block in a test will start a test from 0, and spend 2 min to ramp up to 200 iterations per second, and then hold 200 iterations per second for 5 minutes:
```
export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 1,
      maxVUs: 200,
      stages: [
        { target: 200, duration: '2m'},
        { target: 200, duration: '5m'}
      ],
      tags: {
        testName: 'my-test'
      }
    },
  }
};
```

### 3. Write to a file from a k6 test
K6 does not support out of the box writing to a file but it is possible to use a 3rd-party extension to enable a test to write to a file to the local filesystem. To do so, we need to build a custom version of k6 bundled with [this integration](https://github.com/avitalique/xk6-file).

1. Make sure that your `go` version is at least `1.17.0`

2. Install the `xk6` tool for bulding K6 `go install go.k6.io/xk6/cmd/xk6@latest`

3. Make a custom build of `k6` with the command `xk6 build v0.36.0 --with github.com/avitalique/xk6-file@latest`

4. Now you can use the new `k6` binary to run a test that writes into a local file, for example `./k6 run tests/print-user-file.js`

### 4. Read resources from file, shuffled


### 5. Monitoring test results with Grafana / inluxdb


### 6. Monitoring test results in DataDog


### 7. Run test distributed in local k8s cluster (minikube)


### 8. Control different number of machines running tests on k8s


### 9. Set different test configs in k8s
