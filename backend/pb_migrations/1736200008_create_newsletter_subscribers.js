/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("newsletter_subscribers");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "newsletter_subscribers",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "",
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
                type: "email",
                name: "email",
                required: true
            },
            {
                type: "date",
                name: "subscribedAt",
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
        const collection = app.findCollectionByNameOrId("newsletter_subscribers");
        app.delete(collection);
    } catch (e) { }
});
