import { IDumper, DumpMetadata } from './dumper.interface';
import { Writable } from 'stream';
import { MongoClient } from 'mongodb';

export class MongoDumper implements IDumper {
    async dump(connectionString: string, stream: Writable): Promise<DumpMetadata> {
        const client = new MongoClient(connectionString);
        await client.connect();

        try {
            const db = client.db();
            const collections = await db.listCollections().toArray();

            const metadata: DumpMetadata = {
                totalRows: 0,
                collectionCounts: {},
                indexes: []
            };

            for (const col of collections) {
                const name = col.name;
                const collection = db.collection(name);

                const count = await collection.countDocuments();
                metadata.collectionCounts[name] = count;
                metadata.totalRows += count;

                // Fetch Indexes
                const indexes = await collection.indexes();
                indexes.forEach(idx => {
                    metadata.indexes!.push({ collection: name, key: idx.key, name: idx.name });
                });

                // Stream documents
                const cursor = collection.find();

                await new Promise<void>((resolve, reject) => {
                    const docStream = cursor.stream();

                    docStream.on('data', (doc) => {
                        const json = JSON.stringify({ type: 'data', collection: name, doc }) + '\n';
                        stream.write(json);
                    });

                    docStream.on('end', resolve);
                    docStream.on('error', reject);
                });
            }

            return metadata;
        } finally {
            await client.close();
            stream.end();
        }
    }
}
