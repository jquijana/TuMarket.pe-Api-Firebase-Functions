export const calculateDistance = ((lat1: number, long1: number, lat2: number, long2: number) => {
    if (lat1 && lat2 && long1 && long2) {
        const R = 6378.137; //Radio de la tierra en km
        const dLat = rad(lat2 - lat1);
        const dLong = rad(long2 - long1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; //distancia en Km
        return round(d);
    }
    return 0;
});

export const rad = ((x: number) => {
    return x * Math.PI / 180;
});

export const round = ((x: number) => {
    return Math.round((x + Number.EPSILON) * 100) / 100;
});