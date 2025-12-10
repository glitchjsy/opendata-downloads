export const transforms = {
    eatsafe: (r) => ({
        name: r.name,
        rating: r.rating,
        createdAt: r.createdAt,
        address1: r.address1,
        address2: r.address2,
        address3: r.address3,
        postCode: r.postCode,
        latitude: r.latitude,
        longitude: r.longitude
    }),

    toilets: (r) => ({
        id: r.id,
        createdAt: r.createdAt,
        name: r.name,
        parish: r.parish,
        latitude: r.latitude,
        longitude: r.longitude,
        ownerName: r.owner?.name ?? null,
        facilities: (r.facilities || []).join(",")
    }),

    defibrillators: (r) => ({
        id: r.id,
        location: r.location,
        streetName: r.streetName,
        parish: r.parish,
        postCode: r.postCode,
        padNumber: r.padNumber,
        latitude: r.latitude,
        longitude: r.longitude,
        notes: r.notes
    }),

    recycling: (r) => ({
        id: r.id,
        createdAt: r.createdAt,
        location: r.location,
        parish: r.parish,
        latitude: r.latitude,
        longitude: r.longitude,
        notes: r.notes,
        services: (r.services || []).join(",")
    }),

    vehicles: (r) => ({
        make: r.make,
        model: r.model,
        color: r.color,
        cylinderCapacity: r.cylinderCapacity,
        weight: r.weight,
        co2Emissions: r.co2Emissions,
        fuelType: r.fuelType,
        firstRegisteredAt: r.firstRegisteredAt,
        firstRegisteredInJerseyAt: r.firstRegisteredInJerseyAt
    }),

    carparks: (r) => ({
        id: r.id,
        name: r.name,
        surfaceType: r.surfaceType,
        spaces: r.spaces,
        disabledSpaces: r.disabledSpaces,
        parentChildSpaces: r.parentChildSpaces,
        electricChargingSpaces: r.electricChargingSpaces,
        multiStorey: r.multiStorey,
        ownerName: r.owner?.name ?? null,
        paymentMethods: (r.paymentMethods || []).join(","),
        notes: r.notes,
        latitude: r.latitude,
        longitude: r.longitude,
        payByPhoneCode: r.payByPhoneCode,
        type: r.type
    }),

    foi: (r) => ({
        id: r.id,
        title: r.title,
        author: r.author,
        producer: r.producer,
        publishDate: r.publishDate
    })
}