@{%
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

%}

# Pass your lexer object using the @lexer option
@lexer lexer

main   -> _ lines _ %nl:*
  #{% d => ({ "@lang" :
  #[{"@sigOut": { "@spawn":semaIR.synth('mix',d[1])}}]
  #})
  #%}
  {%
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
%}


lines -> line _ %nl _ lines
  {% d => [d[0]].concat(d[4]) %}
  |
  # keep first element = last statement in line
  line

# Separate each statement w/ comma
line ->
  statement _ %comma _ line

  {% d => d[0].concat(d[4]) %}
  |
  statement {% id %}

#statement -> functionCall | vowelCall | sigpCall
#each statement should return an array of spawnable objects
statement -> jsStatement | opStatement | outStatement {% id %}

jsStatement -> sender __  %jsOperator setter
{% d => {
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
} %}

opStatement -> sender __ %operator:? setter
{% d => {
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
} %}

outStatement -> sender __ %operator:?
{% d => {
    var obj = null;
    var op = d[2] ? operatorMap[d[2]] : 'add';
    //Create branches based on operator
    return {
      sigout: true,
      operator: op,
      spawn: d[0]
    }
} %}


sender -> sigpCall {% id %}
#| wovelCall {% d => d[0] %}
| functionCall {% id %}
| getter {% d => semaIR.getvar(d[0].value) %}

#Pass this on, since we need to modify it later
setter -> %variable {% id %}

#Returns tree object
getter -> %variable {% id %}

functionCall -> %fun

vowelCall -> %vowel

sigpCall -> %startSigp %sigpFunc (__ sigpParams):? %endSigp
{% d => semaIR.synth(d[1].value, d[2][1])  %}

sigpParams ->
  sigpParamElement                                                   {% (d) => d[0] %}
  |
  sigpParamElement __ sigpParams                             {% d => [d[0]].concat(d[2]) %}

sigpParamElement ->
    %number                                                     {% (d) => ({"@num":d[0]}) %}
    |
    %variable                                                   {% (d) => semaIR.getvar(d[0]) %}
    |
    sigpCall




# Whitespace

_  -> wschar:*                                                {% function(d) {return null;} %}
__ -> wschar:+                                                {% function(d) {return null;} %}

wschar -> %ws                                                 {% id %}
