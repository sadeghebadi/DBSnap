import { MongoClient } from 'mongodb';
import { PassThrough } from 'stream';
import { IDatabaseExtractor, ExtractorOptions, ExtractionResult } from './base.extractor.js';

export class MongoExtractor implements IDatabaseExtractor {
    async extract(options: ExtractorOptions): Promise<ExtractionResult> {
        const auth = options.username && options.password
            ? `${encodeURIComponent(options.username)}:${encodeURIComponent(options.password)}@`
            : '';
        const uri = `mongodb://${auth}${options.host}:${options.port}/${options.database}?serverSelectionTimeoutMS=5000`;

        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db(options.database);
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        const outputStream = new PassThrough();

        (async () => {
            try {
                outputStream.write(JSON.stringify({
                    type: 'header',
                    metadata: { engine: 'MongoDB', collections: collectionNames, timestamp: new Date().toISOString() }
                }) + '\n');

                for (const name of collectionNames) {
                    const indexes = await db.collection(name).indexes();
                    outputStream.write(JSON.stringify({
                        type: 'collection_start',
                        name,
                        schema: {
                            indexes
                        }
                    }) + '\n');

                    const cursor = db.collection(name).find({});
                    while (await cursor.hasNext()) {
                        const doc = await cursor.next();
                        outputStream.write(JSON.stringify({ type: 'document', collection: name, data: doc }) + '\n');
                    }

                    outputStream.write(JSON.stringify({ type: 'collection_end', name }) + '\n');
                }

                outputStream.end();
            } catch (err) {
                outputStream.emit('error', err);
            } finally {
                await client.close();
            }
        })();

        return {
            stream: outputStream,
            metadata: {
                engine: 'MongoDB',
                tables: collectionNames // Use tables property for consistency in metadata
            }
        };
    }
}
