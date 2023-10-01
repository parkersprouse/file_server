import path from 'node:path';

/**
 * GET /*
 */
export default {
  method: 'GET',
  path: '/{any*}',
  handler(request, hapi) {
    try {
      return hapi.file(path.join(hapi.request.server.settings.app.__dirname, 'server', request.path), { confine: false });
    } catch {
      return hapi.view('404').code(404);
    }
  },
};
