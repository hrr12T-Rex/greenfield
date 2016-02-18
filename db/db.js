var Knex = require('knex');
var Bookshelf = require('bookshelf');
var env = require('node-env-file');

env('.env');

var knex = Knex({
  client: 'mysql',
  connection: process.env.CLEARDB_DATABASE_URL || {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'booklist',
    charset: 'utf8'
  }
});

var db = Bookshelf(knex);

var createUsers = function () {
  db.knex.schema.hasTable('users')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('users', function (user) {
        user.increments('id').primary();
        user.string('amz_auth_id', 255).notNullable().index();
        user.string('email', 255).notNullable();
        user.string('name', 255).notNullable();
      })
        .then(function(table) {
          console.log('created table users');
          createAuthors();
        })
        .catch(function(err) {
          console.error(err);
        });
    } else {
      createAuthors();
    }
  })
}

var createAuthors = function () {
  db.knex.schema.hasTable('authors')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('authors', function (author) {
        author.increments('id').primary();
        author.string('name', 255).notNullable();
      })
      .then (function (table) {
        console.log('created table authors');
        createBooks();
      })
      .catch (function (err) {
        console.error(err);
      });
    } else {
      createBooks();
    }
  });
};
  
var createBooks = function () {
  db.knex.schema.hasTable('books')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('books', function (book) {
        book.increments('id').primary();
        book.string('title', 255).index().notNullable();
        book.integer('author_id').unsigned().references('id').inTable('authors').index().notNullable();
        book.string('amazon_id', 255);
        book.string('publisher', 255);
        book.date('pub_year');
      })
      .then( function (table) {
        console.log('created table books');
        createReactions();
      })
      .catch( function (err) {
        console.error(err);
      });
    } else {
      createReactions();
    }
  });
};
  
var createReactions = function () {
  db.knex.schema.hasTable('reactions')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('reactions', function (author) {
        author.increments('id').primary();
        author.string('verbiage', 255);
      })
      .then (function (table) {
        console.log('created table reactions');
        createBooksUsers();
      })
      .catch (function (err) {
        console.error(err);
      });
    } else {
      createBooksUsers();
    }
  });
};

/*** JOIN TABLES ***/

var createBooksUsers = function () { 
  db.knex.schema.hasTable('books_users')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('books_users', function (book_user) {
        book_user.increments('id').primary();
        book_user.integer('book_id').unsigned().references('id').inTable('books').index().notNullable();
        book_user.integer('user_id').unsigned().references('id').inTable('users').index().notNullable();
      })
      .then( function (table) {
        console.log('created table books_users');
        createBooksUsersReactions();
      })
      .catch( function (err) {
        console.error(err);
      })
    } else {
      createBooksUsersReactions();
    }
  });
};

var createBooksUsersReactions = function () {
  db.knex.schema.hasTable('books_users_reactions')
  .then(function (exists) {
    if (!exists) {
      db.knex.schema.createTable('books_users_reactions', function (bur) {
        bur.increments('id').primary();
        bur.integer('reaction_id').unsigned().references('id').inTable('reactions').index().notNullable();
        bur.integer('books_users_id').unsigned().references('id').inTable('books_users').index().notNullable();
      })
      .then( function (table) {
        console.log('created table books_users_reactions');
      })
      .catch( function (err) {
        console.error(err);
      })
    }
  });
};

createUsers();
  

module.exports = db;