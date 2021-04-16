const crypto = require('libp2p-crypto');
const EC = require('elliptic').ec
const PeerId = require('peer-id');
const multihash = require('multihashes');
const sha3 = require('js-sha3');
const IPFS = require('ipfs-core');

const password = process.argv[2];
if (!password) {
    console.log('please provide password');
    process.exit(1);
}

const derivedKey = crypto.pbkdf2(
    Buffer.from(`some@one.com_${password}`),
    'salty', // keep this secret
    20000,
    512,
    'sha2-512'
);

const ec = new EC('secp256k1');
const keypair = ec.genKeyPair({ entropy: derivedKey })
const privateKeyString = keypair.getPrivate().toString('hex');
const publicKeyString = keypair.getPublic('hex');

// note we don't use this because IPFS calculates a different id (not using the sha3-256 hash)
// I didn't figure out how to create the "identity" type id in the spec
// https://github.com/libp2p/specs/blob/master/peer-ids/peer-ids.md
// also helpful in decoding multihashes: https://cid.ipfs.io/
const keyId = multihash.encode(
    Buffer.from(sha3.sha3_256(publicKeyString), 'hex'),
    'sha3-256'
);

const privateKey = new crypto.keys.supportedKeys.secp256k1.Secp256k1PrivateKey(
    Buffer.from(privateKeyString, 'hex')
);

// note: libp2p added secp256k1 curve support recently but it is not compatible with other IPFS keys (RSA, ed25519)
// only peers that both have secp256k1 keys can communicate with one another
const create = async () => {
    const peerId = new PeerId(keyId, privateKey);
    console.log('derived public key:', peerId.toJSON().pubKey);
    const ipfs = await IPFS.create({
        init: {
            algorithm: 'secp256k1',
            // we don't use the PeerID object here because IPFS calculates a different id
            // this could cause inconsistency so better to let IPFS calculate the id
            privateKey: Buffer.from(peerId.privKey.bytes).toString('base64'),
        },
        // need namespace repos or it'll just use whatever keys it finds
        // for this reason, to properly test determinism you should delete the repo and run the CLI again
        repo: `/tmp/key/.${password}`,
    });
    const { id, publicKey } = await ipfs.id();
    console.log('using IPFS identity:', { id, publicKey });

    await ipfs.stop();
    process.exit(0);
}

create();
