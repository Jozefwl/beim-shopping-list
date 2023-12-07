
const mockShoppingLists = [
    {
        "shoppingListName": "My Best Shopping List",
        "items": [
            {
                "name": "Dragonfruit",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Banana",
                "category": "Groceries",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Apple",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Tape",
                "category": "Supplies",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "tibor123",
        "sharedTo": [
            "uhor25"
        ],
        "isPublic": false
    },
    {
        "shoppingListName": "Shopping List",
        "items": [
            {
                "name": "Hammer",
                "category": "Supplies",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "uhor25",
        "sharedTo": [],
        "isPublic": true
    },
    {
        "shoppingListName": "Weekly Groceries",
        "items": [
            {
                "name": "Milk",
                "category": "Groceries",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Bread",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Eggs",
                "category": "Groceries",
                "quantity": 12,
                "checked": false
            },
            {
                "name": "Cheese",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "mariak22",
        "sharedTo": [
            "tibor123"
        ],
        "isPublic": true
    },
    {
        "shoppingListName": "Supplies Supplies",
        "items": [
            {
                "name": "Supplies Hats",
                "category": "Supplies",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Streamers",
                "category": "Supplies",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Cups",
                "category": "Supplies",
                "quantity": 20,
                "checked": false
            },
            {
                "name": "Plates",
                "category": "Supplies",
                "quantity": 20,
                "checked": false
            }
        ],
        "ownerId": "uhor25",
        "sharedTo": [],
        "isPublic": false
    },
    {
        "shoppingListName": "Office Supplies",
        "items": [
            {
                "name": "Notebooks",
                "category": "Other",
                "quantity": 5,
                "checked": false
            },
            {
                "name": "Pens",
                "category": "Other",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Markers",
                "category": "Other",
                "quantity": 5,
                "checked": false
            },
            {
                "name": "Stapler",
                "category": "Other",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "julie_w3",
        "sharedTo": [
            "mariak22"
        ],
        "isPublic": false
    },
    {
        "shoppingListName": "Holiday Gifts",
        "items": [
            {
                "name": "Scarf",
                "category": "Belongings",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Book",
                "category": "Belongings",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Candle",
                "category": "Other",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Chocolate Box",
                "category": "Groceries",
                "quantity": 2,
                "checked": false
            }
        ],
        "ownerId": "tibor123",
        "sharedTo": [
            "julie_w3"
        ],
        "isPublic": true
    },
    {
        "shoppingListName": "Kitchen Essentials",
        "items": [
            {
                "name": "Olive Oil",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Salt",
                "category": "Groceries",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Pepper",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Flour",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "mariak22",
        "sharedTo": [
            "tibor123"
        ],
        "isPublic": true
    },
    {
        "shoppingListName": "Fitness Gear",
        "items": [
            {
                "name": "Yoga Mat",
                "category": "Belongings",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Dumbbells",
                "category": "Belongings",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Resistance Bands",
                "category": "Belongings",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Running Shoes",
                "category": "Belongings",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "alex_fit",
        "sharedTo": [],
        "isPublic": true
    },
    {
        "shoppingListName": "Gardening Supplies",
        "items": [
            {
                "name": "Potting Soil",
                "category": "Other",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Garden Trowel",
                "category": "Other",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Watering Can",
                "category": "Other",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Flower Seeds",
                "category": "Other",
                "quantity": 4,
                "checked": false
            }
        ],
        "ownerId": "green_thumb42",
        "sharedTo": [],
        "isPublic": true
    },
    {
        "shoppingListName": "BBQ Supplies",
        "items": [
            {
                "name": "Steaks",
                "category": "Groceries",
                "quantity": 4,
                "checked": false
            },
            {
                "name": "Sausages",
                "category": "Groceries",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Burger Buns",
                "category": "Groceries",
                "quantity": 12,
                "checked": false
            },
            {
                "name": "Ketchup",
                "category": "Groceries",
                "quantity": 1,
                "checked": false
            }
        ],
        "ownerId": "chefmike",
        "sharedTo": [],
        "isPublic": true
    }
];

const mockUsers = [
    
        { username: "tibor123", password: "PassForTibor123", role: "user" },
        { username: "uhor25", password: "PassForUhor25", role: "user" },
        { username: "mariak22", password: "PassForMariak22", role: "user" },
        { username: "julie_w3", password: "PassForJulieW3", role: "user" },
        { username: "alex_fit", password: "PassForAlexFit", role: "user" },
        { username: "green_thumb42", password: "PassForGreenThumb42", role: "user" },
        { username: "chefmike", password: "PassForChefMike", role: "user" },
        { username: "admin", password: "definetelySecureAsAlways", role: "admin" }
    

];

module.exports = { mockUsers };


module.exports = { mockUsers, mockShoppingLists };
