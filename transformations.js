export const transforms = {
    toilets: (data) => ({
        ...data,
        ownerName: data.owner?.name ?? null,
        facilities: (data.facilities || []).join(",")
    }),

    recycling: (data) => ({
        ...data,
        services: (data.services || []).join(",")
    }),

    carparks: (data) => ({
        ...data,
        ownerName: data.owner?.name ?? null,
        paymentMethods: (data.paymentMethods || []).join(",")
    }),

    foi: (data) => data,
    busStops: (data) => data,
    eatsafe: (data) => data,
    defibrillators: (data) => data,
    vehicles: (data) => data
}