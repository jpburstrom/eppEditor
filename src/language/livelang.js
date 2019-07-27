// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

var semaIR = require('./semaIR.js');

const moo = require("moo"); // this 'require' creates a node dependency

const lexer = moo.compile({
  //vowels
  vowel: /[aeyuioåöä]+/,
  operator: /[\-+*/^]/,
  //function: consonant + any letter
  //in practice, this is OSC address per string
  // /1/pi
  jsOperator: '_',
  fun: /[^(][b-df-hj-np-tv-z][a-z]/,
  //comma
  comma: /,/,
  //new line
  nl: {match: /\r\n|\r|\n/, lineBreaks:true},
  //whitespace
  ws: /[ \t]/,
  //Support for calling sigp functions directly
  startSigp: '(',
  endSigp: ')',
  sigpFunc: /[a-zA-Z][a-zA-Z0-9]+/,
  number:  /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
  //variable: single letter consonant
  variable: /[b-df-hj-np-tv-z]/,
});

const operatorMap = {
  '*': 'mul',
  '+': 'add',
  '-': 'sub',
  '/': 'div',
  '^': 'pow',
}

const senderTree = (thing) => {
  var out = null;
  switch(thing.type) {
    case 'variable':
      out = semaIR.getvar(thing.value)
      break;
  }
  return out;
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["_", "lines", "_", "main$ebnf$1"], "postprocess": 
          d => {
          var lang = [];
          var out = [];
        
          if (d[1].length > 0) {
            d[1].forEach(line => {
              if (line.length > 0) {
                line.forEach(statement => {
                  if (statement.sigout === true) {
                    out.push(statement.spawn)
                  } else {
                    lang.push({ "@spawn": statement.spawn });
                  }
                })
              }
            })
            lang.push({ "@spawn": semaIR.synth('mix', out) });
          }
          return { "@lang" : lang }
        }
        },
    {"name": "lines", "symbols": ["line", "_", (lexer.has("nl") ? {type: "nl"} : nl), "_", "lines"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "lines", "symbols": ["line"]},
    {"name": "line", "symbols": ["statement", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "line"], "postprocess": d => d[0].concat(d[4])},
    {"name": "line", "symbols": ["statement"], "postprocess": id},
    {"name": "statement", "symbols": ["jsStatement"]},
    {"name": "statement", "symbols": ["opStatement"]},
    {"name": "statement", "symbols": ["outStatement"], "postprocess": id},
    {"name": "jsStatement", "symbols": ["sender", "__", (lexer.has("jsOperator") ? {type: "jsOperator"} : jsOperator), "setter"], "postprocess":  d => {
            var index = d[3].value.charCodeAt(0);
            return {
              spawn: [
                //Send sender to JS, variable ascii code as ID
                semaIR.synth("toJS", [index, d[0]]),
                //Get value back and put into variable
                semaIR.setvar(
                  d[3].value,
                  semaIR.synth("fromJS", [index])
                )
              ]
            }
        } },
    {"name": "opStatement$ebnf$1", "symbols": [(lexer.has("operator") ? {type: "operator"} : operator)], "postprocess": id},
    {"name": "opStatement$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "opStatement", "symbols": ["sender", "__", "opStatement$ebnf$1", "setter"], "postprocess":  d => {
            var obj, varname = d[3].value;
            if (!d[2]) {
              obj = semaIR.setvar(varname, d[0]);
            } else {
              obj = semaIR.setvar(d3['value'],
                semaIR.synth(operatorMap[d[2]], d[0], semaIR.getvar(varname))
              )
            };
            return {
              line: d[3].line,
              spawn: [obj]
            }
        } },
    {"name": "outStatement$ebnf$1", "symbols": [(lexer.has("operator") ? {type: "operator"} : operator)], "postprocess": id},
    {"name": "outStatement$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "outStatement", "symbols": ["sender", "__", "outStatement$ebnf$1"], "postprocess":  d => {
            var obj = null;
            var op = d[2] ? operatorMap[d[2]] : 'add';
            //Create branches based on operator
            return {
              sigout: true,
              operator: op,
              spawn: d[0]
            }
        } },
    {"name": "sender", "symbols": ["sigpCall"], "postprocess": id},
    {"name": "sender", "symbols": ["functionCall"], "postprocess": id},
    {"name": "sender", "symbols": ["getter"], "postprocess": d => semaIR.getvar(d[0].value)},
    {"name": "setter", "symbols": [(lexer.has("variable") ? {type: "variable"} : variable)], "postprocess": id},
    {"name": "getter", "symbols": [(lexer.has("variable") ? {type: "variable"} : variable)], "postprocess": id},
    {"name": "functionCall", "symbols": [(lexer.has("fun") ? {type: "fun"} : fun)]},
    {"name": "vowelCall", "symbols": [(lexer.has("vowel") ? {type: "vowel"} : vowel)]},
    {"name": "sigpCall$ebnf$1$subexpression$1", "symbols": ["__", "sigpParams"]},
    {"name": "sigpCall$ebnf$1", "symbols": ["sigpCall$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "sigpCall$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "sigpCall", "symbols": [(lexer.has("startSigp") ? {type: "startSigp"} : startSigp), (lexer.has("sigpFunc") ? {type: "sigpFunc"} : sigpFunc), "sigpCall$ebnf$1", (lexer.has("endSigp") ? {type: "endSigp"} : endSigp)], "postprocess": d => semaIR.synth(d[1].value, d[2][1])},
    {"name": "sigpParams", "symbols": ["sigpParamElement"], "postprocess": (d) => d[0]},
    {"name": "sigpParams", "symbols": ["sigpParamElement", "__", "sigpParams"], "postprocess": d => [d[0]].concat(d[2])},
    {"name": "sigpParamElement", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (d) => ({"@num":d[0]})},
    {"name": "sigpParamElement", "symbols": [(lexer.has("variable") ? {type: "variable"} : variable)], "postprocess": (d) => semaIR.getvar(d[0])},
    {"name": "sigpParamElement", "symbols": ["sigpCall"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
