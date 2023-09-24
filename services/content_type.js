import mmmagic from 'mmmagic';

const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);

export function getType(path) {
  return new Promise((resolve, reject) => {
    magic.detectFile(path, (err, result) => {
      if (err) reject();
      resolve(result);
    });
  });
}

export default {
  getType,
};
