import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import CategoryRs, { ItemRs } from "./dto/response/CategoryRs";
import { MarketRs, MarketImageRs, UbigeoRs, ContactRs, QualificationRs, AdditionalData } from "./dto/response/MarketRs";
import { calculateDistance, round } from "./util/functions";

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

//============================== MARKETS ==============================\\
app.get('/', (request: any, response: any) => {
    if (!request.query.category) {
        response.status(400).send({ message: 'category is required' });
    }

    let marketRef = db.collection('market').where('category.id', '==', request.query.category);
    if (request.query.item) {
        marketRef = marketRef.where('category.item.id', '==', request.query.item);
    }

    marketRef.get()
        .then(snapshot => {
            console.log(snapshot.docs);
            const arrayJson = snapshot.docs.map((doc) => {
                const marketRs = parseToRs(doc, request.query.latitude, request.query.longitude);
                return marketRs;
            })
            response.status(200).send(arrayJson);
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.post('/', (request: any, response: any) => {
    console.log("request", request);
    if (!request.body.category.id) {
        response.status(400).send({ message: 'category is required' });
    }

    if (!request.body.category.item) {
        response.status(400).send({ message: 'item is required' });
    }

    db.collection("category").doc(request.body.category.id).get()
        .then(doc => {
            const item = doc.data()?.items.find((x: any) => x.id === request.body.category.item);
            if (!item) response.status(400).send({ message: 'Item Not Exists' });
            const category = {
                id: doc.id,
                name: doc.data()?.name,
                item: {
                    id: item.id,
                    name: item.name
                }
            };
            const market = parseToEntity(request, category, 'C');
            db.collection('market').add(JSON.parse(JSON.stringify(market)))
                .then(ref => {
                    const marketRs = {
                        ...market,
                        id: ref.id
                    }
                    response.status(200).send(marketRs);
                }).catch(error => {
                    response.status(500).send({ message: error });
                })
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.patch('/', (request: any, response: any) => {
    if (!request.body.category.id) {
        response.status(400).send({ message: 'category is required' });
    }

    if (!request.body.category.item) {
        response.status(400).send({ message: 'item is required' });
    }

    db.collection("category").doc(request.body.category.id).get()
        .then(doc => {
            const item = doc.data()?.items.find((x: any) => x.id === request.body.category.item);
            if (!item) response.status(400).send({ message: 'Item Not Exists' });

            const category = {
                id: doc.id,
                name: doc.data()?.name,
                item: {
                    id: item.id,
                    name: item.name
                }
            };
            const market = parseToEntity(request, category, 'U');
            db.collection('market').doc(request.body.id).set(JSON.parse(JSON.stringify(market)), { merge: true })
                .then(ref => {
                    response.status(200).send({ message: 'Update Successull' });
                }).catch(error => {
                    response.status(500).send({ message: error });
                })
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

app.delete('/:marketId', (request: any, response: any) => {
    db.collection("market").doc(request.params.marketId).delete()
        .then(ref => {
            response.status(200).send({ message: 'Remove succsesfull' });
        })
        .catch(error => {
            response.status(500).send({ message: error });
        });
});

exports.markets = functions.https.onRequest(app);


const parseToEntity = ((request: any, category: any, type: string) => {
    let stars;
    switch (type) {
        case 'C':
            stars = {
                one_star: 0,
                two_star: 0,
                three_star: 0,
                four_star: 0,
                five_star: 0
            };
            break;
    }

    let ubigeo;
    if (request.body.ubigeo) {
        ubigeo = {
            latitude: request.body.ubigeo.latitude,
            longitude: request.body.ubigeo.longitude,
            address: request.body.ubigeo.address
        }
    }

    let additionalData;
    if (request.body.additionalData) {
        additionalData = {
            information: request.body.additionalData.information,
            urlVideo: request.body.additionalData.video
        }
    }

    let contact;
    if (!request.body.contact) {
        contact = {
            administrator: request.body.contact.administrator,
            cellphone: request.body.contact.cellphone,
            email: request.body.contact.email,
            web: request.body.contact.web
        }
    }

    const marketEntity = {
        id: request.body.id,
        name: request.body.name,
        description: request.body.description,
        contact: contact,
        category: category,
        images: request.body.images.map((image: any) => {
            return {
                id: image.id,
                isMain: image.isMain,
                name: image.name,
                url: image.url
            }
        }),
        ubigeo: ubigeo,
        stars: stars,
        additionalData: additionalData
    };
    return marketEntity;
});


const parseToRs = ((doc: any, latitude: number, longitude: number) => {
    const data = doc.data();
    const marketRs = new MarketRs();
    marketRs.id = doc.id;
    marketRs.name = data.name;
    marketRs.description = data.description;

    const categoryRs = new CategoryRs();
    categoryRs.id = data.category.id;
    categoryRs.name = data.category.name;
    categoryRs.item = new ItemRs(data.category.item.id, data.category.item.name);
    marketRs.category = categoryRs;

    if (data.contact) {
        const ubigeoRs = new UbigeoRs();
        ubigeoRs.latitude = data.ubigeo.latitude;
        ubigeoRs.longitude = data.ubigeo.longitude;
        ubigeoRs.address = data.ubigeo.address;
        ubigeoRs.distance = calculateDistance(+latitude, +longitude, data.ubigeo.latitude, data.ubigeo.longitude);
        marketRs.ubigeo = ubigeoRs;
    }

    marketRs.images = data.images.map((image: any) => {
        const marketImage = new MarketImageRs();
        marketImage.id = image.id;
        marketImage.isMain = image.isMain;
        marketImage.name = image.name;
        marketImage.url = image.url;
        return marketImage;
    });

    if (data.contact) {
        const contactRs = new ContactRs();
        contactRs.administrator = data.contact.administrator;
        contactRs.cellphone = data.contact.cellphone;
        contactRs.email = data.contact.email;
        contactRs.web = data.contact.web;
        marketRs.contact = contactRs;
    }

    if (data.stars) {
        const qualificationRs = new QualificationRs();
        const total = data.stars.one_star + data.stars.two_star + data.stars.three_star + data.stars.four_star + data.stars.five_star;
        if (total > 0) {
            const average = ((1 * data.stars.one_star) + (2 * data.stars.two_star) + (3 * data.stars.three_star) + (4 * data.stars.four_star) + (5 * data.stars.five_star)) / total;
            qualificationRs.votes = total;
            qualificationRs.average = round(average);
            qualificationRs.stars = Math.round(average);
        } else {
            qualificationRs.votes = 0;
            qualificationRs.average = 0;
            qualificationRs.stars = 0;
        }
        marketRs.qualification = qualificationRs;
    }

    if (data.additionalData) {
        const additionalData = new AdditionalData();
        additionalData.information = data.additionalData.information;
        additionalData.urlVideo = data.additionalData.urlVideo;
        marketRs.additionalData = additionalData;
    }

    return marketRs;
});