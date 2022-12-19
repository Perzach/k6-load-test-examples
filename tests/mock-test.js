import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

export const options = {
  iterations: 5,
  vus: 1
};

const users = new SharedArray('Users', function () {
  console.log('READING USERS');
  return papaparse.parse(open('../resources/testUsers.csv'), { header: true }).data;
});

export function setup() {
  console.log('SETUP');
  const data = {
    my: "test",
  };
  return data;
}

export function teardown(data) {
  console.log('TEARDOWN');
}


export default function (data) {
  const user = users[Math.floor(Math.random() * users.length)]
  
  const testData = {
    user: user,
  }
  
  console.log('RUNNING TEST:', testData);
}