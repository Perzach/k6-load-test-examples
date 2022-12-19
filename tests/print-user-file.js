import file from 'k6/x/file';
import { scenario } from 'k6/execution';

export const options = {
  scenarios: {
    'print-all-users': {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 10,
      maxDuration: '1h',
    },
  },
};

export function setup() {
  console.log('Creating file');
  const filePath = 'testUsers.csv';
  file.writeString(filePath, 'username,email,password\n');
  const data = {
    filePath
  };
  return data;
}

export default function (data) {
  const i = scenario.iterationInTest + 1;
  const lineToWrite = `user-${i},user-${i}@mail.com,password\n`
  console.log('Writing line:', lineToWrite);
  file.appendString(data.filePath, lineToWrite);
}