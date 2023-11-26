const Joi = require('joi');

const itemSchemaValidation = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().required(),
    checked: Joi.boolean().required()
  });

  const createListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().required(),
    owner: Joi.string().required(),
    sharedTo: Joi.array().items(Joi.string()),
    state: Joi.string().valid('public', 'private').required(),
    items: Joi.array().items(itemSchemaValidation).required() // Joi schema used here
  });

  const updateListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().optional(),
    owner: Joi.string().optional(),
    sharedTo: Joi.array().items(Joi.string()).optional(),
    state: Joi.string().valid('public', 'private').optional(),
    items: Joi.array().items(itemSchemaValidation).optional() // itemSchemaValidation is already defined
  });
  

module.exports = {
    itemSchemaValidation,
    createListSchemaValidation,
    updateListSchemaValidation
};
