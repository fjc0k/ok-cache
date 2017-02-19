/**
 * Created by 方剑成 on 2017/2/18.
 */

mocha.setup('bdd');

const expect = chai.expect;

const prefix = 'test_';
const drivers = [
  'session', 'localStorage', 'sessionStorage'
];

drivers.forEach(driver => {
  let cache = new OkCache({ prefix, driver });
  describe('cache test: ' + driver + 'Driver', () => {
    it('undef is not put, get undef === null', () => {
      expect(cache.get('undef', null)).to.equal(null);
    });
    it('with defaultValue = 5, get undef === 5', () => {
      expect(cache.get('undef', 5)).to.be.equal(5);
    });
    it('get undef === null', () => {
      expect(cache.get('undef', 5)).to.be.equal(5);
    });
    it('with defaultValue = 5, remember undef === 5', () => {
      expect(cache.remember('undef', 5)).to.be.equal(5);
    });
    it('get undef === 5', () => {
      expect(cache.get('undef', 5, true)).to.be.equal(5);
    });
    it('put undef = undefined, get undef === null', () => {
      cache.put('undef', undefined);
      expect(cache.get('undef', null, true)).to.equal(null);
    });
    it('put undef = null, get undef === null', () => {
      cache.put('undef', null);
      expect(cache.get('undef', null, true)).to.equal(null);
    });
    it('put undef = \'undef\', get undef === \'undef\'', () => {
      cache.put('undef', 'undef');
      expect(cache.get('undef', null, true)).to.equal('undef');
    });
    it('forget undef, get undef === null', () => {
      cache.forget('undef');
      expect(cache.get('undef', null, true)).to.equal(null);
    });
    it('put str = \'ok\', get str === \'ok\'', () => {
      cache.put('str', 'ok');
      expect(cache.get('str', null, true)).to.equal('ok');
    });
    it('put bool = false, get bool === false', () => {
      cache.put('bool', false);
      expect(cache.get('bool', null, true)).to.equal(false);
    });
    it('switch bool, get bool === true', () => {
      cache.switch('bool');
      expect(cache.get('bool', null, true)).to.equal(true);
    });
    it('switch bool with newValue = true, get bool === true', () => {
      cache.switch('bool', true);
      expect(cache.get('bool', null, true)).to.equal(true);
    });
    it('put num = 5.20, get num === 5.20', () => {
      cache.put('num', 5.20);
      expect(cache.get('num', null, true)).to.equal(5.20);
    });
    it('put obj = { x: \'y\', 1: 2 }, get obj == { x: \'y\', 1: 2 }', () => {
      cache.put('obj', { hello: 'world' });
      expect(cache.get('obj', null, true)).to.eql({ hello: 'world' });
    });
    it('put count = 0, get count === 0', () => {
      cache.put('count', 0);
      expect(cache.get('count', null, true)).to.equal(0);
    });
    it('increment count with default amount = 1, get count === 1', () => {
      cache.increment('count');
      expect(cache.get('count', null, true)).to.equal(1);
    });
    it('increment count with amount = 500 and maxValue = 100, get count === 100', () => {
      cache.increment('count', 500, 100);
      expect(cache.get('count', null, true)).to.equal(100);
    });
    it('decrement count with amount = 50 and minValue = 80, get count === 80', () => {
      cache.decrement('count', 50, 80);
      expect(cache.get('count', null, true)).to.equal(80);
    });
    it('forget count, get count === null', () => {
      cache.forget('count');
      expect(cache.get('count', null, true)).to.equal(null);
    });

    it('putMany ' +
      '{ name: \'lily\', gender: 1, isStudent: true}' +
      ', get name === \'lily\', get gender === 1, get isStudent === true ', () => {
      cache.putMany({
        name: 'lily',
        gender: 1,
        isStudent: true
      });
      expect(cache.get('name', null, true)).to.equal('lily');
      expect(cache.get('gender', null, true)).to.equal(1);
      expect(cache.get('isStudent', null, true)).to.equal(true);
    });

    it('getMany [\'name\', \'gender\', \'isStudent\'] == ' +
      '{ name: \'lily\', gender: 1, isStudent: true}', () => {
      expect(cache.getMany(['name', 'gender', 'isStudent'], null, true)).to.eql({
        name: 'lily',
        gender: 1,
        isStudent: true
      });
    });

    it('keys contain name, gender, isStudent', () => {
      expect(cache.keys()).to.include.members([
        'name', 'gender', 'isStudent'
      ]);
    });

    it('all.name === \'lily\'', () => {
      expect(cache.all().name).to.equal('lily');
    });

    it('get prefix === \''+prefix+'\', set prefix = \'test1_\', put name = \'funch\', get name === ' +
      '\'funch\', set prefix === \''+prefix+'\', get name === \'lily\'', () => {
      expect(cache.getPrefix()).to.equal(prefix);
      cache.setPrefix('test1_');
      cache.put('name', 'funch');
      expect(cache.get('name')).to.equal('funch');
      cache.setPrefix(prefix);
      expect(cache.get('name')).to.equal('lily');
    });


    it('flush, get name === null', () => {
      cache.flush();
      expect(cache.get('name')).to.equal(null);
    });


    it('with defaultValue = \'lily\', (async) get name === \'lily\'', () => {
      return cache.get('name', (resolve) => {
        setTimeout(() => resolve('lily'), 1000);
      }).then(name => {
        expect(name).to.equal('lily');
      });
    });

    it('get name === null', () => {
      expect(cache.get('name')).to.equal(null);
    });

    it('(async) getMany', function () {
      this.timeout(15000);
      return cache.getMany({
        name (resolve) {
          return setTimeout(() => resolve('lily'), 1000);
        },
        gender: resolve => setTimeout(() => resolve('female'), 2000),
        isStudent: resolve => setTimeout(() => resolve(true), 3000)
      }).then(values => {
        expect(values).to.eql({
          name: 'lily',
          gender: 'female',
          isStudent: true
        });
      });
    });


    it('get name === null', () => {
      expect(cache.get('name')).to.equal(null);
    });


    it('(async) rememberMany', function () {
      this.timeout(15000);
      return cache.rememberMany({
        name (resolve) {
          return setTimeout(() => resolve('lily'), 1000);
        },
        gender: resolve => setTimeout(() => resolve('female'), 2000),
        isStudent: resolve => setTimeout(() => resolve(true), 3000)
      }).then(values => {
        expect(values).to.eql({
          name: 'lily',
          gender: 'female',
          isStudent: true
        });
      });
    });


    it('get name === \'lily\'', () => {
      expect(cache.get('name')).to.equal('lily');
    });


  });
});

mocha.run();