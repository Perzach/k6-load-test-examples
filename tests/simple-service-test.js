import http from 'k6/http';
import { check, group } from 'k6';


export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-arrival-rate',
      startRate: __ENV.START_RATE || 0,
      timeUnit: __ENV.TARGET_TIME_UNIT || '1s',
      preAllocatedVUs: __ENV.PRE_ALLOCATED_VUS || 1,
      maxVUs: __ENV.MAX_VUS || 100,
      stages: [
        { target: __ENV.TARGET_ITERATIONS_THROUGHPUT || 10,duration: __ENV.WARMUP_DURATION || '10s'},
        { target: __ENV.TARGET_ITERATIONS_THROUGHPUT || 10, duration: __ENV.TEST_DURATION || '1m'}
      ],
      tags: {
        testName: 'simple-service-test'
      }
    },
  }
};

export function setup() {
  console.log('Running k6 test: simple-playout-test.js');
  console.log('__ENV.START_RATE:', __ENV.START_RATE);
  console.log('__ENV.TARGET_TIME_UNIT:', __ENV.TARGET_TIME_UNIT);
  console.log('__ENV.PRE_ALLOCATED_VUS:', __ENV.PRE_ALLOCATED_VUS);
  console.log('__ENV.MAX_VUS:', __ENV.MAX_VUS);
  console.log('__ENV.TARGET_ITERATIONS_THROUGHPUT:', __ENV.TARGET_ITERATIONS_THROUGHPUT);
  console.log('__ENV.WARMUP_DURATION:', __ENV.WARMUP_DURATION);
  console.log('__ENV.TEST_DURATION:', __ENV.TEST_DURATION);
}

export default function () {
  group('invoke-service', () => {
    const reqOptions = {
      headers: {
        'Accept': 'application/json'
      }
    };
    const res = http.get(`https://example.com`, reqOptions);
    check(res, { 'status was 200': (r) => r.status == 200 });

    if (res.status !== 200 && res.body) {
      console.warn('REQUEST FAILED:', JSON.parse(res.body).errors);
    }
  })
}