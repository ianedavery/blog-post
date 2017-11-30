const chai = require('chai');
const chaiHTTP = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHTTP);

describe('BlogPosts', function () {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer();
	});
	it('should return list of blog posts', function() {
		return chai.request(app)
			.get('/blog-posts') //HTTP method
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body.length.should.be.at.least(1);
				const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
				res.body.forEach(function(item) {
					item.should.be.a('object');
					item.should.include.keys(expectedKeys);
				});
			});
	});
	it('should add an item on POST', function() {
		const newItem = {title: 'new blog', content: 'hello', author: 'Ian', publishDate: 'July 14, 1979'};
		return chai.request(app)
			.post('/blog-posts')
			.send(newItem)
			.then(function (res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
				res.body.id.should.not.null;
				res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
			});
	});
	it('should update items on PUT', function() {
		const updateData = {
			title: 'newer blog',
			content: 'bye',
			author: 'Ian',
			publishDate: 'November 30, 2017'
		};
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				updateData.id = res.body[0].id;
				return chai.request(app)
					.put(`/blog-posts/${updateData.id}`)
					.send(updateData)
			})
			.then(function(res) {
				res.should.have.status(204);
			});
	});
	it('should delete items on DELETE', function() {
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				return chai.request(app)
					.delete(`/blog-posts/${res.body[0].id}`);
			})
			.then(function(res) {
				res.should.have.status(204);
			})
	});
});