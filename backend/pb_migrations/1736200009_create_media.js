/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("media");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "media",
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
                type: "file",
                name: "file",
                required: false,
                maxSelect: 1,
                maxSize: 52428800
            },
            {
                type: "text",
                name: "description",
                required: false,
                max: 500
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("media");
        app.delete(collection);
    } catch (e) { }
});
