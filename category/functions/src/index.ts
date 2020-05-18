import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import CategoryRs from "./dto/response/CategoryRs";


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
            const arrayJson = snapshot.docs.map((doc) => {
                const data = doc.data();

                const categoryRs = new CategoryRs();
                categoryRs.id = doc.id;
                categoryRs.name = data.name;
                categoryRs.description = data.description;
                categoryRs.image = data.image;
                return categoryRs;
            });
            response.status(200).send(arrayJson);
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.post('/', (request: any, response: any) => {
    const category = {
        name: request.body.name,
        description: request.body.description,
        image: request.body.image
    };

    db.collection("category").add(JSON.parse(JSON.stringify(category)))
        .then(ref => {
            const categoryRs = {
                id: ref.id,
                ...category
            }
            response.status(200).send({ message: categoryRs });
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.patch('/:categoryId', (request: any, response: any) => {
    const category = {
        id: request.params.categoryId,
        name: request.body.name,
        description: request.body.description,
        image: request.body.image
    };

    db.collection("category").add(JSON.parse(JSON.stringify(category)))
        .then(ref => {
            const categoryRs = {
                ...category
            }
            response.status(200).send({ message: categoryRs });
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

