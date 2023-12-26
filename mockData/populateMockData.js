const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/Users'); // Import your User model
const ShoppingList = require('../models/ShoppingList'); // Import your ShoppingList model
const readline = require('readline');
const mongoURI = process.env.MONGO_URI; // Use require for importing
const { mockUsers, mockShoppingLists } = require('./mockData'); // Use destructuring for importing

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const connectedDatabase = mongoose.connection.db;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function hashPasswords(users) {
    for (let user of users) {
        if (user.password && typeof user.password === 'string' && user.password.trim() !== '') {
            user.password = await bcrypt.hash(user.password, 10);
        } else {
            // Handle the error scenario, e.g., log a warning or throw an error
            console.warn(`Invalid password for user: ${user.username}`);
        }
    }
}


async function populateMockData() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await ShoppingList.deleteMany({});

        // Populate users and retrieve their IDs
        await hashPasswords(mockUsers);
        const users = await User.insertMany(mockUsers);

        // Create shopping lists with user IDs and map sharedTo to user IDs
        const shoppingLists = mockShoppingLists.map(list => {
            const owner = users.find(u => u.username === list.ownerId);
            const sharedTo = list.sharedTo.map(username => {
                const sharedUser = users.find(user => user.username === username);
                return sharedUser ? sharedUser._id : null;
            }).filter(id => id !== null); // filter out any null values
        
            return {
                ...list,
                ownerId: owner ? owner._id : null,
                sharedTo
            };
        });
        
        await ShoppingList.insertMany(shoppingLists);

        console.log('Mock data successfully populated');
    } catch (error) {
        console.error('Error populating mock data:', error);
    } finally {
        mongoose.connection.close();
    }
    process.exit()
}

setTimeout(() => {
    rl.question(`WARNING! THIS WILL DELETE ALL THE DATA IN ${connectedDatabase} AND POPULATE IT WITH MOCK DATA, DO YOU WISH TO PROCEED? [YES/NO] `, (answer) => {
        if (answer.toLowerCase() === 'yes') {
            populateMockData();
        } else {
            console.log('Operation canceled.');
            rl.close();
            mongoose.connection.close();
            process.exit()
        }
    });
}, 2000); // Delay of 2000 milliseconds (2 seconds)