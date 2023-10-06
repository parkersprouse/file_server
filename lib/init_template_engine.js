/* eslint-disable no-invalid-this */

export function initTemplateEngine(handlebars) {
  handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });

  const reduceOp = function (args, reducer) {
    args = [...args];
    args.pop(); // => options
    const first = args.shift();
    return args.reduce(reducer, first);
  };

  handlebars.registerHelper({
    eq() {
      return reduceOp(arguments, (a, b) => a === b);
    },
    ne() {
      return reduceOp(arguments, (a, b) => a !== b);
    },
    lt() {
      return reduceOp(arguments, (a, b) => a < b);
    },
    gt() {
      return reduceOp(arguments, (a, b) => a > b);
    },
    lte() {
      return reduceOp(arguments, (a, b) => a <= b);
    },
    gte() {
      return reduceOp(arguments, (a, b) => a >= b);
    },
    and() {
      return reduceOp(arguments, (a, b) => a && b);
    },
    or() {
      return reduceOp(arguments, (a, b) => a || b);
    },
  });
}

export default {
  initTemplateEngine,
};
