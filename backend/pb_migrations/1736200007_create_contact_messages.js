/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const existing = app.findCollectionByNameOrId("contact_messages");
        app.delete(existing);
    } catch (e) { }

    const collection = new Collection({
        name: "contact_messages",
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
                type: "text",
                name: "name",
                required: true,
                max: 100
            },
            {
                type: "email",
                name: "email",
                required: true
            },
            {
                type: "text",
                name: "subject",
                required: false,
                max: 200
            },
            {
                type: "text",
                name: "message",
                required: true
            },
            {
                type: "bool",
                name: "read",
                required: false
            }
        ]
    });

    app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("contact_messages");
        app.delete(collection);
    } catch (e) { }
});
