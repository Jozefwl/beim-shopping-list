
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
                "category": "Household",
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
                "category": "Household",
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
                "category": "Dairy",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Bread",
                "category": "Bakery",
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
                "category": "Dairy",
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
        "shoppingListName": "Party Supplies",
        "items": [
            {
                "name": "Party Hats",
                "category": "Party",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Streamers",
                "category": "Party",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Cups",
                "category": "Party",
                "quantity": 20,
                "checked": false
            },
            {
                "name": "Plates",
                "category": "Party",
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
                "category": "Stationery",
                "quantity": 5,
                "checked": false
            },
            {
                "name": "Pens",
                "category": "Stationery",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Markers",
                "category": "Stationery",
                "quantity": 5,
                "checked": false
            },
            {
                "name": "Stapler",
                "category": "Stationery",
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
                "category": "Apparel",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Book",
                "category": "Books",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Candle",
                "category": "Decor",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Chocolate Box",
                "category": "Food",
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
                "category": "Cooking",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Salt",
                "category": "Cooking",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Pepper",
                "category": "Cooking",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Flour",
                "category": "Baking",
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
                "category": "Exercise",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Dumbbells",
                "category": "Exercise",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Resistance Bands",
                "category": "Exercise",
                "quantity": 3,
                "checked": false
            },
            {
                "name": "Running Shoes",
                "category": "Footwear",
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
                "category": "Gardening",
                "quantity": 2,
                "checked": false
            },
            {
                "name": "Garden Trowel",
                "category": "Gardening",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Watering Can",
                "category": "Gardening",
                "quantity": 1,
                "checked": false
            },
            {
                "name": "Flower Seeds",
                "category": "Gardening",
                "quantity": 4,
                "checked": false
            }
        ],
        "ownerId": "green_thumb42",
        "sharedTo": [],
        "isPublic": true
    },
    {
        "shoppingListName": "BBQ Party",
        "items": [
            {
                "name": "Steaks",
                "category": "Meat",
                "quantity": 4,
                "checked": false
            },
            {
                "name": "Sausages",
                "category": "Meat",
                "quantity": 10,
                "checked": false
            },
            {
                "name": "Burger Buns",
                "category": "Bakery",
                "quantity": 12,
                "checked": false
            },
            {
                "name": "Ketchup",
                "category": "Condiments",
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
