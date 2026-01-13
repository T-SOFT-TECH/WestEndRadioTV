/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("events");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "events",
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
                name: "title",
                required: true,
                max: 200
            },
            {
                type: "editor",
                name: "description",
                required: false
            },
            {
                type: "date",
                name: "startDate",
                required: false
            },
            {
                type: "date",
                name: "endDate",
                required: false
            },
            {
                type: "text",
                name: "location",
                required: false,
                max: 200
            },
            {
                type: "text",
                name: "category",
                required: false,
                max: 100
            },
            {
                type: "text",
                name: "organizer",
                required: false,
                max: 100
            },
            {
                type: "text",
                name: "imageId",
                required: false
            },
            {
                type: "text",
                name: "slug",
                required: false,
                max: 200
            },
            {
                type: "url",
                name: "ticketLink",
                required: false
            },
            {
                type: "bool",
                name: "featured",
                required: false
            },
            {
                type: "bool",
                name: "active",
                required: false
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("events");
        app.delete(collection);
    } catch (e) { }
});
