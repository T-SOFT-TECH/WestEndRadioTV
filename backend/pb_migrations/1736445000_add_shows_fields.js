/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = app.findCollectionByNameOrId("shows");

    // Add isLive field
    collection.fields.addAt(10, new Field({
        type: "bool",
        name: "isLive",
        required: false
    }));

    // Add hostImages field
    collection.fields.addAt(11, new Field({
        type: "text",
        name: "hostImages",
        required: false
    }));

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("shows");

    // Remove the added fields
    collection.fields.removeById(collection.fields.getById("isLive")?.id);
    collection.fields.removeById(collection.fields.getById("hostImages")?.id);

    return app.save(collection);
});
