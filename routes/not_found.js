export default {
  method: '*',
  path: '/{any*}',

  handler(_request, hapi) {
    return hapi.view('404').code(404);
  },
};
