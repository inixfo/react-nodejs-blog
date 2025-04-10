# MongoDB to MySQL Migration Guide

This document outlines the steps taken to migrate the blog application from MongoDB to MySQL.

## 1. Dependencies Changes

**Backend package.json:**
- Removed: `mongoose`
- Added: `mysql2`, `sequelize`, `sequelize-cli`

## 2. Environment Variables

Updated `.env` file:

```env
# MongoDB (Old)
MONGO_URI=mongodb://localhost:27017/blog-app

# MySQL (New)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blog_app
DB_DIALECT=mysql
```

## 3. Database Configuration

Created a new database configuration file at `backend/config/db.js`:
- Added Sequelize initialization
- Created database connection setup
- Added connection pooling options
- Added model synchronization in development

## 4. Model Changes

Converted all Mongoose models to Sequelize models:
- Changed data types (String → DataTypes.STRING, etc.)
- Changed validation methods
- Updated relationship definitions
- Changed hooks (pre/post save → beforeCreate/beforeUpdate)
- Updated model methods

### Key Changes in Each Model:

#### User Model:
- Changed `mongoose.Schema` to `sequelize.define`
- Replaced Mongoose middleware with Sequelize hooks
- Updated password hashing functions 
- Changed field types and validation

#### Post Model:
- Updated relationship fields to use foreign keys
- Removed MongoDB-specific array fields
- Added relationship constraints
- Added proper timestamp handling

#### Comment, Category, and Report Models:
- Similar updates to use Sequelize syntax
- Changed relationship handling

## 5. Associations

Created a new file `models/index.js` to establish relationships between models using Sequelize associations:
- One-to-Many relationships (hasMany/belongsTo)
- Many-to-Many relationships using join tables
- Self-referencing relationships

Added dedicated join tables:
- PostLike
- CommentLike
- PostTag

## 6. Controller Updates

Updated all controllers to use Sequelize query methods:
- `findById` → `findByPk`
- `findOne` → `findOne({ where: {} })`
- `find` → `findAll`
- Updated ID referencing (`_id` → `id`)
- Changed population/include handling

## 7. Scripts

Created two new scripts:
- `createDatabase.js`: Creates the MySQL database
- `createAdmin.js`: Creates an admin user

## 8. Updated Documentation

- Updated README.md with MySQL installation and setup instructions
- Changed database connection troubleshooting guidance

## Testing Approach

When migrating from MongoDB to MySQL, thoroughly test:
1. All CRUD operations
2. Relationships and joins
3. Authentication and user management
4. Search functionality (which works differently between the databases)
5. Transaction handling

## Additional Considerations

- **Performance**: Tune MySQL for optimal performance
- **Indexing**: Add proper indexes to the tables
- **Transactions**: Leverage MySQL transactions for operations requiring atomicity
- **Connection Pooling**: Configure connection pools appropriately for production

This migration changed the database paradigm from document-based (MongoDB) to relational (MySQL), which affects how data is structured, queried, and related. 