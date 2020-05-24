"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const CategoryRs_1 = require("./dto/response/CategoryRs");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
//============================== CATEGORY ==============================\\
app.get('/', (request, response) => {
    db.collection("category").get()
        .then(snapshot => {
        console.log(snapshot);
        const arrayJson = snapshot.docs.map((doc) => {
            const data = doc.data();
            const categoryRs = new CategoryRs_1.default();
            categoryRs.id = doc.id;
            categoryRs.name = data.name;
            categoryRs.description = data.description;
            categoryRs.image = data.image;
            if (data.items) {
                categoryRs.items = data.items.map((item) => {
                    const categoryItemRs = new CategoryRs_1.CategoryItemRs();
                    categoryItemRs.id = item.id;
                    categoryItemRs.name = item.name;
                    categoryItemRs.description = item.description;
                    categoryItemRs.image = item.image;
                    return categoryItemRs;
                });
            }
            return categoryRs;
        });
        response.status(200).send(arrayJson);
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
app.post('/', (request, response) => {
    let items;
    if (request.body.items) {
        items = request.body.items.map((item) => {
            return {
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
            };
        });
    }
    const category = {
        name: request.body.name,
        description: request.body.description,
        image: request.body.image,
        items: items
    };
    db.collection("category").add(JSON.parse(JSON.stringify(category)))
        .then(ref => {
        const categoryRs = Object.assign({ id: ref.id }, category);
        response.status(200).send(categoryRs);
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
app.patch('/', (request, response) => {
    let items;
    if (request.body.items) {
        items = request.body.items.map((item) => {
            return {
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
            };
        });
    }
    const category = {
        id: request.body.id,
        name: request.body.name,
        description: request.body.description,
        image: request.body.image,
        items: items
    };
    db.collection("category").doc(request.body.id).set(JSON.parse(JSON.stringify(category)))
        .then(ref => {
        response.status(200).send(category);
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
app.delete('/:categoryId', (request, response) => {
    db.collection("category").doc(request.params.categoryId).delete()
        .then(ref => {
        response.status(200).send({ message: 'Remove succsesfull' });
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
exports.categories = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map