
const mockShoppingLists = [
	{
		"_id": "658aa61ab8605d9c41ebf804",
		"shoppingListName": "My Best Shopping List",
		"items": [
			{
				"name": "Dragonfruit",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf805"
			},
			{
				"name": "Banana",
				"category": "Groceries",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf806"
			},
			{
				"name": "Apple",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf807"
			},
			{
				"name": "Tape",
				"category": "Supplies",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf808"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fb",
		"sharedTo": [
			"658aa61ab8605d9c41ebf7fc"
		],
		"isPublic": false,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf809",
		"shoppingListName": "Shopping List",
		"items": [
			{
				"name": "Hammer",
				"category": "Supplies",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf80a"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fc",
		"sharedTo": [],
		"isPublic": true,
		"isArchived": true,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf80b",
		"shoppingListName": "Weekly Groceries",
		"items": [
			{
				"name": "Milk",
				"category": "Groceries",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf80c"
			},
			{
				"name": "Bread",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf80d"
			},
			{
				"name": "Eggs",
				"category": "Groceries",
				"quantity": 12,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf80e"
			},
			{
				"name": "Cheese",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf80f"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fd",
		"sharedTo": [
			"658aa61ab8605d9c41ebf7fb"
		],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf810",
		"shoppingListName": "Supplies Supplies",
		"items": [
			{
				"name": "Supplies Hats",
				"category": "Supplies",
				"quantity": 10,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf811"
			},
			{
				"name": "Streamers",
				"category": "Supplies",
				"quantity": 3,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf812"
			},
			{
				"name": "Cups",
				"category": "Supplies",
				"quantity": 20,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf813"
			},
			{
				"name": "Plates",
				"category": "Supplies",
				"quantity": 20,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf814"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fc",
		"sharedTo": [],
		"isPublic": false,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf815",
		"shoppingListName": "Office Supplies",
		"items": [
			{
				"name": "Notebooks",
				"category": "Other",
				"quantity": 5,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf816"
			},
			{
				"name": "Pens",
				"category": "Other",
				"quantity": 10,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf817"
			},
			{
				"name": "Markers",
				"category": "Other",
				"quantity": 5,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf818"
			},
			{
				"name": "Stapler",
				"category": "Other",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf819"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fe",
		"sharedTo": [
			"658aa61ab8605d9c41ebf7fd"
		],
		"isPublic": false,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf81a",
		"shoppingListName": "Holiday Gifts",
		"items": [
			{
				"name": "Scarf",
				"category": "Belongings",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf81b"
			},
			{
				"name": "Book",
				"category": "Belongings",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf81c"
			},
			{
				"name": "Candle",
				"category": "Other",
				"quantity": 3,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf81d"
			},
			{
				"name": "Chocolate Box",
				"category": "Groceries",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf81e"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fb",
		"sharedTo": [
			"658aa61ab8605d9c41ebf7fe"
		],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf81f",
		"shoppingListName": "Kitchen Essentials",
		"items": [
			{
				"name": "Olive Oil",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf820"
			},
			{
				"name": "Salt",
				"category": "Groceries",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf821"
			},
			{
				"name": "Pepper",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf822"
			},
			{
				"name": "Flour",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf823"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7fd",
		"sharedTo": [
			"658aa61ab8605d9c41ebf7fb"
		],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf824",
		"shoppingListName": "Fitness Gear",
		"items": [
			{
				"name": "Yoga Mat",
				"category": "Belongings",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf825"
			},
			{
				"name": "Dumbbells",
				"category": "Belongings",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf826"
			},
			{
				"name": "Resistance Bands",
				"category": "Belongings",
				"quantity": 3,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf827"
			},
			{
				"name": "Running Shoes",
				"category": "Belongings",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf828"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf7ff",
		"sharedTo": [],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf829",
		"shoppingListName": "Gardening Supplies",
		"items": [
			{
				"name": "Potting Soil",
				"category": "Other",
				"quantity": 2,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf82a"
			},
			{
				"name": "Garden Trowel",
				"category": "Other",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf82b"
			},
			{
				"name": "Watering Can",
				"category": "Other",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf82c"
			},
			{
				"name": "Flower Seeds",
				"category": "Other",
				"quantity": 4,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf82d"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf800",
		"sharedTo": [],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	},
	{
		"_id": "658aa61ab8605d9c41ebf82e",
		"shoppingListName": "BBQ Supplies",
		"items": [
			{
				"name": "Steaks",
				"category": "Groceries",
				"quantity": 4,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf82f"
			},
			{
				"name": "Sausages",
				"category": "Groceries",
				"quantity": 10,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf830"
			},
			{
				"name": "Burger Buns",
				"category": "Groceries",
				"quantity": 12,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf831"
			},
			{
				"name": "Ketchup",
				"category": "Groceries",
				"quantity": 1,
				"checked": false,
				"_id": "658aa61ab8605d9c41ebf832"
			}
		],
		"ownerId": "658aa61ab8605d9c41ebf801",
		"sharedTo": [],
		"isPublic": true,
		"isArchived": false,
		"__v": 0
	}
]

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
