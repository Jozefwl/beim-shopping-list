const mongoose = require('mongoose');

const itemSchemaMongo = new mongoose.Schema({
    name: String,
     category: {
        type: String,
        enum: {
            values: ['Groceries', 'Beverages', 'Supplies', 'Belongings', 'Other'],
            message: '{VALUE} is not a valid category. Allowed categories are: Groceries, Beverages, Supplies, Belongings, Other.', // Custom error message
            
        },
        default: 'Other'
    },
    
    quantity: Number,
    checked: Boolean
});

const shoppingListSchemaMongo = new mongoose.Schema({
    shoppingListName: String,
    items: [itemSchemaMongo],
    ownerId: String,
    sharedTo: [String],
    isPublic: Boolean,
    isArchived: Boolean
});

module.exports = mongoose.model('ShoppingList', shoppingListSchemaMongo);
