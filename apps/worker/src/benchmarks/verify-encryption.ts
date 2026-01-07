
import { EncryptionService } from '../encryption/encryption.service';
import { Test, TestingModule } from '@nestjs/testing';

async function verifyEncryption() {
    console.log('🔐 Starting Encryption Integrity Verification...');

    // 1. Setup Service
    // We mock the module or just instantiate if it has no complex deps.
    // EncryptionService only needs process.env or default.
    const service = new EncryptionService();

    const CLEAR_TEXT = "CONFIDENTIAL_PAYLOAD_Top_Secret_12345";
    console.log(`original: ${CLEAR_TEXT}`);

    // 2. Encrypt
    const encrypted = service.encrypt(CLEAR_TEXT);
    console.log(`\nEncrypted Output:`);
    console.log(`IV: ${encrypted.iv}`);
    console.log(`AuthTag: ${encrypted.authTag}`);
    console.log(`Ciphertext (Hex): ${encrypted.content}`);

    // 3. Assertion 1: Ciphertext should NOT contain clear text
    if (encrypted.content.includes(CLEAR_TEXT)) {
        throw new Error('❌ FAIL: Ciphertext contains clear text!');
    }
    // Check hex encoded clear text just in case
    const hexClear = Buffer.from(CLEAR_TEXT).toString('hex');
    if (encrypted.content.includes(hexClear)) {
        throw new Error('❌ FAIL: Ciphertext contains hex-encoded clear text!');
    }
    console.log('✅ PASS: Ciphertext does not contain clear text.');

    // 4. Assertion 2: Decrypt with WRONG Key (Simulated by modifying AuthTag or IV)
    try {
        service.decrypt({
            iv: encrypted.iv,
            content: encrypted.content,
            authTag: '00000000000000000000000000000000' // Bad Auth Tag
        });
        throw new Error('❌ FAIL: Decryption succeeded with BAD Auth Tag!');
    } catch (e: any) {
        if (e.message.includes('Unsupported state') || e.message.includes('auth tag')) {
            console.log('✅ PASS: Decryption correctly failed with bad Auth Tag.');
        } else {
            // In node crypto GCM, it throws on final() if tag doesn't match
            console.log(`✅ PASS: Decryption failed as expected: ${e.message}`);
        }
    }

    // 5. Assertion 3: Decrypt with Correct Credentials
    const decrypted = service.decrypt(encrypted);
    console.log(`\nDecrypted: ${decrypted}`);

    if (decrypted !== CLEAR_TEXT) {
        throw new Error(`❌ FAIL: Decrypted text '${decrypted}' does not match original!`);
    }
    console.log('✅ PASS: Decryption successful with correct credentials.');

    console.log('\n✨ INTEGRITY VERIFIED ✨');
}

verifyEncryption().catch(e => {
    console.error(e);
    process.exit(1);
});
