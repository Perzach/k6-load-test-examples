# k6-load-test-examples
Examples of using k6 for load testing your services

## Pre-requisites
- Install [K6](https://k6.io/docs/get-started/installation/)
```
brew install k6
```

## Use cases

### 1 - Run a test locally
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
By using k6 [Shared Array](https://k6.io/docs/javascript-api/k6-data/sharedarray/) you can initiate an array that is read from csv or json files, that is shared across the VUs of a given k6 shell.

The following is an example of initializing the Shared Array, and also accessing it (shuffled):
```
// Initializing Shared Array
const users = new SharedArray('Users', () => {
  return papaparse.parse(open('../resources/testUsers.csv'), { header: true }).data
})

// Accessing users (shuffled)
const user = users[Math.floor(Math.random() * users.length)];
```

### 5. Monitoring test results with Grafana / inluxdb
1. Run grafana and influx docker containers: 
```
docker-compose up influxdb grafana
```

2. Run test configured to send metrics to influxdb
```
k6 run -o influxdb=http://localhost:8086/k6 tests/simple-service-test.js
```

3. You should now be able to access grafana at `localhost:3000` now and set up a Data Source and custom dashboards in grafana to monitor tests. You can import an example dashboard from the `grafana` folder in this repo. Use `http://host.docker.internal:8086` as data source url for InfluxDb, and `k6` as database.

See [K6 docs](https://k6.io/docs/results-output/real-time/influxdb-+-grafana/) for more details.

### 6. Monitoring test results in DataDog
1. Run datadog agent on your machine, remember to input your datadog api key:
```
DOCKER_CONTENT_TRUST=1 \
docker run --rm -d \
    --name datadog \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -v /proc/:/host/proc/:ro \
    -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
    -e DD_SITE="datadoghq.com" \
    -e DD_API_KEY=<YOUR_DATADOG_API_KEY> \
    -e DD_DOGSTATSD_NON_LOCAL_TRAFFIC=1 \
    -p 8125:8125/udp \
    datadog/agent:latest
```

2. Run tests:
```
K6_STATSD_ENABLE_TAGS=true k6 run --out statsd tests/simple-service-test.js
```

3. Metrics should now be accessible in datadog under `k6` namespace.

More docs on pushing metrics to datadog is found [here](https://k6.io/docs/results-output/real-time/datadog/)



### 7. Run test distributed in local k8s cluster (minikube)
1. Install and start [minikube](https://minikube.sigs.k8s.io/docs/start/)
```
brew install minikube

minikube start
```

2. Point your kubectl-context to your local k8s cluster

3. Follow [k6 documentation](https://k6.io/blog/running-distributed-tests-on-k8s/) to clone k6-operator into a location you like on your machine, and deploy its infrastructure on your local k8s: 
```
git clone https://github.com/grafana/k6-operator && cd k6-operator

make deploy
```

4. Go back to the working directory of this repo and create a configmap for your test script
```
kubectl create configmap my-test-example --from-file tests/simple-service-test.js
```

5. Create a custom resource that will run the test in your namespace. In the custom resource you can control how many machines (pods) to run, which test script to run as well as various test configs (throughput, warmup, duration) with environment variables.
```
kubectl apply -f custom-resource.yml
```

6. Now you will see several pods spinning up in your default namespace, and you should be able to see in the service dashboards that traffic is hitting the service.

7. Cleaning up local cluster after:
```
kubectl delete -f custom-resource.yml

kubectl delete configmap my-test-example

cd /path/to/k6-operator

make delete

minikube stop
```

### 8. Control different number of machines running tests on k8s
The `custom-resource.yml` file used to initiate a test in step 5 above has a config variable called `parallelism`. The number defined here controls the number of pods that will spin up to run tests in parallel.

### 9. Set different test configs in k8s
By using environment variables to assign values to the `options` block in the tests, you can configure the tests running on k8s without changing the test script itself each time. Within the tests, env vars are available under the `__ENV` object.

To see an example of this, see the `simple-service-test.js`, and also how env vars are passed to the containers in `custom-resource.yml`.

### 10. Read shared files within pods running distributed tests
Not implemented. The idea so far is to use shared volumes and reference these within the pods running the tests. 
See [github issue](https://github.com/grafana/k6/issues/2043#issuecomment-1335391149) for more info.

Alternatively, we could store files on s3 and use the [k6 s3 client](https://k6.io/docs/javascript-api/jslib/aws/s3client/) to fetch them.
See [slack thread](https://k6io.slack.com/archives/C3FH0694P/p1669969233924929) for more info.