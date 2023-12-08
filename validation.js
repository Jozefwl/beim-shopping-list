const Joi = require('joi');

const itemSchemaValidation = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().default('Other'),
    quantity: Joi.number().required(),
    checked: Joi.boolean().required()
  });

  const createListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().required(),
    sharedTo: Joi.array().items(Joi.string()),
    isPublic: Joi.boolean().default(false),
    items: Joi.array().items(itemSchemaValidation).required(), // Joi schema used here
    isArchived: Joi.boolean().optional().default(false)
  });

  const updateListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().optional(),
    sharedTo: Joi.array().items(Joi.string()).optional(),
    isPublic: Joi.boolean().optional(),
    items: Joi.array().items(itemSchemaValidation).min(1).optional(), // Validate each item if provided
    isArchived: Joi.boolean().optional(),
    ownerId: Joi.any().forbidden() // Prevent changing the owner
}).min(1); // Ensure at least one field is provided

module.exports = {
    itemSchemaValidation,
    createListSchemaValidation,
    updateListSchemaValidation
};