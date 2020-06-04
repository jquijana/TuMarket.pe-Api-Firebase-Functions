"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = exports.rad = exports.calculateDistance = void 0;
exports.calculateDistance = ((lat1, long1, lat2, long2) => {
    if (lat1 && lat2 && long1 && long2) {
        const R = 6378.137; //Radio de la tierra en km
        const dLat = exports.rad(lat2 - lat1);
        const dLong = exports.rad(long2 - long1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(exports.rad(lat1)) * Math.cos(exports.rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; //distancia en Km
        return exports.round(d);
    }
    return 0;
});
exports.rad = ((x) => {
    return x * Math.PI / 180;
});
exports.round = ((x) => {
    return Math.round((x + Number.EPSILON) * 100) / 100;
});
//# sourceMappingURL=functions.js.map