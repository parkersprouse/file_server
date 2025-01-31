/* eslint-disable no-invalid-this, prefer-rest-params -- usage justified in this context */
function reduceOp(args, reducer) {
  const spread_args = [...args];
  spread_args.pop(); // => options
  const first = spread_args.shift();
  return spread_args.reduce((accumulator, element, index, array) =>
    reducer(accumulator, element, index, array), first);
}

export function initTemplateEngine(handlebars) {
  handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper('ifStartsWith', function (arg1, arg2, options) {
    if (typeof arg1 !== 'string' || typeof arg2 !== 'string') options.inverse(this);
    return (arg1.startsWith(arg2)) ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper({
    and() { return reduceOp(arguments, (a, b) => a && b); },
    eq() { return reduceOp(arguments, (a, b) => a === b); },
    gt() { return reduceOp(arguments, (a, b) => a > b); },
    gte() { return reduceOp(arguments, (a, b) => a >= b); },
    lt() { return reduceOp(arguments, (a, b) => a < b); },
    lte() { return reduceOp(arguments, (a, b) => a <= b); },
    ne() { return reduceOp(arguments, (a, b) => a !== b); },
    or() { return reduceOp(arguments, (a, b) => a || b); },
  });
}
/* eslint-enable no-invalid-this, prefer-rest-params */

export default {
  initTemplateEngine,
};
