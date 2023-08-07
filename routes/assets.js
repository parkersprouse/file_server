import path from 'path';

/**
 * GET /assets/*
 */
export default {
  method: 'GET',
  path: '/assets/{any*}',
  handler: function (request, h) {
    try {
      return h.file(path.join(h.request.server.settings.app.__dirname, request.path), { confine: false });
    } catch (e) {
      return h.view('404').code(404);
    }
  },
};
