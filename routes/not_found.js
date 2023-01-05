export default {
  method: '*',
  path: '/{any*}',
  handler: function (_request, h) {
    return h.view('404').code(404);
  },
};
