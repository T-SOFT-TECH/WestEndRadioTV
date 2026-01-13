/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("episodes");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "episodes",
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
                type: "text",
                name: "showId",
                required: false
            },
            {
                type: "url",
                name: "audioUrl",
                required: false
            },
            {
                type: "number",
                name: "duration",
                required: false
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
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("episodes");
        app.delete(collection);
    } catch (e) { }
});
