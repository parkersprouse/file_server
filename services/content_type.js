import mmmagic from '@picturae/mmmagic';

const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);

export function getType(path) {
  return new Promise((resolve, reject) => {
    magic.detectFile(path, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}

export default {
  getType,
};
