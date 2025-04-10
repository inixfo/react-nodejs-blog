const { Category } = require('../models');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    console.log('Categories fetched successfully:', categories.length);
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    console.log('Category fetched successfully:', category.name);
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    console.log('Creating category with data:', req.body);
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      where: { name: req.body.name } 
    });
    
    if (existingCategory) {
      console.log('Category with name already exists:', req.body.name);
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create(req.body);
    console.log('Category created successfully:', category.name);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    console.log('Updating category:', req.params.id, 'with data:', req.body);
    
    let category = await Category.findByPk(req.params.id);
    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        where: { name: req.body.name } 
      });
      
      if (existingCategory) {
        console.log('Category with name already exists:', req.body.name);
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    await category.update(req.body);

    console.log('Category updated successfully:', category.name);
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    console.log('Deleting category:', req.params.id);
    
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();
    console.log('Category deleted successfully:', category.name);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 