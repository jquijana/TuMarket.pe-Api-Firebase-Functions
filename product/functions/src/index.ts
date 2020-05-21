import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import { ProductRs, ProductImageRs, PriceRs } from "./dto/response/ProductRs";

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

//============================== PŔODUCTS ==============================\\
app.get('/', (request: any, response: any) => {
    db.collection("product").where('marketId', '==', request.query.marketId).get()
        .then(snapshot => {
            const arrayJson = snapshot.docs.map((doc) => {
                const data = doc.data();
                const productRs = new ProductRs();
                productRs.id = doc.id;
                productRs.name = data.name;
                productRs.description = data.description;
                productRs.marketId = data.marketId;

                const priceRs = new PriceRs();
                priceRs.priceUnit = data.price.priceUnit;
                productRs.price = priceRs;

                productRs.images = data.images.map((image: any) => {
                    const productImageRs = new ProductImageRs();
                    productImageRs.id = image.id;
                    productImageRs.name = image.name;
                    productImageRs.url = image.url;
                    return productImageRs;
                });

                return productRs;
            })
            response.status(200).send(arrayJson);
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.post('/', (request: any, response: any) => {
    const product = parseToEntity(request);
    db.collection('product').add(JSON.parse(JSON.stringify(product)))
        .then(ref => {
            const productRs = {
                ...product,
                id: ref.id
            }
            response.status(200).send(productRs);
        }).catch(error => {
            response.status(500).send({ message: error });

        });
});

app.patch('/:productId', (request: any, response: any) => {
    const product = parseToEntity(request);
    db.collection('product').doc(request.params.productId).set(JSON.parse(JSON.stringify(product)), { merge: true })
        .then(ref => {
            response.status(200).send({ message: 'Update Successull' });
        }).catch(error => {
            response.status(500).send({ message: error });
        })
});

app.delete('/:productId', (request: any, response: any) => {
    db.collection("product").doc(request.params.productId).delete()
        .then(ref => {
            response.status(200).send({ message: 'Remove succsesfull' });
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

exports.products = functions.https.onRequest(app);


const parseToEntity = ((request: any) => {
    const product = {
        id: request.params.productId,
        code: request.body.code,
        name: request.body.name,
        description: request.body.description,
        marketId: request.body.marketId,
        price: {
            priceUnit: request.body.price.priceUnit,
        },
        images: request.body.images.map((image: any) => {
            return {
                id: image.id,
                name: image.name,
                url: image.url
            }
        })
    };
    return product;
});
