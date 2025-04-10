const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const Comment = require('./Comment');
const Report = require('./Report');

// User to Post relationship (one-to-many)
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Category to Post relationship (one-to-many)
Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User to Comment relationship (one-to-many)
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Post to Comment relationship (one-to-many)
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment to Comment relationship (for replies)
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// User to Report relationship (one-to-many)
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// Post to Report relationship (one-to-many)
Post.hasMany(Report, { foreignKey: 'postId', as: 'reports' });
Report.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment to Report relationship (one-to-many)
Comment.hasMany(Report, { foreignKey: 'commentId', as: 'reports' });
Report.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// PostLikes many-to-many relationship
const PostLike = sequelize.define('PostLike', {}, { timestamps: true });
User.belongsToMany(Post, { through: PostLike, as: 'likedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: PostLike, as: 'likedBy', foreignKey: 'postId' });

// CommentLikes many-to-many relationship
const CommentLike = sequelize.define('CommentLike', {}, { timestamps: true });
User.belongsToMany(Comment, { through: CommentLike, as: 'likedComments', foreignKey: 'userId' });
Comment.belongsToMany(User, { through: CommentLike, as: 'likedBy', foreignKey: 'commentId' });

// PostTags many-to-many relationship
const Tag = sequelize.define('Tag', {
  name: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  }
}, { timestamps: true });

const PostTag = sequelize.define('PostTag', {}, { timestamps: false });
Post.belongsToMany(Tag, { through: PostTag, as: 'tags', foreignKey: 'postId' });
Tag.belongsToMany(Post, { through: PostTag, as: 'posts', foreignKey: 'tagId' });

module.exports = {
  User,
  Post,
  Category,
  Comment,
  Report,
  PostLike,
  CommentLike,
  Tag,
  PostTag
}; 