import { IRestorer, RestoreOptions } from './restorer.interface';
import { Readable } from 'stream';
import { MongoClient } from 'mongodb';
import split2 from 'split2';

export class MongoRestorer implements IRestorer {
    async restore(connectionString: string, stream: Readable, options: RestoreOptions = {}): Promise<void> {
        const client = new MongoClient(connectionString);
        await client.connect();
        const db = client.db();

        const { tables: collections, mode = 'append' } = options;
        const clearedCollections = new Set<string>();

        try {
            const lineStream = stream.pipe(split2(JSON.parse));

            for await (const line of lineStream) {
                if (line.type === 'data') {
                    const { collection, doc } = line;

                    // Filter
                    if (collections && collections.length > 0 && !collections.includes(collection)) {
                        continue;
                    }

                    // Overwrite logic - DeleteMany once per collection
                    if (mode === 'overwrite' && !clearedCollections.has(collection)) {
                        await db.collection(collection).deleteMany({});
                        clearedCollections.add(collection);
                    }

                    if (doc._id) {
                        try {
                            await db.collection(collection).replaceOne(
                                { _id: doc._id },
                                doc,
                                { upsert: true }
                            );
                        } catch (e) {
                            // ignore specifics
                        }
                    } else {
                        await db.collection(collection).insertOne(doc);
                    }
                }
            }
        } finally {
            await client.close();
        }
    }
}
