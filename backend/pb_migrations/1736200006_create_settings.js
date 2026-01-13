/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("settings");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "settings",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
            {
                name: "id",
                type: "text"
            },
            {
                name: "created",
                type: "autodate",
                onCreate: true,
                onUpdate: false
            },
            {
                name: "updated",
                type: "autodate",
                onCreate: true,
                onUpdate: true
            },
            {
                type: "text",
                name: "stationName",
                required: false,
                max: 100
            },
            {
                type: "text",
                name: "stationSlogan",
                required: false,
                max: 200
            },
            {
                type: "url",
                name: "streamUrl",
                required: false
            },
            {
                type: "text",
                name: "heroImage",
                required: false
            },
            {
                type: "text",
                name: "heroTitle",
                required: false,
                max: 200
            },
            {
                type: "text",
                name: "heroSubtitle",
                required: false,
                max: 300
            },
            {
                type: "email",
                name: "email",
                required: false
            },
            {
                type: "text",
                name: "phone",
                required: false,
                max: 50
            },
            {
                type: "text",
                name: "address",
                required: false,
                max: 500
            },
            {
                type: "text",
                name: "businessHours",
                required: false,
                max: 200
            },
            {
                type: "email",
                name: "supportEmail",
                required: false
            },
            {
                type: "url",
                name: "facebookUrl",
                required: false
            },
            {
                type: "url",
                name: "twitterUrl",
                required: false
            },
            {
                type: "url",
                name: "instagramUrl",
                required: false
            },
            {
                type: "url",
                name: "youtubeUrl",
                required: false
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("settings");
        app.delete(collection);
    } catch (e) { }
});
