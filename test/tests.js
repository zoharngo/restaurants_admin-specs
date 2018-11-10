// YOU SHOULD START GRUNT BEFORE RUNNING THE 
// ACCEPTANCE TEST

const chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    Promise = require('bluebird'),
    request = require('superagent-promise')(require('superagent'), Promise),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const url = process.env.URL || 'http://localhost:8000/api';

describe('Cross Origin Requests', () => {
    let result;
    before(() => {
        result = options(url);
    });

    it('should return the correct CORS headers', () => {
        return assert(result, 'header')
            .to.contain.all.keys([
                'access-control-allow-origin',
                'access-control-allow-methods',
                'access-control-allow-headers'
            ]);
    });

    it('should allow all origins', () => {

        return assert(result, "header")
            .to.contain.property('access-control-allow-origin').equal('*');
    });
});

const mock = [{
    'restaurant_name': 'Hudson',
    'restaurant_type': 'Grill',
    'phone': '+(972) 3644 4733',
    'location': {
        'coordinates': '32.109805/34.840232',
        'address': ''
    }
}];

describe('Create Restaurant', () => {
    let result;
    let item;

    before(() => {
        result = post(url, mock);
    });

    it('should return a 201 CREATED response', () => {
        return assert(result, 'status').to.equal(201);
    });

    it("should have restaurant_name property equal to 'Hudson'", () => {
        item = result.then((res) => {
            ;
            return get(url.concat('/').concat(res['body'][0].uuid));
        });
        return assert(item, 'body').to.contain.property('restaurant_name').equal('Hudson');
    });

    after(() => {
        return del(url);
    });
});
describe('Update Restaurant', () => {
    let location;

    beforeEach((done) => {
        post(url, mock).then((res) => {
            location = url.concat('/').concat(res['body'][0].uuid);
            done();
        });
    });


    it('should have restaurant_type set to grill after PUT update', () => {
        let result = update(location, 'PUT',
            { 'restaurant_type': 'Burger' });
        return assert(result, 'body').to.contain.property('restaurant_type').equal('Burger');
    });


    it('should have phone set to (+972) 050 - 4945555 PATCH update', () => {
        let result = update(location, 'PATCH',
            { 'phone': '(+972) 050 - 4945555' });
        return assert(result, 'body').to.contain.property('phone').equal('(+972) 050 - 4945555');
    });

    after(() => {
        return del(url);
    });
});
describe('Delete Restaurant', () => {
    let location;
    beforeEach((done) => {
        post(url, mock)
            .then((res) => {
                location = url.concat('/').concat(res['body'][0].uuid);
                done();
            });
    });

    it('should return 204 NO CONTENT response', () => {
        let result = del(location);
        return assert(result, 'status').to.equal(204);
    });

    it('should delete the restaurant', () => {
        let result = del(location).then((res) => {
            return get(location);
        });

        return expect(result).to.eventually.be.rejectedWith('Not Found');
    });
});

/**
 * Convenience functions 
 **/

// OPTIONS request and return promise
const options = (url) => {
    return request('OPTIONS', url)
        .set('Origin', 'http://someplace.com')
        .end();
};
// POST request with data and return promise
const post = (url, data) => {
    return request.post(url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(data)
        .end();
};
// GET request and return promise
const get = (url) => {
    return request.get(url)
        .set('Accept', 'application/json')
        .end();
};
// DELETE request and return promise
const del = (url) => {
    return request.del(url).end();
};
// UPDATE request with data and return promise
const update = (url, method, data) => {
    return request(method, url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(data)
        .end();
};
// Reslove promise for propery and return expectation
const assert = (result, prop) => {
    return expect(result).to.eventually.have.deep.property(prop);
};