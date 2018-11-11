// YOU SHOULD START GRUNT BEFORE RUNNING THE 
// ACCEPTANCE TEST

const chai = require('chai'),
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

const mock = [
    {
        "location": {
            "coordinates": "32.109805/34.840232",
            "address": "HaBarzel St 27, Tel Aviv-Yafo, Israel"
        },
        "restaurant_name": "Hudson",
        "restaurant_type": "Grill",
        "phone": "+(972) 3644 4733"
    }
];

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
        return result.then(() => {
            return get(url);
        }).then((res) => {
            return expect(res['body'][0]).to.contain.property('restaurant_name').equal('Hudson');
        });
    });

    after(() => {
        return del(url);
    });
});


describe('Update Restaurant', () => {
    let location;

    before((done) => {
        del(url).then(() => {
            post(url, mock).then(() => {
                return get(url);
            }).then((res) => {
                location = url.concat('/').concat(res['body'][0].uuid);
                done();
            });
        })
    });

    it('should have restaurant_type set to Burger after PUT update', () => {
        return update(location, 'PUT',
            { 'restaurant_type': 'Burger' }).then((res) => {
                return expect(res['body']).to.contain.property('restaurant_type').equal('Burger');
            })
    });

    it('should have phone set to (+972) 050 - 4945555 PATCH update', () => {
        return update(location, 'PATCH',
            { 'phone': '(+972) 050 - 4945555' }).then((res) => {
                return expect(res['body']).to.contain.property('phone').equal('(+972) 050 - 4945555');
            });
    });

    after(() => {
        return del(url);
    });
});
describe('Delete Restaurant', () => {
    let location;
    beforeEach((done) => {
        post(url, mock)
            .then(() => get(url)).then((res) => {
                location = url.concat('/').concat(res['body'][0].uuid);
                done();
            })
    });

    it('should return 204 NO CONTENT response', () => {
        return del(location).then((res) => {
            return expect(res['status']).to.equal(204);
        });
    });

    it('should return empty restaurants list', () => {
        return del(url).then(() =>get(url)).then((res) => {
            return expect(res['body'].length).to.be.equal(0);
        });
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