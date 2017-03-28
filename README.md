# ok-cache

## Install
```shell
npm i ok-cache --save
```

## Usage

```javascript
import OkCache from 'ok-cache';

const cache = new OkCache({
  prefix: 'app_', // default: ''
  driver: 'wxapp' // default: 'localStorage'
});

cache.flush().rememberMany({
  userInfo (resolve) {
    setTimeout(() => resolve({
      name: 'Lily',
      gender: 'female'
    }), 1000);
  },
  commonSettings (resolve) {
    setTimeout(() => resolve({
      siteName: 'DREAM',
      showModal: false
    }), 2000);
  }
}).then(({ userInfo, commonSettings }) => {
  console.log(`${userInfo.name}, welcome to ${commonSettings.siteName}`);
});
```