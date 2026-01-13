/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("tracks");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "tracks",
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
                name: "artist",
                required: true,
                max: 100
            },
            {
                type: "text",
                name: "albumName",
                required: false,
                max: 200
            },
            {
                type: "text",
                name: "coverImageId",
                required: false
            },
            {
                type: "date",
                name: "playedAt",
                required: false
            },
            {
                type: "text",
                name: "show",
                required: false
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("tracks");
        app.delete(collection);
    } catch (e) { }
});
