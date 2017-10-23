import PromiseMap from '../lib/PromiseMap';

const timeoutPromised = (fn, delay) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, delay);
  });

const promises = new PromiseMap();

// when the result of the promise adds to the PromiseMap again
// the map should also await the newly added values.
promises.push(
  timeoutPromised(() => {
    console.log('Timeout One!');
    promises.push(
      timeoutPromised(() => {
        console.log('Timeout Two!');
        // a 3rd layer of resolution will set a value for the
        // final PromiseMap result -- since the others used push
        // this should end up being the only final resolved value:
        // { final: 3 } after 6 seconds
        promises.set(
          'final',
          timeoutPromised(() => {
            console.log('Timeout Three!');
            return 3;
          }),
        );
      }, 5000),
    );
  }, 1000),
);

promises
  .then(result => {
    console.log('PromiseMap Result: ', result);
    if (result.final === 3) {
      console.log('Success!');
    }
  })
  .catch(err => {
    console.error('Error: ', err);
  });
