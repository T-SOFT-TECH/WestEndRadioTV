/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("shows");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "shows",
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
                type: "text",
                name: "host",
                required: true,
                max: 100
            },
            {
                type: "editor",
                name: "description",
                required: false
            },
            {
                type: "text",
                name: "startTime",
                required: true,
                max: 10
            },
            {
                type: "text",
                name: "endTime",
                required: true,
                max: 10
            },
            {
                type: "json",
                name: "days",
                required: false
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
                type: "bool",
                name: "active",
                required: false
            },
            {
                type: "bool",
                name: "featured",
                required: false
            },
            {
                type: "bool",
                name: "isLive",
                required: false
            },
            {
                type: "text",
                name: "hostImages",
                required: false
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("shows");
        app.delete(collection);
    } catch (e) { }
});
