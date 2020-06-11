"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const ProductRs_1 = require("./dto/response/ProductRs");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
//============================== PŔODUCTS ==============================\\
app.get('/', (request, response) => {
    db.collection("product").where('marketId', '==', request.query.marketId).get()
        .then(snapshot => {
        const arrayJson = snapshot.docs.map((doc) => {
            const data = doc.data();
            const productRs = new ProductRs_1.ProductRs();
            productRs.id = doc.id;
            productRs.name = data.name;
            productRs.description = data.description;
            productRs.marketId = data.marketId;
            const priceRs = new ProductRs_1.PriceRs();
            priceRs.priceUnit = data.price.priceUnit;
            productRs.price = priceRs;
            productRs.images = data.images.map((image) => {
                const productImageRs = new ProductRs_1.ProductImageRs();
                productImageRs.id = image.id;
                productImageRs.name = image.name;
                productImageRs.url = image.url;
                return productImageRs;
            });
            return productRs;
        });
        response.status(200).send(arrayJson);
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
app.post('/', (request, response) => {
    const product = parseToEntity(request);
    if (!request.body.id) {
        db.collection('product').add(JSON.parse(JSON.stringify(product)))
            .then(ref => {
            const productRs = Object.assign(Object.assign({}, product), { id: ref.id });
            response.status(200).send(productRs);
        }).catch(error => {
            response.status(500).send({ message: error });
        });
    }
    else {
        db.collection('product').doc(request.params.productId).set(JSON.parse(JSON.stringify(product)), { merge: true })
            .then(ref => {
            response.status(200).send({ message: 'Update Successull' });
        }).catch(error => {
            response.status(500).send({ message: error });
        });
    }
});
app.delete('/:productId', (request, response) => {
    db.collection("product").doc(request.params.productId).delete()
        .then(ref => {
        response.status(200).send({ message: 'Remove succsesfull' });
    })
        .catch(error => {
        response.status(500).send({ message: error });
    });
});
exports.products = functions.https.onRequest(app);
const parseToEntity = ((request) => {
    const product = {
        id: request.body.id,
        code: request.body.code,
        name: request.body.name,
        description: request.body.description,
        marketId: request.body.marketId,
        price: {
            priceUnit: request.body.price.priceUnit,
        },
        images: request.body.images.map((image) => {
            return {
                id: image.id,
                name: image.name,
                url: image.url
            };
        })
    };
    return product;
});
//# sourceMappingURL=index.js.map