import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import CategoryRs, { CategoryItemRs } from "./dto/response/CategoryRs";


if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

//============================== CATEGORY ==============================\\
app.get('/', (request: any, response: any) => {
    db.collection("category").get()
        .then(snapshot => {
            console.log(snapshot);
            const arrayJson = snapshot.docs.map((doc) => {
                const data = doc.data();

                const categoryRs = new CategoryRs();
                categoryRs.id = doc.id;
                categoryRs.name = data.name;
                categoryRs.description = data.description;
                categoryRs.image = data.image;

                if (data.items) {
                    categoryRs.items = data.items.map((item: any) => {
                        const categoryItemRs = new CategoryItemRs();
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

app.post('/', (request: any, response: any) => {
    let items;
    if (request.body.items) {
        items = request.body.items.map((item: any) => {
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
            const categoryRs = {
                id: ref.id,
                ...category
            }
            response.status(200).send(categoryRs);
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.patch('/', (request: any, response: any) => {
    let items;
    if (request.body.items) {
        items = request.body.items.map((item: any) => {
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

app.delete('/:categoryId', (request: any, response: any) => {
    db.collection("category").doc(request.params.categoryId).delete()
        .then(ref => {
            response.status(200).send({ message: 'Remove succsesfull' });
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

exports.categories = functions.https.onRequest(app);

