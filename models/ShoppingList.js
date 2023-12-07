const mongoose = require('mongoose');

const itemSchemaMongo = new mongoose.Schema({
    name: String,
     category: {
        type: String,
        enum: ['Groceries', 'Beverages', 'Supplies', 'Belongings', 'Other'],
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
    isPublic: Boolean
});

module.exports = mongoose.model('ShoppingList', shoppingListSchemaMongo);
