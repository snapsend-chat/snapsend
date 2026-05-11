const key = require("./key.txt");
let letters = "\nabcdefgh.><ijklm'\"\/nopq5678_+={}[];:9`rstuv%^&*()|?,wxABCDLMNOPKVWQRSTUEFGHIJXYZyz012 34~!@#$-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
letters = letters.split("");
const range = 4;
let final = [];
const getIndex = l => {
    for (let i in letters) {
        if (letters[i] == l) {
            return i - range;
        }
    }
};

const encrypt = secret => {
    secret = secret.split("");
    for (let i in secret) {
        let f = getIndex(secret[i]);
        f = (f / range / range).toString();
        final.push(f);
    }
    const f = final.join("|");
    const enc = btoa(unescape(encodeURIComponent(f)));
    final.length = 0;
    return enc;
}

const decrypt = secret => {
    secret = atob(secret);
    secret = secret.split("|");
    let br = [];
    for (let i in secret) {
        let r = secret[i];
        r = r * range * range + range;
        br.push(letters[r]);
    }
    return br.join("");
}
function encode(email, password) {
  let e = `${email}_${password}`;
  e = e.split("_");
  for(let i = 0; i < e.length; i++) e[i] = encrypt(e[i]);
  e = e.join("_");
  return e;
}

function decode(seed) {
  let e = seed;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  e = e.split("_");
  for(let i = 0; i < e.length; i++) e[i] = decrypt(e[i]);
  if(!emailRegex.test(e[0])) {
    throw new Error('invalid token');
  } else {
    return e;
  }
}
  
module.exports = { encrypt, decrypt, encode, decode }