const knex = require('knex');
// following 2 lines added for knex paginate
const { attachPaginate } = require('knex-paginate');
attachPaginate();

const knexfile = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

module.exports = knex(configOptions);
