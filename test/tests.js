// YOU SHOULD START GRUNT BEFORE RUNNING THE 
// ACCEPTANCE TEST

const chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    Promise = require('bluebird'),
    request = require('superagent-promise')(require('superagent'), Promise),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const url = process.env.URL || 'http://localhost:8000/todos';

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

describe('Create Todo Item', () => {
    let result;

    before(() => {
        result = post(url, { title: 'Walk the dog' });
    });

    it('should return a 201 CREATED response', () => {
        return assert(result, 'status').to.equal(201);
    });

    it('should recevie a location hyperlink', () => {
        return assert(result, 'header').to.contain.
            property('location').match(/^https?:\/\/.+\/todos\/[\d]+$/);
    });


    it("should have title property equal to 'Walk the dog'", () => {
        let item = result.then((res) => {
            return get(res.header['location']);
        });
        return assert(item, 'body').to.contain.property('title').equal('Walk the dog');
    });

    after(() => {
        return del(url);
    });
});
describe('Update Todo Item', () => {
    let location;

    beforeEach((done) => {
        post(url, { title: 'Walk the dog' }).then((res) => {
            location = res.header['location'];
            done();
        });
    });


    it('should have completed set to true after PUT update', () => {
        let result = update(location, 'PUT',
            { completed: true });
        return assert(result, 'body').to.contain.property('completed').equal(true);
    });


    it('should have completed set to true after PATCH update', () => {
        let result = update(location, 'PATCH',
            { 'completed': true });
        return assert(result, 'body').to.contain.property('completed').equal(true);
    });

    after(() => {
        return del(url);
    });
});
describe('Delete Todo Item', () => {
    let location;

    beforeEach((done) => {
        post(url, { title: 'Walk the dog' })
            .then((res) => {
                location = res.header['location'];
                done();
            });
    });

    it('should return 204 NO CONTENT response', () => {
        let result = del(location);
        return assert(result, 'status').to.equal(204);
    });

    it('should delete the item', () => {
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