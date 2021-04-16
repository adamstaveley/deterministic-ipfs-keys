# Deterministic IPFS keys

Creates an IPFS (libp2p) identity with secp256k1 keys from a username and password

## Running

```
$ yarn
$ node index.js <your_password>
```

You should see output like
```
derived public key: CAISIQL8nW411eLuqEW32GjKWU7IoBAcsYtRQv++yzbiGsLMvw==
...
using IPFS identity: {
  id: '16Uiu2HAmCRmxBNreZJmDCVyDcKck5qqssBiSpCZyT6KfvZ4WuQ1t',
  publicKey: 'CAISIQL8nW411eLuqEW32GjKWU7IoBAcsYtRQv++yzbiGsLMvw=='
}
```

Next, delete the IPFS repo (keys are cached, which ignores your private key in the next IPFS instantiation)
```
rm -rf /tmp/key/.<your_password>
```

Run the CLI again with the same password and you should see the same output as before.

## Caveats

See `index.js` for specific comments. 
