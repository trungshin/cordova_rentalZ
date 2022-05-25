function otherDatabase(db) {
    db.transaction(function (tx) {
        // Create table PROPERTY.
        var query = `CREATE TABLE IF NOT EXISTS Property (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        Name TEXT UNIQUE NOT NULL,
                                                        Address TEXT NOT NULL,
                                                        City INTEGER NOT NULL,
                                                        District INTEGER NOT NULL,
                                                        Ward INTEGER NOT NULL,
                                                        Type INTEGER NOT NULL,
                                                        Furniture INTEGER NULL,
                                                        Bedroom INTEGER NOT NULL,
                                                        Price REAL NOT NULL,
                                                        Reporter TEXT NOT NULL,
                                                        Dateadd TEXT NOT NULL,
                                                        Timeadd TEXT NOT NULL)`;                                                       
                                                                                
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Property' successfully.`);
        }, transactionError);

        // Create table NOTE.
        var query = `CREATE TABLE IF NOT EXISTS Note (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    Comment TEXT NOT NULL,
                                                    Datetime DATE NOT NULL,
                                                    PropertyId INTEGER NOT NULL,
                                                    FOREIGN KEY (PropertyId) REFERENCES Property(Id) ON DELETE CASCADE)`;                                                       
                                    
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Note' successfully.`);
        }, transactionError);
    });
}