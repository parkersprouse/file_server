/* eslint-disable no-invalid-this, prefer-rest-params */

function reduceOp(args, reducer) {
  const spread_args = [...args];
  spread_args.pop(); // => options
  const first = spread_args.shift();
  return spread_args.reduce(reducer, first);
}

export function initTemplateEngine(handlebars) {
  handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
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

export default {
  initTemplateEngine,
};
