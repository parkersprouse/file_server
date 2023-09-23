import mmmagic from 'mmmagic';

const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);

export async function getType(path) {
  return new Promise((resolve, reject) => {
    magic.detectFile(path, (err, result) => {
      if (err) reject();
      console.log(result);
      resolve(result);
    });
  });
}

export default {
  getType,
};
