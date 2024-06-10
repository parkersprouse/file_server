import fs from 'node:fs';
import path from 'node:path';

/**
 * GET /*
 */
export default {
  method: 'GET',
  path: '/{any*}',

  handler(request, hapi) {
    try {
      const asset_path = path.join(request.server.settings.app.__dirname, 'server', request.path);
      fs.statSync(asset_path, { throwIfNoEntry: true });
      return hapi.file(asset_path, { confine: false });
    } catch {
      return hapi.view('404').code(200);
    }
  },
};
