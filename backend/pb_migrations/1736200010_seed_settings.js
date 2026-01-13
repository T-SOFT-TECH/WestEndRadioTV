/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = app.findCollectionByNameOrId("settings");

    // Check if record already exists
    try {
        const records = app.findRecordsByFilter("settings", "id != ''", "-created", 1);
        if (records.length > 0) {
            return; // Record exists
        }
    } catch (e) { }

    const record = new Record(collection);
    record.load({
        "stationName": "WestEnd Radio TV",
        "stationSlogan": "Your Community Radio",
        "heroTitle": "Welcome to WestEnd Radio",
        "heroSubtitle": "Broadcasting live 24/7"
    });

    app.save(record);
}, (app) => {
    // Optional revert logic
});
