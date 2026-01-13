/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("news");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "news",
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
                name: "content",
                required: false
            },
            {
                type: "text",
                name: "summary",
                required: false,
                max: 500
            },
            {
                type: "text",
                name: "author",
                required: false,
                max: 100
            },
            {
                type: "date",
                name: "publishDate",
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
                type: "json",
                name: "tags",
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
        const collection = app.findCollectionByNameOrId("news");
        app.delete(collection);
    } catch (e) { }
});
